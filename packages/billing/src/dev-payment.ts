/** Dev-only payment shortcuts — impossible in production (mirrors auth pattern). */

export function isDevPaymentShortcutsEnabled(): boolean {
  return (
    process.env.NODE_ENV !== "production" &&
    process.env.KIVRO_DEV_PAYMENT_SHORTCUTS === "true"
  );
}

export function assertDevPaymentShortcutsAllowed(): void {
  if (!isDevPaymentShortcutsEnabled()) {
    throw new Error("DEV_PAYMENT_SHORTCUTS_FORBIDDEN");
  }
}
