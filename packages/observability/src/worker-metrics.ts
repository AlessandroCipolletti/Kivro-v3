import type { PrismaClient } from "@kivro/database";
import { parseWorkerHealthReport } from "@kivro/seller-health";

/** §35 — sanitized worker fleet metrics (no job content). */
export async function collectWorkerFleetMetrics(prisma: PrismaClient): Promise<{
  generatedAt: string;
  devicesTotal: number;
  devicesOnline: number;
  dockerOk: number;
  sandboxOk: number;
  openClawCompatible: number;
  runningJobsReported: number;
  sandboxCreationFailures24h: number;
}> {
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const devices = await prisma.workerDevice.findMany({
    where: { status: { not: "REVOKED" } },
    select: { status: true, lastHealthReport: true },
  });
  let dockerOk = 0;
  let sandboxOk = 0;
  let openClawCompatible = 0;
  for (const device of devices) {
    const report = parseWorkerHealthReport(device.lastHealthReport);
    if (!report) {
      continue;
    }
    if (report.dockerOk) {
      dockerOk += 1;
    }
    if (report.sandboxOk) {
      sandboxOk += 1;
    }
    if (report.openClawCompatible) {
      openClawCompatible += 1;
    }
  }
  const runningJobsReported = await prisma.job.count({
    where: {
      status: { in: ["RUNNING", "STARTING", "UPLOADING_RESULT"] },
      workerDeviceId: { not: null },
    },
  });
  const sandboxCreationFailures24h = await prisma.workerHealthEvent.count({
    where: {
      eventType: "SANDBOX_CREATE_FAILED",
      createdAt: { gte: since },
    },
  });
  return {
    generatedAt: new Date().toISOString(),
    devicesTotal: devices.length,
    devicesOnline: devices.filter((d) => d.status === "ONLINE").length,
    dockerOk,
    sandboxOk,
    openClawCompatible,
    runningJobsReported,
    sandboxCreationFailures24h,
  };
}
