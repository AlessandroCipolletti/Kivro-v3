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
});
