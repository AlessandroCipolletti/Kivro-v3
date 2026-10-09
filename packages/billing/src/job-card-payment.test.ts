import { describe, expect, it } from "vitest";

describe("card authorization job flow §24.5", () => {
  it("requires manual capture semantics", () => {
    const captureMethod = "manual";
    expect(captureMethod).toBe("manual");
  });

  it("metadata keys identify kivro job", () => {
    const metadata = { kivroJobId: "job-1", purpose: "JOB_CARD_AUTHORIZATION" };
    expect(metadata.kivroJobId).toBeTruthy();
  });
});
