/** HOST-NET-023 — bounded batches for managed hosting. */
export const NETSONS_DEFAULT_BATCH_LIMITS = {
  durableWork: 25,
  webhooks: 25,
  paymentReservationSweep: 50,
  pendingTransferSweep: 25,
  failureOpsJobs: 50,
  pauseTimeoutSweep: 50,
} as const;
