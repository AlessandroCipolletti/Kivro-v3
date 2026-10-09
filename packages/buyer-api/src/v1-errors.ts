/** §324 — stable API error codes for programmatic clients. */
export function mapV1PaymentError(error: string): string {
  if (error === "INSUFFICIENT_CREDITS") {
    return "INSUFFICIENT_FUNDS";
  }
  return error;
}
