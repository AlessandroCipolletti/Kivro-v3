import type { DurableWorkPort } from "@kivro/cloud-core";

/** HOST-NET-011/012 — signal is optimization; PostgreSQL job row is authoritative. */
export async function signalWorkerAfterJobDispatch(
  durableWork: DurableWorkPort,
  input: { workerDeviceId: string; jobId: string },
): Promise<void> {
  await durableWork.enqueueWorkerSignal({
    workerDeviceId: input.workerDeviceId,
    signal: `DISPATCH:${input.jobId}`,
  });
}
