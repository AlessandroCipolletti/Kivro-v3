import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const root = path.resolve(import.meta.dirname, "../..");

describe("M25 compatibility milestone", () => {
  it("exposes verify:m25 deliverables", () => {
    const pkg = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));
    expect(pkg.scripts["verify:m25"]).toBeTruthy();
    expect(fs.existsSync(path.join(root, "packages/compatibility/matrix.json"))).toBe(true);
    expect(fs.existsSync(path.join(root, "tests/fixtures/schema-rollout-registry.json"))).toBe(true);
    expect(fs.existsSync(path.join(root, "docs/audits/unified-release-manifest.json"))).toBe(true);
  });
});
