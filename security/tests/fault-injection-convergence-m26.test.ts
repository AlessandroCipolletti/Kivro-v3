import { describe, expect, it } from "vitest";
import {
  assertAuthoritativeNotRedisOnly,
  assertPostRestoreInvariants,
  loadFaultInjectionMatrix,
} from "@kivro/resilience";
import { buildWebhookSignatureHeader, verifyWebhookSignature } from "@kivro/buyer-webhooks";
import { reconcileJobPaymentAfterTerminal } from "@kivro/billing";
import { reconcileWorkerSessionOnReconnect } from "@kivro/job-dispatch";

/** M26-GOLD-001 fault injection matrix wiring */
describe("M26 fault injection — convergence (HARD-005/006)", () => {
  it("M26-FAULT-001 matrix lists duplicate ledger scenario", () => {
    const matrix = loadFaultInjectionMatrix();
    expect(matrix.scenarios.some((s) => s.id === "M26-FAULT-001")).toBe(true);
  });

  /** M26-GOLD-005 */
  it("M26-FAULT-003 duplicate webhook signature verifies consistently", () => {
    const secret = "test-secret";
    const body = JSON.stringify({ jobId: "j1", type: "job.completed" });
    const timestamp = String(Math.floor(Date.now() / 1000));
    const header = buildWebhookSignatureHeader({ secret, body, timestamp });
    const verifyInput = {
      secret,
      body,
      timestamp,
      signatureHeader: header,
      now: new Date(),
    };
    expect(verifyWebhookSignature(verifyInput)).toBe(true);
    expect(verifyWebhookSignature(verifyInput)).toBe(true);
  });

  it("M26-FAULT-004 worker reconnect reconcile export is shared", () => {
    expect(typeof reconcileWorkerSessionOnReconnect).toBe("function");
  });

  /** M26-GOLD-003 */
  it("M26-FAULT-005 authoritative state is not Redis-only", () => {
    expect(
      assertAuthoritativeNotRedisOnly({
        durableJobStateStore: "postgresql",
        paymentLedgerStore: "postgresql",
      }).ok,
    ).toBe(true);
    expect(
      assertAuthoritativeNotRedisOnly({
        durableJobStateStore: "redis",
        paymentLedgerStore: "postgresql",
      }).ok,
    ).toBe(false);
  });

  it("M26-FAULT-008 terminal payment reconcile export is shared", () => {
    expect(typeof reconcileJobPaymentAfterTerminal).toBe("function");
  });

  /** M26-GOLD-004 */
  it("M26-FAULT-007 post-restore invariants reject duplicate ledger keys", () => {
    const r = assertPostRestoreInvariants({
      jobsTotal: 10,
      terminalJobs: 5,
      ledgerEntries: 20,
      duplicateLedgerKeys: 1,
      openReservationsOnTerminal: 0,
    });
    expect(r.ok).toBe(false);
  });
});
