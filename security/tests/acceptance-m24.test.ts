import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const root = path.resolve(import.meta.dirname, "../..");

describe("M24 architecture fitness milestone", () => {
  it("exposes verify:m24 and fitness deliverables", () => {
    const pkg = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));
    expect(pkg.scripts["verify:m24"]).toBeTruthy();
    expect(fs.existsSync(path.join(root, "scripts/check-duplicate-semantic-ownership.mjs"))).toBe(true);
    expect(fs.existsSync(path.join(root, "docs/audits/M24-provider-parity-report.json"))).toBe(true);
    const golden = JSON.parse(
      fs.readFileSync(path.join(root, "tests/fixtures/backend-conformance-golden.json"), "utf8"),
    ) as { version: number; scenarios: unknown[] };
    expect(golden.version).toBeGreaterThanOrEqual(2);
    expect(golden.scenarios.length).toBeGreaterThanOrEqual(25);
    expect(fs.existsSync(path.join(root, "docs/audits/M24-fitness-report.json"))).toBe(true);
    expect(fs.existsSync(path.join(root, "tests/fixtures/compatibility-matrix.json"))).toBe(true);
    expect(fs.existsSync(path.join(root, "scripts/audit-m24-exit-criteria.mjs"))).toBe(true);
  });
});
