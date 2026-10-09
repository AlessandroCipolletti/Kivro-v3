import type { PrismaClient } from "@kivro/database";
import {
  buildSecurityWarnings,
  hasBlockingSecurityWarning,
  parseWorkerHealthReport,
} from "@kivro/seller-health";

/** Master Spec §390 — resume denied while blocking security conditions remain. */
export async function assertSellerMarketplaceResumeAllowed(
  prisma: PrismaClient,
  sellerProfileId: string,
): Promise<
  | { ok: true }
  | { error: "PLATFORM_SECURITY_PAUSE"; reason: string | null }
  | { error: "SECURITY_BLOCKS_RESUME"; warnings: string[] }
> {
  const profile = await prisma.sellerProfile.findUnique({
    where: { id: sellerProfileId },
  });
  if (profile?.platformSecurityPause) {
    return { error: "PLATFORM_SECURITY_PAUSE", reason: profile.platformSecurityPauseReason };
  }

  const devices = await prisma.workerDevice.findMany({
    where: { sellerProfileId, status: { not: "REVOKED" } },
  });
  const blockingTitles: string[] = [];
  for (const device of devices) {
    const report = parseWorkerHealthReport(device.lastHealthReport);
    const warnings = buildSecurityWarnings({
      report,
      deviceStatus: device.status,
      sellerEmergencyPause: false,
    }).filter((w) => w.code !== "EMERGENCY_PAUSE" && w.code !== "LOCAL_GLOBAL_PAUSE");
    if (hasBlockingSecurityWarning(warnings)) {
      blockingTitles.push(...warnings.filter((w) => w.blocking).map((w) => w.title));
    }
  }
  if (blockingTitles.length > 0) {
    return { error: "SECURITY_BLOCKS_RESUME", warnings: [...new Set(blockingTitles)] };
  }
  return { ok: true };
}
