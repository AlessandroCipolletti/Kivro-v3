import type { PrismaClient } from "@kivro/database";
import { isGlobalDispatchEnabled } from "@kivro/platform-policy";
import { evaluateAcceptingNewJobs } from "./accepting-jobs.js";
import { parseScheduleConfig } from "./capability-schedule.js";
import { computeNextAvailableAt } from "./next-available.js";

export type MarketplaceAvailabilitySummary = {
  capabilityId: string;
  status: string;
  accepting: boolean;
  nextAvailableAt: string | null;
};

/** §405 — search/agent payload: availability + next open time per capability. */
export async function summarizeMarketplaceAvailability(
  prisma: PrismaClient,
  capabilityIds: string[],
): Promise<MarketplaceAvailabilitySummary[]> {
  if (capabilityIds.length === 0) {
    return [];
  }
  const capabilities = await prisma.capability.findMany({
    where: { id: { in: capabilityIds }, status: "PUBLISHED" },
    include: {
      currentVersion: {
        include: {
          bindings: { include: { workerDevice: true } },
        },
      },
    },
  });
  const summaries: MarketplaceAvailabilitySummary[] = [];
  for (const capability of capabilities) {
    const binding = capability.currentVersion?.bindings[0];
    const device = binding?.workerDevice;
    const schedule = parseScheduleConfig(capability);
    let hasActiveJob = false;
    if (device) {
      hasActiveJob =
        (await prisma.job.count({
          where: {
            workerDeviceId: device.id,
            status: {
              in: [
                "DISPATCHED",
                "ACCEPTED",
                "STARTING",
                "RUNNING",
                "PAUSE_REQUESTED",
                "PAUSED",
                "RESUME_REQUESTED",
                "SECURITY_PAUSED",
                "UPLOADING_RESULT",
              ],
            },
          },
        })) > 0;
    }
    const evaluation = evaluateAcceptingNewJobs({
      capabilityPublished: true,
      schedule,
      workerDeviceStatus: device?.status ?? "OFFLINE",
      hasActiveJobOnWorker: hasActiveJob,
      globalDispatchEnabled: isGlobalDispatchEnabled(),
    });
    const next = computeNextAvailableAt(schedule);
    summaries.push({
      capabilityId: capability.id,
      status: evaluation.buyerAvailability,
      accepting: evaluation.accepting,
      nextAvailableAt: next?.toISOString() ?? null,
    });
  }
  return summaries;
}
