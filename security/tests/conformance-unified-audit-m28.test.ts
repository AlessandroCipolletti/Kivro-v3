import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const root = path.resolve(import.meta.dirname, "../..");

describe("M28 terminal unified audit conformance", () => {
  it("M28-GOLD-001 compliance report shows zero traceability gaps", () => {
    const report = JSON.parse(
      fs.readFileSync(path.join(root, "docs/audits/M28-compliance-report.json"), "utf8"),
    );
    expect(report.unexplainedCount).toBe(0);
    expect(report.closedScopeTodoCount).toBe(0);
    expect(report.invalidTestedCount).toBe(0);
    expect(report.mandatoryRuns?.every((r: { pass: boolean }) => r.pass)).toBe(true);
  });

  it("M28-GOLD-002 requirement families pass HARD M24–M27 harness rows", () => {
    const families = JSON.parse(
      fs.readFileSync(path.join(root, "docs/audits/M28-requirement-families.json"), "utf8"),
    );
    expect(families.pass).toBe(true);
    expect(families.hardM24M27NonTested).toEqual([]);
  });

  it("M28-GOLD-005 expanded P0 sample audit passes", () => {
    const sample = JSON.parse(
      fs.readFileSync(path.join(root, "docs/audits/M28-master-spec-sample-audit.json"), "utf8"),
    );
    expect(sample.pass).toBe(true);
    expect(sample.sampleSize).toBeGreaterThanOrEqual(40);
  });

  it("M28-GOLD-006 portability families have zero P0 gaps", () => {
    const families = JSON.parse(
      fs.readFileSync(path.join(root, "docs/audits/M28-requirement-families.json"), "utf8"),
    );
    expect(families.portabilityP0NonTested).toEqual([]);
  });

  it("M28 open catalog covers P0/P1/P2 with schedule notes", () => {
    const catalog = JSON.parse(
      fs.readFileSync(path.join(root, "docs/audits/M28-open-requirements-catalog.json"), "utf8"),
    );
    expect(catalog.pass).toBe(true);
    expect(typeof catalog.openP2Count).toBe("number");
    expect(catalog.openByScheduledTarget).toBeTruthy();
  });

  it("M28-GOLD-003 exit criteria: harness complete, product flag honest", () => {
    const exitDoc = JSON.parse(
      fs.readFileSync(path.join(root, "docs/audits/M28-exit-criteria.json"), "utf8"),
    );
    expect(exitDoc.m28HarnessComplete).toBe(true);
    expect(exitDoc.terminalAuditExecuted).toBe(true);
    expect(typeof exitDoc.productMasterSpecComplete).toBe("boolean");
  });
});
