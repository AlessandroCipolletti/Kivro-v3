import { describe, expect, it } from "vitest";
import { evaluateCloudWorkerHandshake } from "@kivro/compatibility";

describe("M25 cloud fail-closed (HARD-008)", () => {
  it("M25-GOLD-001 rejects unsupported protocol version", () => {
    const r = evaluateCloudWorkerHandshake({ protocolVersion: 99, workerVersion: "0.0.0-m07" });
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.code).toBe("PROTOCOL_VERSION_UNSUPPORTED");
      expect(r.httpStatus).toBe(426);
      expect(r.remediation).toMatch(/protocol/i);
    }
  });

  it("M25-GOLD-002 accepts supported worker version", () => {
    const r = evaluateCloudWorkerHandshake({
      protocolVersion: 1,
      workerVersion: "0.0.0-m07",
    });
    expect(r.ok).toBe(true);
  });

  it("M25-GOLD-008 rejects revoked worker via env policy", () => {
    const r = evaluateCloudWorkerHandshake({
      workerVersion: "0.0.0-bad",
      env: { KIVRO_REVOKED_WORKER_VERSIONS: "0.0.0-bad" },
    });
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.code).toBe("WORKER_VERSION_REVOKED");
    }
  });

  it("M25-GOLD-009 rejects unsupported OpenClaw version", () => {
    const r = evaluateCloudWorkerHandshake({
      workerVersion: "0.0.0-m07",
      openClawVersion: "99.99.99",
    });
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.code).toBe("OPENCLAW_VERSION_UNSUPPORTED");
    }
  });
});
