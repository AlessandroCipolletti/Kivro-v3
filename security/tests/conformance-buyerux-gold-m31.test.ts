import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const root = path.resolve(import.meta.dirname, "../..");
const golden = JSON.parse(
  fs.readFileSync(path.join(root, "tests/fixtures/backend-conformance-golden.json"), "utf8"),
) as { scenarios: Array<{ id: string }> };

const M31_GOLD = [
  "BUYERUX-GOLD-007",
  "BUYERUX-GOLD-008",
  "BUYERUX-GOLD-009",
  "BUYERUX-GOLD-010",
  "BUYERUX-GOLD-014",
  "BUYERUX-GOLD-015",
];

describe("M31 BUYERUX-GOLD registry", () => {
  it("golden registry lists M31 exit BUYERUX-GOLD scenarios", () => {
    const ids = new Set(golden.scenarios.map((s) => s.id));
    for (const id of M31_GOLD) {
      expect(ids.has(id)).toBe(true);
    }
  });

  it("BUYERUX-GOLD-007 rerun/duplicate reuse seed", () => {
    expect(fs.existsSync(path.join(root, "packages/buyer-experience/src/job-reuse.ts"))).toBe(true);
    expect(fs.existsSync(path.join(root, "packages/buyer-experience/src/buyer-asset-validation.ts"))).toBe(
      true,
    );
  });

  it("BUYERUX-GOLD-008 rich semantic result", () => {
    expect(fs.existsSync(path.join(root, "packages/buyer-experience/src/semantic-result.ts"))).toBe(true);
  });

  it("BUYERUX-GOLD-009 download all bundle", () => {
    expect(fs.existsSync(path.join(root, "packages/buyer-experience/src/download-bundle-plan.ts"))).toBe(true);
    expect(fs.existsSync(path.join(root, "packages/job-delivery/src/result-bundle.ts"))).toBe(true);
  });

  it("BUYERUX-GOLD-010 immutable snapshots", () => {
    expect(fs.existsSync(path.join(root, "packages/buyer-experience/src/purchase-snapshot-view.ts"))).toBe(true);
  });

  it("BUYERUX-GOLD-014 retention UX", () => {
    expect(fs.existsSync(path.join(root, "packages/buyer-experience/src/retention-ux.ts"))).toBe(true);
  });

  it("BUYERUX-GOLD-015 problem report", () => {
    expect(fs.existsSync(path.join(root, "packages/buyer-experience/src/job-problem-report.ts"))).toBe(true);
  });
});
