import type { PrismaClient } from "@kivro/database";

export function abuseAutoPauseReportThreshold(): number {
  const raw = process.env.KIVRO_ABUSE_AUTO_PAUSE_REPORTS;
  const n = raw ? Number.parseInt(raw, 10) : 5;
  return Number.isFinite(n) && n >= 2 ? n : 5;
}

/** §30 — deterministic triage after reports (no LLM). */
export async function evaluateCapabilityAbuseTriage(
  prisma: PrismaClient,
  capabilityId: string,
): Promise<{ paused: boolean; openReports: number }> {
  const openReports = await prisma.abuseReport.count({
    where: { capabilityId, status: "OPEN", targetType: "CAPABILITY" },
  });
  const threshold = abuseAutoPauseReportThreshold();
  if (openReports < threshold) {
    return { paused: false, openReports };
  }
  const updated = await prisma.capability.updateMany({
    where: { id: capabilityId, status: "PUBLISHED" },
    data: { status: "PAUSED" },
  });
  return { paused: updated.count > 0, openReports };
}

export async function suspendBuyerAccount(
  prisma: PrismaClient,
  userId: string,
): Promise<{ suspended: boolean }> {
  const updated = await prisma.user.updateMany({
    where: { id: userId, status: "ACTIVE" },
    data: { status: "SUSPENDED" },
  });
  return { suspended: updated.count > 0 };
}
