import type { JobStatus } from "@kivro/domain";

/** Master Spec §439 — pause is not delivery; never settle while paused. */
export function sellerEarningSettlementAllowed(status: JobStatus): boolean {
  return status === "COMPLETED";
}

export function buyerFundsReleaseEligible(status: JobStatus): boolean {
  return (
    status === "REFUNDED" ||
    status === "CANCELLED" ||
    status === "TIMED_OUT" ||
    status === "FAILED_EXECUTION" ||
    status === "FAILED_POLICY" ||
    status === "REJECTED" ||
    status === "EXPIRED"
  );
}

export function fundsReservedWhilePaused(status: JobStatus): boolean {
  return (
    status === "PAUSED" ||
    status === "PAUSE_REQUESTED" ||
    status === "RESUME_REQUESTED" ||
    status === "SECURITY_PAUSED"
  );
}

export class SettlementWhilePausedError extends Error {
  constructor(readonly jobStatus: JobStatus) {
    super(`Seller settlement blocked while job is ${jobStatus}`);
    this.name = "SettlementWhilePausedError";
  }
}

export function assertSellerSettlementAllowed(status: JobStatus): void {
  if (!sellerEarningSettlementAllowed(status)) {
    throw new SettlementWhilePausedError(status);
  }
}
