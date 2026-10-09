import type Stripe from "stripe";
import type { PrismaClient } from "@kivro/database";
import { createStripeClient } from "./stripe-provider.js";
import { isDevPaymentShortcutsEnabled } from "./dev-payment.js";

/** §24.2 — separate charge/transfer: move seller net to Connect account after ledger capture. */
export async function executeSellerStripeTransfer(
  prisma: PrismaClient,
  jobId: string,
  stripe: Stripe | null = createStripeClient(),
): Promise<{ transferId?: string; status: string }> {
  const record = await prisma.sellerTransferRecord.findUnique({
    where: { jobId },
    include: { sellerProfile: true },
  });
  if (!record) {
    return { status: "NO_RECORD" };
  }
  if (record.stripeTransferId) {
    return { transferId: record.stripeTransferId, status: record.status };
  }
  const destination = record.sellerProfile.stripeConnectedAccountId;
  if (!stripe || !destination) {
    const status = isDevPaymentShortcutsEnabled() ? "DEV_LEDGER_ONLY" : "PENDING_CONNECT";
    if (record.status !== status) {
      await prisma.sellerTransferRecord.update({
        where: { jobId },
        data: { status },
      });
    }
    return { status };
  }
  const transfer = await stripe.transfers.create(
    {
      amount: record.amountCents,
      currency: record.currency.toLowerCase(),
      destination,
      transfer_group: jobId,
      metadata: { jobId, sellerProfileId: record.sellerProfileId },
    },
    { idempotencyKey: record.idempotencyKey },
  );
  await prisma.sellerTransferRecord.update({
    where: { jobId },
    data: { stripeTransferId: transfer.id, status: "TRANSFERRED" },
  });
  return { transferId: transfer.id, status: "TRANSFERRED" };
}

export async function sweepPendingSellerTransfers(
  prisma: PrismaClient,
  limit = 25,
): Promise<{ attempted: number; transferred: number }> {
  const pending = await prisma.sellerTransferRecord.findMany({
    where: {
      status: { in: ["RECORDED", "PENDING_CONNECT"] },
      stripeTransferId: null,
    },
    take: limit,
  });
  let transferred = 0;
  const stripe = createStripeClient();
  for (const row of pending) {
    const result = await executeSellerStripeTransfer(prisma, row.jobId, stripe);
    if (result.status === "TRANSFERRED") {
      transferred += 1;
    }
  }
  return { attempted: pending.length, transferred };
}
