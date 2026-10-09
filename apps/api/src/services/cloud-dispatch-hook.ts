import type { PrismaClient } from "@kivro/database";
import { dispatchJobToWorker } from "@kivro/job-dispatch";
import { signalWorkerAfterJobDispatch as signalAwsWorkerAfterJobDispatch } from "@kivro/cloud-aws";
import { signalWorkerAfterJobDispatch as signalNetsonsWorkerAfterJobDispatch } from "@kivro/cloud-netsons";
import {
  controlPlaneMayAcceptNewExecutions,
  defaultControlPlaneIdForProfile,
  resolveActiveControlPlaneIdForNewExecutions,
} from "@kivro/cloud-core";
import { getActiveCloudComposition } from "../cloud-composition.js";

/** PostgreSQL-first dispatch then profile durable worker signal (Netsons polling / AWS WSS). */
export async function dispatchJobToWorkerWithProfileSignal(
  prisma: PrismaClient,
  input: { jobId: string; workerDeviceId: string; offerExpiresAt: Date },
) {
  const composition = getActiveCloudComposition();
  let executionControlPlaneId: string;
  try {
    executionControlPlaneId = resolveActiveControlPlaneIdForNewExecutions(process.env);
  } catch {
    executionControlPlaneId = defaultControlPlaneIdForProfile(composition.profile);
  }
  if (!controlPlaneMayAcceptNewExecutions(executionControlPlaneId, process.env)) {
    return { error: "CONTROL_PLANE_NOT_ACTIVE" };
  }
  const result = await dispatchJobToWorker(prisma, {
    ...input,
    executionControlPlaneId,
  });
  if ("error" in result) {
    return result;
  }
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
