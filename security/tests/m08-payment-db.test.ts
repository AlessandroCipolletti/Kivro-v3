import { beforeAll, describe, expect, it } from "vitest";
import { getPrismaClient } from "@kivro/database";
import {
  captureAndSettleJobPayment,
  getBuyerCreditBalanceCents,
  grantBuyerCredits,
  reconcileJobPaymentAfterTerminal,
  releaseJobPayment,
} from "@kivro/billing";

let dbReady = false;

beforeAll(async () => {
  if (!process.env.DATABASE_URL) {
    return;
  }
  try {
    const prisma = getPrismaClient();
    await prisma.$queryRaw`SELECT "priceTierId" FROM "Job" LIMIT 1`;
    dbReady = true;
  } catch {
    dbReady = false;
  }
});

describe("M08 payment ledger (database)", () => {
  it("grants credits idempotently and reads balance", async (ctx) => {
    if (!dbReady) {
      ctx.skip();
    }
    const prisma = getPrismaClient();
    const buyer = await prisma.user.findFirst({ where: { email: { contains: "@" } } });
    if (!buyer) {
      ctx.skip();
    }
    const externalId = `vitest-m08-${Date.now()}`;
    await grantBuyerCredits(prisma, {
      buyerId: buyer!.id,
      amountCents: 100,
      externalId,
    });
    const again = await grantBuyerCredits(prisma, {
      buyerId: buyer!.id,
      amountCents: 100,
      externalId,
    });
    expect(again.granted).toBe(false);
    const balance = await getBuyerCreditBalanceCents(prisma, buyer!.id);
    expect(balance.availableCents).toBeGreaterThanOrEqual(0);
  });

  it("release is safe when no reservation", async (ctx) => {
    if (!dbReady) {
      ctx.skip();
    }
    const prisma = getPrismaClient();
    const job = await prisma.job.findFirst({ where: { reservedAmountCents: null } });
    if (!job) {
      ctx.skip();
    }
    const first = await releaseJobPayment(prisma, job!.id);
    expect("error" in first || first.released === false).toBe(true);
  });

  it("capture rejects non-completed jobs", async (ctx) => {
    if (!dbReady) {
      ctx.skip();
    }
    const prisma = getPrismaClient();
    const job = await prisma.job.findFirst({ where: { status: { not: "COMPLETED" } } });
    if (!job) {
      ctx.skip();
    }
    const result = await captureAndSettleJobPayment(prisma, job!.id);
    expect(result).toEqual({ error: "JOB_NOT_COMPLETED" });
  });

  it("reconcile releases stale cancelled reservations", async (ctx) => {
    if (!dbReady) {
      ctx.skip();
    }
    const prisma = getPrismaClient();
    const job = await prisma.job.findFirst({
      where: { status: "CANCELLED", reservedAmountCents: { gt: 0 } },
    });
    if (!job) {
      ctx.skip();
    }
    await reconcileJobPaymentAfterTerminal(prisma, job!.id);
    const refreshed = await prisma.job.findUnique({ where: { id: job!.id } });
    expect(refreshed?.reservedAmountCents == null || refreshed.reservedAmountCents === 0).toBe(
      true,
    );
  });
});
