import type { PrismaClient } from "@kivro/database";

/** SELLERUX-020 — authoritative ledger/transfers; Worker cannot forge. */
export async function buildSellerEarningsDashboard(
  prisma: PrismaClient,
  sellerProfileId: string,
): Promise<{
  pendingCents: number;
  paidCents: number;
  transferCount: number;
  source: "SellerTransferRecord";
  disclaimer: string;
}> {
  const transfers = await prisma.sellerTransferRecord.findMany({
    where: { sellerProfileId },
    select: { amountCents: true, status: true },
  });
  let pendingCents = 0;
  let paidCents = 0;
  for (const t of transfers) {
    if (t.status === "PAID" || t.status === "COMPLETED") {
      paidCents += t.amountCents;
    } else {
      pendingCents += t.amountCents;
    }
  }
  return {
    pendingCents,
    paidCents,
    transferCount: transfers.length,
    source: "SellerTransferRecord",
    disclaimer: "Earnings derive from Kivro settlement records — not Worker-reported totals.",
  };
}
