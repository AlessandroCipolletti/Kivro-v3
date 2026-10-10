import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const root = path.resolve(import.meta.dirname, "../..");

describe("M30 buyer predictability milestone", () => {
  it("exposes verify:m30 deliverables", () => {
    const pkg = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));
    expect(pkg.scripts["verify:m30"]).toBeTruthy();
    expect(fs.existsSync(path.join(root, "scripts/verify-m30-flow.mjs"))).toBe(true);
    expect(fs.existsSync(path.join(root, "scripts/verify-m30-evidence.mjs"))).toBe(true);
    expect(fs.existsSync(path.join(root, "packages/buyer-experience/src/index.ts"))).toBe(true);
  });
});
