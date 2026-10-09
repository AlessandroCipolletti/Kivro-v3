import { describe, expect, it } from "vitest";
import { resetGlobalDispatchForTests } from "@kivro/platform-policy";
import { evaluateResumeReadiness } from "./resume-readiness.js";

describe("resume readiness §440", () => {
  it("blocks security paused jobs", () => {
    expect(
      evaluateResumeReadiness({ jobStatus: "SECURITY_PAUSED" }).ready,
    ).toBe(false);
  });

  it("requires global pause override", () => {
    resetGlobalDispatchForTests(true);
    expect(
      evaluateResumeReadiness({
        jobStatus: "PAUSED",
        globalPauseActive: true,
        confirmGlobalPauseOverride: false,
      }).ready,
    ).toBe(false);
  });

  it("allows resume when ready", () => {
    resetGlobalDispatchForTests(true);
    expect(
      evaluateResumeReadiness({
        jobStatus: "PAUSED",
        workerDeviceStatus: "ONLINE",
      }).ready,
    ).toBe(true);
  });
});
