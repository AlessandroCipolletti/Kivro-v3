import { describe, expect, it } from "vitest";
import { buildSellerJobExecutionView } from "./seller-job-execution-view.js";

describe("buildSellerJobExecutionView", () => {
  it("excludes buyer profile fields from seller execution view", () => {
    const view = buildSellerJobExecutionView({
      jobId: "job-1",
      buyerId: "buyer-1",
      sellerProfileId: "seller-1",
      structuredInput: { topic: "hello" },
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
    });
    expect(view.excludedFromWorkerPayload).toContain("buyerEmail");
    expect(JSON.stringify(view.workerBundle)).not.toContain("buyerEmail");
    expect(JSON.stringify(view.workerBundle)).toContain("topic");
  });
});
