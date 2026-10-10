/** §461 — card authorizations are not held for an unbounded schedule. */
export const CARD_AUTHORIZATION_WINDOW_MS = 7 * 24 * 60 * 60 * 1000;

export function paymentMethodForSchedule(input: {
  scheduledRunAt?: Date;
  now?: Date;
}): "CARD_OR_CREDITS" | "PREPAID_CREDITS_ONLY" {
  if (!input.scheduledRunAt) {
    return "CARD_OR_CREDITS";
  }
  const now = input.now ?? new Date();
  if (input.scheduledRunAt.getTime() - now.getTime() > CARD_AUTHORIZATION_WINDOW_MS) {
    return "PREPAID_CREDITS_ONLY";
  }
  return "CARD_OR_CREDITS";
}
