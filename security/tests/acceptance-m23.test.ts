import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const root = path.resolve(import.meta.dirname, "../..");

describe("M23 unified compliance audit milestone", () => {
  it("exposes verify:m23 and audit artifacts", () => {
    const pkg = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));
    expect(pkg.scripts["verify:m23"]).toBeTruthy();
    expect(fs.existsSync(path.join(root, "scripts/audit-m23-unified.mjs"))).toBe(true);
    expect(fs.existsSync(path.join(root, "scripts/lib/compliance-audit-core.mjs"))).toBe(true);
    expect(fs.existsSync(path.join(root, "docs/milestones/M23-closure.md"))).toBe(true);
  });
});
