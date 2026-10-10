import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const root = path.resolve(import.meta.dirname, "../..");

describe("M27 performance & release ops milestone", () => {
  it("exposes verify:m27 deliverables", () => {
    const pkg = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));
    expect(pkg.scripts["verify:m27"]).toBeTruthy();
    expect(fs.existsSync(path.join(root, "docs/audits/M27-performance-envelope.json"))).toBe(true);
    expect(fs.existsSync(path.join(root, "packages/release-ops/package.json"))).toBe(true);
    expect(fs.existsSync(path.join(root, "scripts/audit-m27-exit-criteria.mjs"))).toBe(true);
  });
});
