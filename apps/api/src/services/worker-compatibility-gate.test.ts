import { describe, expect, it } from "vitest";
import { gateWorkerCloudHandshake } from "./worker-compatibility-gate.js";

describe("worker compatibility gate (M25)", () => {
  it("returns remediation payload for unsupported protocol", () => {
    const r = gateWorkerCloudHandshake({ protocolVersion: 99 });
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.httpStatus).toBe(426);
      expect(r.body.remediation).toMatch(/protocol/i);
    }
  });

  it("requires protocol header when KIVRO_REQUIRE_WORKER_PROTOCOL_HEADER=1", () => {
    const r = gateWorkerCloudHandshake({
      env: { KIVRO_REQUIRE_WORKER_PROTOCOL_HEADER: "1" },
    });
    expect(r.ok).toBe(false);
  });
});
