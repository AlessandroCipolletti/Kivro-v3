/** §475 — a purchase cannot charge a quote after it expires. */
export function quoteChargeAllowed(expiresAt: Date, now: Date): boolean {
  return expiresAt.getTime() > now.getTime();
}
