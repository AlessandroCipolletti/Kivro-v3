/** Master Spec §23 — ledger entry types (amounts in cents, USD MVP). */

export const LEDGER_ENTRY_TYPES = [
  "CREDIT_PURCHASE",
  "JOB_RESERVE",
  "JOB_RELEASE",
  "JOB_CAPTURE",
  "SELLER_EARNING",
  "PLATFORM_FEE",
  "REFUND",
  "PAYOUT",
] as const;

export type LedgerEntryType = (typeof LEDGER_ENTRY_TYPES)[number];

export interface LedgerEntryDraft {
  userId: string;
  jobId?: string;
  idempotencyKey: string;
  type: LedgerEntryType;
  amountCents: number;
  currency: "USD";
}

export function buildLedgerIdempotencyKey(parts: string[]): string {
  return parts.join(":");
}
