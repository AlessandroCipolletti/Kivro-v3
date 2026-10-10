import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const root = path.resolve(import.meta.dirname, "../..");

describe("M33 seller operations route guards", () => {
  it("operations routes require verified session auth", () => {
    const src = fs.readFileSync(path.join(root, "apps/api/src/routes/seller-operations.ts"), "utf8");
    expect(src).toContain("requireAuth");
    expect(src).toContain("requireVerifiedEmail");
    expect(src).toContain("/operations/summary");
    expect(src).toContain("/maintenance");
    expect(src).toContain("sellerProfileId: profile.id");
  });

  it("seller job execution route is seller-scoped", () => {
    const src = fs.readFileSync(path.join(root, "apps/api/src/routes/seller-jobs.ts"), "utf8");
    expect(src).toContain("/jobs/:jobId/execution");
    expect(src).toContain("buildSellerJobExecutionView");
  });
});
