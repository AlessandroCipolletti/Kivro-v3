import { describe, expect, it } from "vitest";
import { evaluateAcceptingNewJobs } from "@kivro/job-scheduling";
import {
  buildSecurityWarnings,
  deriveWorkerHealthLabel,
  hasBlockingSecurityWarning,
} from "@kivro/seller-health";

describe("M12 acceptance — emergency pause §383", () => {
  it("rejects new jobs when seller emergency pause is active", () => {
    const result = evaluateAcceptingNewJobs({
      capabilityPublished: true,
      schedule: { mode: "ALWAYS_AVAILABLE", timezone: "UTC", windows: [] },
      workerDeviceStatus: "ONLINE",
      hasActiveJobOnWorker: false,
      globalDispatchEnabled: true,
      sellerEmergencyPause: true,
    });
    expect(result.accepting).toBe(false);
    expect(result.reasons).toContain("EMERGENCY_PAUSE");
    expect(result.buyerAvailability).toBe("PAUSED");
  });
});

describe("M12 acceptance — security fail-closed §378", () => {
  it("marks worker security warning when sandbox fails", () => {
    const warnings = buildSecurityWarnings({
      report: {
        workerVersion: "0.0.0-m07",
        dockerOk: true,
        sandboxOk: false,
        openClawInstalled: true,
        openClawCompatible: true,
        globalPauseActive: false,
        reportedAt: new Date().toISOString(),
      },
      deviceStatus: "ONLINE",
      sellerEmergencyPause: false,
    });
    expect(hasBlockingSecurityWarning(warnings)).toBe(true);
    const label = deriveWorkerHealthLabel({
      deviceStatus: "ONLINE",
      lastSeenAt: new Date(),
      report: {
        workerVersion: "0.0.0-m07",
        dockerOk: true,
        sandboxOk: false,
        openClawInstalled: true,
        openClawCompatible: true,
        globalPauseActive: false,
        reportedAt: new Date().toISOString(),
      },
      sellerEmergencyPause: false,
      warnings,
    });
    expect(label).toBe("SECURITY_WARNING");
  });
});
