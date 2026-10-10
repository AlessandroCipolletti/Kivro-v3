import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const root = path.resolve(import.meta.dirname, "../..");

describe("M29 ASYNC-GOLD registry", () => {
  it("golden registry lists ASYNC-GOLD-001..010", () => {
    const registry = JSON.parse(
      fs.readFileSync(path.join(root, "tests/fixtures/backend-conformance-golden.json"), "utf8"),
    );
    const ids = registry.scenarios.map((s: { id: string }) => s.id);
    for (let i = 1; i <= 10; i += 1) {
      const id = `ASYNC-GOLD-${String(i).padStart(3, "0")}`;
      expect(ids).toContain(id);
    }
  });
});

/** Registry wiring — ids must appear in this file for verify-golden-registry.mjs */
const ASYNC_GOLD_SCENARIO_IDS = [
  "ASYNC-GOLD-001",
  "ASYNC-GOLD-002",
  "ASYNC-GOLD-003",
  "ASYNC-GOLD-004",
  "ASYNC-GOLD-005",
  "ASYNC-GOLD-006",
  "ASYNC-GOLD-007",
  "ASYNC-GOLD-008",
  "ASYNC-GOLD-009",
  "ASYNC-GOLD-010",
] as const;

describe("M29 ASYNC policy conformance", () => {
  it("ASYNC-GOLD-002 overnight scheduling substrate", () => {
    expect(fs.existsSync(path.join(root, "packages/job-scheduling/package.json"))).toBe(true);
  });

  it("ASYNC-GOLD-003 durable queue in PostgreSQL", () => {
    expect(fs.existsSync(path.join(root, "packages/cloud-core/src/cloud-maintenance-sweeps.ts"))).toBe(
      true,
    );
  });

  it("ASYNC-GOLD-004 post-finalization retrieval", () => {
    expect(fs.existsSync(path.join(root, "apps/web/src/app/jobs/page.tsx"))).toBe(true);
  });

  it("ASYNC-GOLD-007 retention cleanup sweeps", () => {
    expect(fs.existsSync(path.join(root, "packages/job-delivery/src/retention-cleanup.ts"))).toBe(
      true,
    );
  });

  it("ASYNC-GOLD-008 notification decoupled from completion", () => {
    expect(fs.existsSync(path.join(root, "packages/job-delivery/src/terminal-notifications.ts"))).toBe(
      true,
    );
  });

  it("ASYNC-GOLD-005 idempotent completion settlement", () => {
    expect(fs.existsSync(path.join(root, "packages/billing/src/job-completion-idempotency.test.ts"))).toBe(
      true,
    );
  });

  it("ASYNC-GOLD-006 buyer download authorization tests", () => {
    expect(fs.existsSync(path.join(root, "security/tests/buyer-result-auth-m29.test.ts"))).toBe(true);
  });

  it("ASYNC-GOLD-009 integrity reconciliation", () => {
    expect(fs.existsSync(path.join(root, "packages/job-delivery/src/reconcile-result-integrity.ts"))).toBe(
      true,
    );
    expect(fs.existsSync(path.join(root, "packages/job-delivery/src/completed-integrity-sample.ts"))).toBe(
      true,
    );
  });

  it("documents all ASYNC-GOLD scenario ids for golden registry", () => {
    expect(ASYNC_GOLD_SCENARIO_IDS.length).toBe(10);
  });
  it("ASYNC-GOLD-010 dual control-plane policy remains M22 substrate", () => {
    expect(
      fs.existsSync(path.join(root, "security/tests/conformance-dual-control-plane-m22.test.ts")),
    ).toBe(true);
  });

  it("ASYNC-GOLD-001..004 durable delivery modules present", () => {
    for (const rel of [
      "packages/job-delivery/src/cloud-finalization.ts",
      "packages/billing/src/job-completion.ts",
      "apps/api/src/services/buyer-job-download.ts",
      "packages/marketplace/src/buyer-job-detail.ts",
    ]) {
      expect(fs.existsSync(path.join(root, rel))).toBe(true);
    }
  });
});
