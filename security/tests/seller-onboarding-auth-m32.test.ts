import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const root = path.resolve(import.meta.dirname, "../..");

describe("M32 seller onboarding route guards", () => {
  it("capability-scoped POST routes verify ownership", () => {
    const src = fs.readFileSync(
      path.join(root, "apps/api/src/routes/seller-onboarding.ts"),
      "utf8",
    );
    expect(src).toContain("requireOwnedCapability");
    expect(src).toContain('/capabilities/:id/effective-permissions');
    expect(src).toContain('/capabilities/:id/security-disclosure');
    expect(src).toContain('/capabilities/:id/draft-manifest-diff');
  });
});
