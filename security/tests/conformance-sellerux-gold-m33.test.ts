import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const root = path.resolve(import.meta.dirname, "../..");
const golden = JSON.parse(
  fs.readFileSync(path.join(root, "tests/fixtures/backend-conformance-golden.json"), "utf8"),
) as { scenarios: Array<{ id: string }> };

const M33_GOLD = [
  "SELLERUX-GOLD-007",
  "SELLERUX-GOLD-008",
  "SELLERUX-GOLD-009",
  "SELLERUX-GOLD-010",
  "SELLERUX-GOLD-011",
  "SELLERUX-GOLD-013",
  "SELLERUX-GOLD-014",
  "SELLERUX-GOLD-015",
];

describe("M33 SELLERUX-GOLD registry", () => {
  it("golden registry lists M33 exit SELLERUX-GOLD scenarios", () => {
    const ids = new Set(golden.scenarios.map((s) => s.id));
    for (const id of M33_GOLD) {
      expect(ids.has(id)).toBe(true);
    }
  });

  it("SELLERUX-GOLD-007 schedule pause capacity", () => {
    expect(fs.existsSync(path.join(root, "packages/job-scheduling/src/accepting-jobs.ts"))).toBe(true);
    const src = fs.readFileSync(path.join(root, "packages/job-scheduling/src/accepting-jobs.ts"), "utf8");
    expect(src).toContain("CONCURRENCY_LIMIT");
    expect(src).toContain("SELLER_MAINTENANCE");
  });

  it("SELLERUX-GOLD-008 seller job privacy", () => {
    expect(fs.existsSync(path.join(root, "packages/seller-experience/src/seller-job-execution-view.ts"))).toBe(
      true,
    );
  });

  it("SELLERUX-GOLD-009 cost protection", () => {
    expect(fs.existsSync(path.join(root, "packages/seller-experience/src/provider-cost-view.ts"))).toBe(true);
  });

  it("SELLERUX-GOLD-010 earnings profit", () => {
    expect(fs.existsSync(path.join(root, "packages/seller-experience/src/earnings-dashboard.ts"))).toBe(true);
    expect(fs.existsSync(path.join(root, "packages/seller-experience/src/profit-analytics.ts"))).toBe(true);
  });

  it("SELLERUX-GOLD-011 analytics privacy", () => {
    expect(fs.existsSync(path.join(root, "packages/seller-experience/src/capability-analytics.ts"))).toBe(true);
  });

  it("SELLERUX-GOLD-013 rollback", () => {
    expect(fs.existsSync(path.join(root, "packages/seller-experience/src/rollback-readiness.ts"))).toBe(true);
  });

  it("SELLERUX-GOLD-014 auto pause", () => {
    expect(fs.existsSync(path.join(root, "packages/seller-experience/src/auto-pause-explanation.ts"))).toBe(true);
  });

  it("SELLERUX-GOLD-015 notifications maintenance", () => {
    expect(fs.existsSync(path.join(root, "packages/seller-experience/src/maintenance-mode.ts"))).toBe(true);
    expect(fs.existsSync(path.join(root, "packages/seller-experience/src/seller-notification-preferences.ts"))).toBe(
      true,
    );
  });
});
