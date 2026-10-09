import type { PrismaClient } from "@kivro/database";
import { dispatchJobToWorker } from "@kivro/job-dispatch";
import { signalWorkerAfterJobDispatch } from "@kivro/cloud-netsons";
import { getActiveCloudComposition } from "../cloud-composition.js";

/** Dispatch with PostgreSQL-first commit then durable worker signal (HOST-NET-011/012). */
export async function dispatchJobToWorkerWithProfileSignal(
  prisma: PrismaClient,
  input: { jobId: string; workerDeviceId: string; offerExpiresAt: Date },
) {
  const result = await dispatchJobToWorker(prisma, input);
  if ("error" in result) {
    return result;
  }
  const composition = getActiveCloudComposition();
  if (composition.profile === "netsons") {
    await signalWorkerAfterJobDispatch(composition.durableWork, {
      workerDeviceId: input.workerDeviceId,
      jobId: input.jobId,
    });
  }
  return result;
}
