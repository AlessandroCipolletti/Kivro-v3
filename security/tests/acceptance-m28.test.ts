import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const root = path.resolve(import.meta.dirname, "../..");

describe("M28 terminal audit milestone", () => {
  it("exposes verify:m28 deliverables", () => {
    const pkg = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));
    expect(pkg.scripts["verify:m28"]).toBeTruthy();
    expect(fs.existsSync(path.join(root, "scripts/audit-m28-unified.mjs"))).toBe(true);
    expect(fs.existsSync(path.join(root, "docs/audits/M28-mandatory-audit-matrix.md"))).toBe(true);
    expect(fs.existsSync(path.join(root, "scripts/verify-m28-dual-control-plane-evidence.mjs"))).toBe(
      true,
    );
    expect(fs.existsSync(path.join(root, "scripts/audit-m28-readiness-checklist.mjs"))).toBe(true);
  });
});
