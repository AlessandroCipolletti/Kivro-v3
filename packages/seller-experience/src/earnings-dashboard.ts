import type { PrismaClient } from "@kivro/database";
import { summarizeScheduledDemand, type ScheduledDemandWindow } from "./scheduled-demand.js";

/** SELLERUX-020 — map authoritative transfer statuses into pending / available / paid. */
export function classifySellerTransferStatus(status: string): "pending" | "available" | "paid" {
  if (status === "TRANSFERRED" || status === "PAID" || status === "COMPLETED") {
    return "paid";
  }
  if (status === "RECORDED" || status === "DEV_LEDGER_ONLY") {
    return "available";
  }
  return "pending";
}

/** Earnings from SellerTransferRecord only — Worker totals are never an input. */
export async function buildSellerEarningsDashboard(
  prisma: PrismaClient,
  sellerProfileId: string,
): Promise<{
  pendingCents: number;
  availableCents: number;
  paidCents: number;
  transferCount: number;
  source: "SellerTransferRecord";
  disclaimer: string;
  scheduledDemand: {
    windows: ScheduledDemandWindow[];
    jobCount: number;
    reservedBuyerValueCents: number;
    estimatedSellerEarningsCents: number;
    settledRevenueCents: 0;
    note: string;
  };
}> {
  const transfers = await prisma.sellerTransferRecord.findMany({
    where: { sellerProfileId },
    select: { amountCents: true, status: true },
  });
  let pendingCents = 0;
  let availableCents = 0;
  let paidCents = 0;
  for (const t of transfers) {
    const bucket = classifySellerTransferStatus(t.status);
    if (bucket === "paid") {
      paidCents += t.amountCents;
    } else if (bucket === "available") {
      availableCents += t.amountCents;
    } else {
      pendingCents += t.amountCents;
    }
  }
  const scheduled = await prisma.job.findMany({
    where: { status: "SCHEDULED", capabilityVersion: { capability: { sellerProfileId } } },
    select: {
      scheduledRunAt: true,
      reservedAmountCents: true,
      sellerNetSnapshotCents: true,
      capabilityVersion: { select: { capability: { select: { estimatedDuration: true } } } },
    },
  });
  return {
    pendingCents,
    availableCents,
    paidCents,
    transferCount: transfers.length,
    source: "SellerTransferRecord",
    disclaimer: "Earnings derive from Kivro settlement records — not Worker-reported totals.",
    scheduledDemand: summarizeScheduledDemand(
      scheduled.map((job) => ({
        scheduledRunAt: job.scheduledRunAt,
        reservedAmountCents: job.reservedAmountCents,
        sellerNetSnapshotCents: job.sellerNetSnapshotCents,
        estimatedDurationMinutes: job.capabilityVersion.capability.estimatedDuration,
      })),
    ),
  };
}
