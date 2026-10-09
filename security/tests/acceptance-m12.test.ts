import { describe, expect, it } from "vitest";
import { evaluateAcceptingNewJobs } from "@kivro/job-scheduling";
import {
  buildSecurityWarnings,
  deriveMarketplaceControlState,
  deriveWorkerHealthLabel,
  hasBlockingSecurityWarning,
  pickPlatformSecurityPauseTrigger,
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

describe("M12 acceptance — platform security pause §393", () => {
  it("detects auto-trigger from critical telemetry", () => {
    const trigger = pickPlatformSecurityPauseTrigger(
      buildSecurityWarnings({
        report: {
          workerVersion: "0.0.0-m07",
          dockerOk: false,
          sandboxOk: false,
          openClawInstalled: true,
          openClawCompatible: true,
          globalPauseActive: false,
          reportedAt: new Date().toISOString(),
        },
        deviceStatus: "ONLINE",
        sellerEmergencyPause: false,
        platformSecurityPause: false,
      }),
    );
    expect(trigger.trigger).toBe(true);
  });

  it("blocks dispatch when platform security pause flag is set", () => {
    const state = deriveMarketplaceControlState({
      cloudEmergencyPause: false,
      localPauseReported: false,
      platformSecurityPause: true,
    });
    expect(state.dispatchBlocked).toBe(true);
  });
});

describe("M12 acceptance — cloud/local sync §386", () => {
  it("requires local pause sync when cloud emergency pause is active", () => {
    const state = deriveMarketplaceControlState({
      cloudEmergencyPause: true,
      localPauseReported: false,
    });
    expect(state.requiresLocalPauseSync).toBe(true);
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
