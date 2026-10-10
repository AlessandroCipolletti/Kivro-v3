import { describe, expect, it } from "vitest";
import { evaluateWorkerVersion, resolveWorkerVersionPolicy } from "./worker-policy.js";

describe("worker version policy", () => {
  it("rejects below minimum", () => {
    const r = evaluateWorkerVersion("0.0.0-m01", {
      KIVRO_MIN_SECURITY_WORKER_VERSION: "1.0.0",
    });
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.code).toBe("WORKER_VERSION_BELOW_MINIMUM");
    }
  });

  it("allows env override for minimum", () => {
    const policy = resolveWorkerVersionPolicy({ KIVRO_MIN_SECURITY_WORKER_VERSION: "9.9.9" });
    expect(policy.minSupportedWorkerVersion).toBe("9.9.9");
  });
});
