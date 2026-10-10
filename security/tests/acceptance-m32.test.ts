import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const root = path.resolve(import.meta.dirname, "../..");

describe("M32 acceptance", () => {
  it("seller experience package and onboarding API exist", () => {
    expect(fs.existsSync(path.join(root, "packages/seller-experience/src/index.ts"))).toBe(true);
    expect(fs.existsSync(path.join(root, "apps/api/src/routes/seller-onboarding.ts"))).toBe(true);
    expect(fs.existsSync(path.join(root, "scripts/verify-m32-flow.mjs"))).toBe(true);
  });
});
