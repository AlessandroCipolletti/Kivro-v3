/** SELLERUX-040 — after first completed sale/run. */
export function buildFirstSaleExplanation(input: {
  jobId: string;
  buyerPaidCents: number;
  platformFeeCents: number;
  sellerNetCents: number;
  estimatedProviderCostCents: number | null;
  settlementStatus: string;
}): {
  title: string;
  lines: string[];
} {
  const lines = [
    `Buyer paid $${(input.buyerPaidCents / 100).toFixed(2)} (retail snapshot at purchase).`,
    `Kivro fee: $${(input.platformFeeCents / 100).toFixed(2)}.`,
    `Your net before provider costs: $${(input.sellerNetCents / 100).toFixed(2)}.`,
  ];
  if (input.estimatedProviderCostCents != null) {
    lines.push(
      `Estimated provider cost (seller-funded): $${(input.estimatedProviderCostCents / 100).toFixed(2)} — separate from platform fee.`,
    );
  }
  lines.push(`Settlement status: ${input.settlementStatus}.`);
  return { title: "First sale — what happened", lines };
}
