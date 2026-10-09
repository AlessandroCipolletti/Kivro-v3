/** Shared port for deferred/durable backend work (profile adapters in M20/M21). */
export type DurableWorkPort = {
  readonly profile: "netsons-db-cron" | "aws-managed-queue";
  scheduleJobPromotion(input: { jobId: string; runAt: string }): Promise<{ scheduled: boolean }>;
  enqueueWorkerSignal(input: { workerDeviceId: string; signal: string }): Promise<{ queued: boolean }>;
};

export function createInMemoryDurableWorkStub(
  profile: DurableWorkPort["profile"],
): DurableWorkPort {
  return {
    profile,
    async scheduleJobPromotion() {
      return { scheduled: true };
    },
    async enqueueWorkerSignal() {
      return { queued: true };
    },
  };
}
