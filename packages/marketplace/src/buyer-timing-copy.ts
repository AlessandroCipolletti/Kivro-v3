/** §454, §457, §459, §460 — buyer-facing timing without false precision. */
export function approximateStartLabel(now: Date, nextAvailableAt: Date): string {
  const minutes = Math.max(1, Math.round((nextAvailableAt.getTime() - now.getTime()) / 60_000));
  if (minutes < 60) {
    return `Starts in approximately ${minutes} min`;
  }
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest === 0
    ? `Starts in approximately ${hours}h`
    : `Starts in approximately ${hours}h ${rest}m`;
}

export const CHECKOUT_FUTURE_INTRO =
  "This service is not running right now. You can reserve it for its next availability.";

export const DELIVERY_PROMISE_COPY =
  "Kivro promises the earliest eligibility window. Time after the job starts is an estimate, not a guaranteed delivery minute.";

export const RESERVATION_FUNDS_COPY =
  "Credits are reserved now and released if the job never starts. Reserved value is not settled seller revenue.";

/** §394 — a buyer or seller cannot clear a platform security pause. */
export function securityPauseClearableBy(actor: "BUYER" | "SELLER" | "ADMIN" | "SYSTEM"): boolean {
  return actor === "ADMIN" || actor === "SYSTEM";
}
