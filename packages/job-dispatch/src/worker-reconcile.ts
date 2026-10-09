import type { PrismaClient } from "@kivro/database";
import { recoverWorkerOfflineJob } from "./dispatch-service.js";

/** HOST-NET-014 / §591 — reconcile durable job state after Worker reconnect (polling or WSS). */
export async function reconcileWorkerSessionOnReconnect(
  prisma: PrismaClient,
  workerDeviceId: string,
): Promise<{
  openDispatched: number;
  running: number;
  expiredOffersRecovered: number;
}> {
  const now = new Date();
  const dispatched = await prisma.job.findMany({
    where: { workerDeviceId, status: "DISPATCHED" },
    select: { id: true, dispatchExpiresAt: true },
  });
  let expiredOffersRecovered = 0;
  for (const job of dispatched) {
    if (job.dispatchExpiresAt && job.dispatchExpiresAt < now) {
      const recovered = await recoverWorkerOfflineJob(prisma, job.id);
      if (!("error" in recovered)) {
        expiredOffersRecovered += 1;
      }
    }
  }
  const running = await prisma.job.count({
    where: {
      workerDeviceId,
      status: { in: ["ACCEPTED", "RUNNING", "PAUSE_REQUESTED", "RESUME_REQUESTED"] },
    },
  });
  return {
    openDispatched: dispatched.length,
    running,
    expiredOffersRecovered,
  };
}
