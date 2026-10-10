import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const root = path.resolve(import.meta.dirname, "../..");
const reportPath = path.join(root, "docs/audits/M23-compliance-report.json");

describe("M23 unified audit conformance", () => {
  it("M23-GOLD-001 report shows zero closure and evidence gaps", () => {
    expect(fs.existsSync(reportPath)).toBe(true);
    const report = JSON.parse(fs.readFileSync(reportPath, "utf8")) as {
      closedScopeTodoCount: number;
      unexplainedCount: number;
      invalidTestedCount: number;
      testedP0MissingTestEvidenceCount: number;
      mandatoryRuns: Array<{ id: string; pass: boolean }>;
    };
    expect(report.unexplainedCount).toBe(0);
    expect(report.closedScopeTodoCount).toBe(0);
    expect(report.invalidTestedCount).toBe(0);
    expect(report.testedP0MissingTestEvidenceCount).toBe(0);
    expect(report.mandatoryRuns?.length).toBeGreaterThan(3);
    for (const run of report.mandatoryRuns) {
      expect(run.pass, run.id).toBe(true);
    }
  });

  it("M23-GOLD-003 exit criteria marks harness complete and defers product terminal to M28", () => {
    const exitPath = path.join(root, "docs/audits/M23-exit-criteria.json");
    expect(fs.existsSync(exitPath)).toBe(true);
    const exitDoc = JSON.parse(fs.readFileSync(exitPath, "utf8")) as {
      m23HarnessComplete: boolean;
      productMasterSpecComplete: boolean;
      terminalGate: string;
    };
    expect(exitDoc.m23HarnessComplete).toBe(true);
    expect(exitDoc.productMasterSpecComplete).toBe(false);
    expect(exitDoc.terminalGate).toBe("M28");
  });

  it("M23-GOLD-002 records master spec completion metrics without claiming terminal done", () => {
    const report = JSON.parse(fs.readFileSync(reportPath, "utf8")) as {
      masterSpecCompletion: { note: string; p0: { tested: number; todo: number } };
    };
    expect(report.masterSpecCompletion.p0.tested).toBeGreaterThan(100);
    expect(report.masterSpecCompletion.note).toMatch(/M28/);
  });
});
