import { afterEach, describe, expect, it } from "vitest";
import {
  AWS_DEFAULT_CONTROL_PLANE_ID,
  NETSONS_DEFAULT_CONTROL_PLANE_ID,
} from "./worker-discovery.js";
import {
  controlPlaneMayAcceptNewExecutions,
  jobVisibleOnControlPlane,
  resolveActiveControlPlaneIdForNewExecutions,
} from "./control-plane-policy.js";

describe("control-plane-policy (M22)", () => {
  const saved: Record<string, string | undefined> = {};

  afterEach(() => {
    for (const [k, v] of Object.entries(saved)) {
      if (v === undefined) delete process.env[k];
      else process.env[k] = v;
    }
  });

  function snapshot(keys: string[]) {
    for (const k of keys) {
      saved[k] = process.env[k];
    }
  }

  it("dual mode: new executions bind to sole ACTIVE control plane", () => {
    snapshot(["KIVRO_DUAL_CONTROL_PLANE", "KIVRO_NETSONS_CP_STATE", "KIVRO_AWS_CP_STATE"]);
    process.env.KIVRO_DUAL_CONTROL_PLANE = "1";
    process.env.KIVRO_NETSONS_CP_STATE = "DRAINING";
    process.env.KIVRO_AWS_CP_STATE = "ACTIVE";
    expect(resolveActiveControlPlaneIdForNewExecutions(process.env)).toBe(
      AWS_DEFAULT_CONTROL_PLANE_ID,
    );
    expect(
      controlPlaneMayAcceptNewExecutions(NETSONS_DEFAULT_CONTROL_PLANE_ID, process.env),
    ).toBe(false);
  });

  it("in-flight A1 stays on Netsons poll while AWS is ACTIVE", () => {
    expect(
      jobVisibleOnControlPlane({
        jobExecutionControlPlaneId: NETSONS_DEFAULT_CONTROL_PLANE_ID,
        requestControlPlaneId: NETSONS_DEFAULT_CONTROL_PLANE_ID,
        fallbackControlPlaneId: AWS_DEFAULT_CONTROL_PLANE_ID,
      }),
    ).toBe(true);
    expect(
      jobVisibleOnControlPlane({
        jobExecutionControlPlaneId: NETSONS_DEFAULT_CONTROL_PLANE_ID,
        requestControlPlaneId: AWS_DEFAULT_CONTROL_PLANE_ID,
        fallbackControlPlaneId: AWS_DEFAULT_CONTROL_PLANE_ID,
      }),
    ).toBe(false);
  });

  it("rollback: Netsons ACTIVE again accepts new dispatch target", () => {
    snapshot(["KIVRO_DUAL_CONTROL_PLANE", "KIVRO_NETSONS_CP_STATE", "KIVRO_AWS_CP_STATE"]);
    process.env.KIVRO_DUAL_CONTROL_PLANE = "1";
    process.env.KIVRO_NETSONS_CP_STATE = "ACTIVE";
    process.env.KIVRO_AWS_CP_STATE = "DRAINING";
    expect(resolveActiveControlPlaneIdForNewExecutions(process.env)).toBe(
      NETSONS_DEFAULT_CONTROL_PLANE_ID,
    );
  });
});
