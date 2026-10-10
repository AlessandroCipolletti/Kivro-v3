import type { PrismaClient } from "@kivro/database";
import {
  buildSecurityWarnings,
  deriveWorkerHealthLabel,
  parseWorkerHealthReport,
} from "@kivro/seller-health";

export type OnboardingStepId =
  | "pair_worker"
  | "worker_ready"
  | "create_capability"
  | "review_permissions"
  | "first_publish";

export type OnboardingStep = {
  id: OnboardingStepId;
  status: "complete" | "action_required" | "upcoming";
  title: string;
  detail: string;
};

/** SELLERUX-036 — pairing is satisfied by any non-revoked Worker, not devices[0]. */
export function summarizePairedWorkers(input: {
  devices: Array<{ name: string; ready: boolean }>;
}): { paired: boolean; workerReady: boolean; detail: string } {
  if (input.devices.length === 0) {
    return {
      paired: false,
      workerReady: false,
      detail: "Generate a pairing code in the browser and run kivro-worker pair.",
    };
  }
  const readyCount = input.devices.filter((device) => device.ready).length;
  const noun = input.devices.length === 1 ? "Worker" : "Workers";
  return {
    paired: true,
    workerReady: readyCount > 0,
    detail:
      readyCount > 0
        ? `${input.devices.length} ${noun} paired. ${readyCount} ready to publish.`
        : `${input.devices.length} ${noun} paired. None are ready yet.`,
  };
}

/** SELLERUX-001..003 — guided path to first safe publication. */
export async function buildSellerOnboardingStatus(
  prisma: PrismaClient,
  sellerProfileId: string,
): Promise<{ steps: OnboardingStep[]; nextAction: OnboardingStepId | null }> {
  const profile = await prisma.sellerProfile.findUnique({
    where: { id: sellerProfileId },
    include: {
      workerDevices: { where: { status: { not: "REVOKED" } } },
      capabilities: true,
    },
  });
  if (!profile) {
    return { steps: [], nextAction: null };
  }

  const deviceRows = profile.workerDevices.map((device) => {
    const report = parseWorkerHealthReport(device.lastHealthReport);
    const warnings = buildSecurityWarnings({
      report,
      deviceStatus: device.status,
      sellerEmergencyPause: profile.marketplaceEmergencyPause,
      platformSecurityPause: profile.platformSecurityPause,
      platformSecurityReason: profile.platformSecurityPauseReason,
    });
    const healthLabel = deriveWorkerHealthLabel({
      deviceStatus: device.status,
      lastSeenAt: device.lastSeenAt,
      report,
      sellerEmergencyPause: profile.marketplaceEmergencyPause,
      warnings,
    });
    return {
      name: device.name,
      ready:
        healthLabel !== "OFFLINE" &&
        healthLabel !== "NOT_READY" &&
        healthLabel !== "SECURITY_WARNING",
    };
  });
  const pool = summarizePairedWorkers({ devices: deviceRows });
  const paired = pool.paired;
  const workerReady = pool.workerReady;

  const hasDraft = profile.capabilities.some((c) => c.status === "DRAFT");
  const hasPublished = profile.capabilities.some((c) => c.status === "PUBLISHED");

  const steps: OnboardingStep[] = [
    {
      id: "pair_worker",
      status: paired ? "complete" : "action_required",
      title: "Pair your Worker",
      detail: pool.detail,
    },
    {
      id: "worker_ready",
      status: !paired ? "upcoming" : workerReady ? "complete" : "action_required",
      title: "Verify Worker health",
      detail: workerReady
        ? "Sandbox and OpenClaw checks look good."
        : "Run kivro-worker doctor and fix blockers before publishing.",
    },
    {
      id: "create_capability",
      status: hasDraft || hasPublished ? "complete" : paired ? "action_required" : "upcoming",
      title: "Create a capability draft",
      detail: "Use the guided wizard — no raw manifest required.",
    },
    {
      id: "review_permissions",
      status: hasDraft || hasPublished ? "complete" : "upcoming",
      title: "Review permissions & dependencies",
      detail: "Nothing from discovery is exposed until you consent and publish.",
    },
    {
      id: "first_publish",
      status: hasPublished ? "complete" : hasDraft ? "action_required" : "upcoming",
      title: "Publish safely",
      detail: "Readiness blockers must be clear; recommended items may remain.",
    },
  ];

  const nextAction =
    steps.find((s) => s.status === "action_required")?.id ??
    (hasPublished ? null : "first_publish");

  return { steps, nextAction };
}
