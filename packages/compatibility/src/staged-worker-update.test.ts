import { describe, expect, it } from "vitest";
import {
  beginStagedWorkerUpdate,
  promoteStagedWorkerToStaging,
  recordStagingHealthCheck,
  rollbackStagedWorkerUpdate,
} from "./staged-worker-update.js";

describe("staged Worker update (HARD-012)", () => {
  it("requires verified signature before download", () => {
    expect(() =>
      beginStagedWorkerUpdate({
        state: { phase: "idle" },
        targetVersion: "0.0.0-m08",
        signatureVerified: false,
      }),
    ).toThrow(/unsigned/i);
  });

  it("promotes through staging health checks to active", () => {
    let state = beginStagedWorkerUpdate({
      state: { phase: "idle" },
      targetVersion: "0.0.0-m08",
      signatureVerified: true,
    });
    state = promoteStagedWorkerToStaging(state, 2);
    state = recordStagingHealthCheck(state);
    expect(state.phase).toBe("staging");
    state = recordStagingHealthCheck(state);
    expect(state).toEqual({ phase: "active", version: "0.0.0-m08" });
  });

  it("supports rollback from staging", () => {
    const rolled = rollbackStagedWorkerUpdate({
      state: { phase: "staging", version: "0.0.0-m08", healthChecksPassed: 0, requiredHealthChecks: 2 },
      previousActiveVersion: "0.0.0-m07",
      reason: "health check failed",
    });
    expect(rolled.phase).toBe("rollback");
  });
});
