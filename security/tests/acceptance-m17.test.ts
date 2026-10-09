import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const root = process.cwd();

describe("M17 acceptance — compliance audit artifacts", () => {
  it("compliance report exists with zero unexplained gaps", () => {
    const report = JSON.parse(
      fs.readFileSync(path.join(root, "docs/audits/M17-compliance-report.json"), "utf8"),
    ) as { totalRequirements: number; unexplainedCount: number; m00m16TodoCount: number };
    expect(report.totalRequirements).toBeGreaterThan(1800);
    expect(report.unexplainedCount).toBe(0);
    expect(report.m00m16TodoCount).toBe(0);
  });

  it("section milestone index is generated", () => {
    const index = JSON.parse(
      fs.readFileSync(path.join(root, "spec/compliance/section-milestone-index.json"), "utf8"),
    ) as { sectionToMilestone: Record<string, string> };
    expect(Object.keys(index.sectionToMilestone).length).toBeGreaterThan(300);
    expect(index.idPrefixRules.find((r: { prefix: string }) => r.prefix === "DEV-LOCAL-")?.milestone).toBe(
      "M18",
    );
  });

  it("P0/P1 rollup doc exists", () => {
    expect(fs.existsSync(path.join(root, "docs/audits/M17-P0-P1-by-section.md"))).toBe(true);
  });
});
