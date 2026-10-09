import type { DurableWorkPort } from "@kivro/cloud-core";

/** WSS wake-up after PostgreSQL commit (DEPLOYMENT-AWS / PORT-024). */
export async function signalWorkerAfterJobDispatch(
  durableWork: DurableWorkPort,
  input: { workerDeviceId: string; jobId: string },
): Promise<void> {
  await durableWork.enqueueWorkerSignal({
    workerDeviceId: input.workerDeviceId,
    signal: `DISPATCH:${input.jobId}`,
  });
}
