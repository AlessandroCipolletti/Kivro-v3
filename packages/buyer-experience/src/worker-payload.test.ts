import { describe, expect, it } from "vitest";
import { buildMinimizedWorkerExecutionBundle } from "./worker-payload.js";

describe("buildMinimizedWorkerExecutionBundle (BUYERUX-037/038)", () => {
  it("does not include buyer email or raw buyer id", () => {
    const bundle = buildMinimizedWorkerExecutionBundle({
      jobId: "job-1",
      buyerId: "buyer-secret",
      structuredInput: { q: "hello" },
      workerManifest: { v: 1 },
      sellerProfileId: "seller-1",
    });
    expect(JSON.stringify(bundle)).not.toContain("buyer-secret");
    expect(bundle.buyerCorrelationToken).toHaveLength(32);
    expect(bundle.jobId).toBe("job-1");
  });
});
