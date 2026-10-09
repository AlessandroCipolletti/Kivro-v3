import { describe, expect, it } from "vitest";
import { abuseAutoPauseReportThreshold } from "./triage.js";

describe("abuse triage", () => {
  it("defaults auto-pause threshold", () => {
    expect(abuseAutoPauseReportThreshold()).toBeGreaterThanOrEqual(2);
  });
});
