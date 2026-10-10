import { describe, expect, it } from "vitest";
import { buildSellerJobExecutionView } from "./seller-job-execution-view.js";

describe("buildSellerJobExecutionView", () => {
  it("excludes buyer profile fields from seller execution view", () => {
    const view = buildSellerJobExecutionView({
      jobId: "job-1",
      buyerId: "buyer-1",
      sellerProfileId: "seller-1",
      structuredInput: { topic: "hello", buyerEmail: "a@b.c", stripeCustomer: "cus_1" },
      workerManifest: {
        manifestVersion: 1,
        workerId: "00000000-0000-0000-0000-000000000001",
        capabilityVersionId: "00000000-0000-0000-0000-000000000002",
        runtime: { type: "openclaw", supportedVersionRange: "1.x" },
        skills: ["demo"],
        tools: { allow: ["read"], deny: [] },
        resources: [],
        network: { default: "deny", allow: [] },
        limits: {
          timeoutSeconds: 60,
          memoryMb: 512,
          cpu: 1,
          maxPids: 64,
          maxInputBytes: 1_000_000,
          maxOutputBytes: 1_000_000,
        },
      },
      status: "RUNNING",
      capabilitySlug: "demo",
      buyerPaidCents: 999,
      platformFeeCents: 200,
      sellerNetCents: 799,
    });
    expect(view.earnings.source).toBe("job_price_snapshot");
    expect(view.excludedFromWorkerPayload).toContain("buyerEmail");
    expect(JSON.stringify(view.workerBundle)).not.toContain("buyerEmail");
    expect(JSON.stringify(view.workerBundle)).not.toContain("cus_1");
    expect(JSON.stringify(view.workerBundle)).toContain("topic");
  });
});
