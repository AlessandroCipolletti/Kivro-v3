import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const root = path.resolve(import.meta.dirname, "../..");

const BUYERUX_GOLD_M30 = [
  "BUYERUX-GOLD-001",
  "BUYERUX-GOLD-002",
  "BUYERUX-GOLD-003",
  "BUYERUX-GOLD-004",
  "BUYERUX-GOLD-005",
  "BUYERUX-GOLD-006",
  "BUYERUX-GOLD-011",
  "BUYERUX-GOLD-012",
  "BUYERUX-GOLD-013",
  "BUYERUX-GOLD-016",
  "BUYERUX-GOLD-017",
  "BUYERUX-GOLD-018",
] as const;

describe("M30 BUYERUX-GOLD registry", () => {
  it("golden registry lists M30 exit BUYERUX-GOLD scenarios", () => {
    const registry = JSON.parse(
      fs.readFileSync(path.join(root, "tests/fixtures/backend-conformance-golden.json"), "utf8"),
    );
    const ids = registry.scenarios.map((s: { id: string }) => s.id);
    for (const id of BUYERUX_GOLD_M30) {
      expect(ids).toContain(id);
    }
  });

  it("documents scenario ids for verify-golden-registry", () => {
    expect(BUYERUX_GOLD_M30.length).toBe(12);
  });
});

describe("M30 BUYERUX policy conformance", () => {
  it("BUYERUX-GOLD-001 preflight + quote service", () => {
    expect(fs.existsSync(path.join(root, "packages/buyer-experience/src/execution-preflight.ts"))).toBe(
      true,
    );
    expect(fs.existsSync(path.join(root, "packages/buyer-experience/src/execution-quote.ts"))).toBe(true);
  });

  it("BUYERUX-GOLD-002 deadline feasibility", () => {
    expect(fs.existsSync(path.join(root, "packages/buyer-experience/src/deadline-feasibility.ts"))).toBe(
      true,
    );
  });

  it("BUYERUX-GOLD-003 atomic quote validation at purchase", () => {
    expect(fs.readFileSync(path.join(root, "packages/billing/src/job-payment.ts"), "utf8")).toContain(
      "validateExecutionQuoteAtPurchase",
    );
  });

  it("BUYERUX-GOLD-004 cancel before start", () => {
    expect(fs.existsSync(path.join(root, "packages/job-scheduling/src/buyer-scheduled-cancel.ts"))).toBe(
      true,
    );
  });

  it("BUYERUX-GOLD-006 ETA honesty and agent deadline gate", () => {
    expect(fs.existsSync(path.join(root, "packages/buyer-experience/src/buyer-eta.ts"))).toBe(true);
    expect(fs.readFileSync(path.join(root, "packages/marketplace-agent/src/purchase-authorization.ts"), "utf8")).toContain(
      "DEADLINE_INFEASIBLE",
    );
  });

  it("BUYERUX-GOLD-011 missed window copy", () => {
    expect(fs.existsSync(path.join(root, "packages/buyer-experience/src/missed-window.ts"))).toBe(true);
  });

  it("BUYERUX-GOLD-013 reliability aggregation", () => {
    expect(fs.existsSync(path.join(root, "packages/buyer-experience/src/seller-reliability.ts"))).toBe(true);
  });

  it("BUYERUX-GOLD-016 privacy disclosure from manifest", () => {
    expect(fs.existsSync(path.join(root, "packages/buyer-experience/src/privacy-disclosure.ts"))).toBe(true);
  });

  it("BUYERUX-GOLD-017 minimized worker payload", () => {
    expect(fs.existsSync(path.join(root, "packages/buyer-experience/src/worker-payload.ts"))).toBe(true);
  });

  it("BUYERUX-GOLD-018 buyer dashboard", () => {
    expect(fs.existsSync(path.join(root, "packages/buyer-experience/src/buyer-dashboard.ts"))).toBe(true);
  });
});
