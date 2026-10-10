import { describe, expect, it } from "vitest";
import { buildPublishReadinessReport } from "./publish-readiness.js";

describe("publish readiness SELLERUX-008", () => {
  it("blocks when worker not paired", () => {
    const report = buildPublishReadinessReport({
      dependencyGraph: { graphVersion: 1, rootCapabilityName: "x", nodes: [] },
      workerPaired: false,
      workerHealthLabel: "NONE",
      executionModelAcknowledged: true,
      contractValid: true,
      payoutReady: false,
    });
    expect(report.ready).toBe(false);
    expect(report.items.some((i) => i.id === "worker_pairing")).toBe(true);
  });

  it("blocks when permission expansion pending without ack", () => {
    const report = buildPublishReadinessReport({
      dependencyGraph: { graphVersion: 1, rootCapabilityName: "x", nodes: [] },
      workerPaired: true,
      workerHealthLabel: "HEALTHY",
      executionModelAcknowledged: true,
      contractValid: true,
      payoutReady: true,
      permissionExpansionPending: true,
      permissionExpansionAcknowledged: false,
    });
    expect(report.ready).toBe(false);
    expect(report.items.some((i) => i.id === "permission_expansion_ack")).toBe(true);
  });

  it("allows recommended payout item without blocking", () => {
    const report = buildPublishReadinessReport({
      dependencyGraph: { graphVersion: 1, rootCapabilityName: "x", nodes: [] },
      workerPaired: true,
      workerHealthLabel: "HEALTHY",
      executionModelAcknowledged: true,
      contractValid: true,
      payoutReady: false,
    });
    expect(report.ready).toBe(true);
    expect(report.items.some((i) => i.id === "payout_connect" && i.severity === "recommended")).toBe(
      true,
    );
  });
});
