import { describe, expect, it, vi } from "vitest";
import { appendLedgerEntry } from "./ledger-service.js";

/** M26-FAULT-001 — ambiguous duplicate ledger apply converges. */
describe("appendLedgerEntry idempotency (M26)", () => {
  it("M26-FAULT-001 returns created:false on duplicate idempotency key", async () => {
    const prisma = {
      ledgerEntry: {
        findUnique: vi.fn(async () => ({ id: "le-existing" })),
        create: vi.fn(),
      },
    };
    const result = await appendLedgerEntry(prisma as never, {
      userId: "u1",
      jobId: "j1",
      type: "JOB_CAPTURE",
      amountCents: 100,
      idempotencyKey: "job:j1:capture",
    });
    expect(result).toEqual({ created: false, entryId: "le-existing" });
    expect(prisma.ledgerEntry.create).not.toHaveBeenCalled();
  });
});
