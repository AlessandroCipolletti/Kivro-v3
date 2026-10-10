import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const root = path.resolve(import.meta.dirname, "../..");

describe("M26 fault injection milestone", () => {
  it("exposes verify:m26 deliverables", () => {
    const pkg = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));
    expect(pkg.scripts["verify:m26"]).toBeTruthy();
    expect(fs.existsSync(path.join(root, "packages/resilience/fault-injection-matrix.json"))).toBe(
      true,
    );
    expect(fs.existsSync(path.join(root, "docs/deploy/backup-restore-runbook.md"))).toBe(true);
    expect(fs.existsSync(path.join(root, "scripts/audit-m26-exit-criteria.mjs"))).toBe(true);
  });
});
