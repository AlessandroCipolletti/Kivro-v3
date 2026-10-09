/** M21 — bounded batches for AWS Lambda/EventBridge tick handlers. */
export const AWS_DEFAULT_BATCH_LIMITS = {
  durableWork: 25,
  webhooks: 25,
  sqsDrain: 10,
  paymentReservationSweep: 50,
} as const;
