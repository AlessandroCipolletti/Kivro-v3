/** §475 — a purchase cannot charge a quote after it expires. */
export function quoteChargeAllowed(expiresAt: Date, now: Date): boolean {
  return expiresAt.getTime() > now.getTime();
}

const SCHEDULE_DRIFT_MS = 15 * 60_000;

/** A moved eligibility window must be confirmed again before money moves. */
export function scheduleQuoteNeedsConfirmation(input: {
  quotedRunAt: Date | null;
  currentEligibleAt: Date | null;
}): boolean {
  if (!input.quotedRunAt) {
    return false;
  }
  if (!input.currentEligibleAt || Number.isNaN(input.currentEligibleAt.getTime())) {
    return true;
  }
  return Math.abs(input.quotedRunAt.getTime() - input.currentEligibleAt.getTime()) > SCHEDULE_DRIFT_MS;
}
