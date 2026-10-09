import type { PrismaClient } from "@kivro/database";
import { dispatchJobToWorker } from "@kivro/job-dispatch";
import { signalWorkerAfterJobDispatch as signalAwsWorkerAfterJobDispatch } from "@kivro/cloud-aws";
import { signalWorkerAfterJobDispatch as signalNetsonsWorkerAfterJobDispatch } from "@kivro/cloud-netsons";
import { getActiveCloudComposition } from "../cloud-composition.js";

/** PostgreSQL-first dispatch then profile durable worker signal (Netsons polling / AWS WSS). */
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
    await signalNetsonsWorkerAfterJobDispatch(composition.durableWork, {
      workerDeviceId: input.workerDeviceId,
      jobId: input.jobId,
    });
  } else if (composition.profile === "aws") {
    await signalAwsWorkerAfterJobDispatch(composition.durableWork, {
      workerDeviceId: input.workerDeviceId,
      jobId: input.jobId,
    });
  }
  return result;
}
