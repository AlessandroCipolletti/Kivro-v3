/** HARD-012 — staged Worker update with health verification and rollback. */

export type StagedWorkerUpdateState =
  | { phase: "idle" }
  | { phase: "downloaded"; version: string; signatureVerified: boolean }
  | { phase: "staging"; version: string; healthChecksPassed: number; requiredHealthChecks: number }
  | { phase: "active"; version: string }
  | { phase: "rollback"; targetVersion: string; reason: string };

export function beginStagedWorkerUpdate(input: {
  state: StagedWorkerUpdateState;
  targetVersion: string;
  signatureVerified: boolean;
}): StagedWorkerUpdateState {
  if (input.state.phase !== "idle" && input.state.phase !== "active") {
    throw new Error("Update already in progress");
  }
  if (!input.signatureVerified) {
    throw new Error("Refusing unsigned Worker release");
  }
  return {
    phase: "downloaded",
    version: input.targetVersion,
    signatureVerified: true,
  };
}

export function promoteStagedWorkerToStaging(
  state: StagedWorkerUpdateState,
  requiredHealthChecks = 2,
): StagedWorkerUpdateState {
  if (state.phase !== "downloaded" || !state.signatureVerified) {
    throw new Error("Downloaded signed release required before staging");
  }
  return {
    phase: "staging",
    version: state.version,
    healthChecksPassed: 0,
    requiredHealthChecks,
  };
}

export function recordStagingHealthCheck(state: StagedWorkerUpdateState): StagedWorkerUpdateState {
  if (state.phase !== "staging") {
    throw new Error("Not in staging phase");
  }
  const passed = state.healthChecksPassed + 1;
  if (passed >= state.requiredHealthChecks) {
    return { phase: "active", version: state.version };
  }
  return { ...state, healthChecksPassed: passed };
}

export function rollbackStagedWorkerUpdate(input: {
  state: StagedWorkerUpdateState;
  previousActiveVersion: string;
  reason: string;
}): StagedWorkerUpdateState {
  if (input.state.phase === "idle") {
    return { phase: "active", version: input.previousActiveVersion };
  }
  return {
    phase: "rollback",
    targetVersion: input.previousActiveVersion,
    reason: input.reason,
  };
}

export function completeRollback(state: StagedWorkerUpdateState): StagedWorkerUpdateState {
  if (state.phase !== "rollback") {
    throw new Error("Not rolling back");
  }
  return { phase: "active", version: state.targetVersion };
}
