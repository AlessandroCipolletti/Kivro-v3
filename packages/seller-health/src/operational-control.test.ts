import { describe, expect, it } from "vitest";
import { sellerOperationalAnswers } from "./operational-control.js";

describe("seller operational control", () => {
  it("still allows an immediate stop when the cloud is unreachable", () => {
    const answers = sellerOperationalAnswers({
      workerHealthy: true,
      workerVersion: "1.4.0",
      openClawCompatible: true,
      isolationWorking: true,
      executingNow: 1,
      queued: 2,
      recentFailureCount: 0,
      securityWarnings: [],
      cloudReachable: false,
    });
    expect(answers.canStopAcceptingImmediately).toBe(true);
    expect(answers.stopPaths).toEqual(["LOCAL", "WEB_DASHBOARD"]);
    expect(answers.executingNow).toBe(1);
    expect(answers.queued).toBe(2);
  });
});
