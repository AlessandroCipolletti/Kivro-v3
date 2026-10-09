import { describe, expect, it } from "vitest";
import { buildSecurityWarnings, hasBlockingSecurityWarning } from "./security-warnings.js";
import type { WorkerHealthReport } from "./worker-health-report.js";

const baseReport = (over: Partial<WorkerHealthReport>): WorkerHealthReport => ({
  workerVersion: "0.0.0-m07",
  dockerOk: true,
  sandboxOk: true,
  openClawInstalled: true,
  openClawCompatible: true,
  globalPauseActive: false,
  reportedAt: new Date().toISOString(),
  ...over,
});

describe("security warnings §378 fail-closed", () => {
  it("blocks when docker unavailable", () => {
    const warnings = buildSecurityWarnings({
      report: baseReport({ dockerOk: false }),
      deviceStatus: "ONLINE",
      sellerEmergencyPause: false,
    });
    expect(hasBlockingSecurityWarning(warnings)).toBe(true);
  });

  it("blocks on emergency pause without waiting for seller notice", () => {
    const warnings = buildSecurityWarnings({
      report: baseReport({}),
      deviceStatus: "ONLINE",
      sellerEmergencyPause: true,
    });
    expect(hasBlockingSecurityWarning(warnings)).toBe(true);
  });
});
