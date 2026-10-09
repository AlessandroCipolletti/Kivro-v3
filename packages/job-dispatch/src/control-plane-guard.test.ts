import { describe, expect, it } from "vitest";
import { AWS_DEFAULT_CONTROL_PLANE_ID, NETSONS_DEFAULT_CONTROL_PLANE_ID } from "@kivro/cloud-core";
import { assertWorkerJobOnControlPlane } from "./control-plane-guard.js";

describe("assertWorkerJobOnControlPlane", () => {
  it("blocks cross control-plane accept", () => {
    expect(
      assertWorkerJobOnControlPlane({
        jobExecutionControlPlaneId: NETSONS_DEFAULT_CONTROL_PLANE_ID,
        requestControlPlaneId: AWS_DEFAULT_CONTROL_PLANE_ID,
        fallbackControlPlaneId: AWS_DEFAULT_CONTROL_PLANE_ID,
      }),
    ).toEqual({ error: "CROSS_CONTROL_PLANE" });
  });

  it("allows matching control plane", () => {
    expect(
      assertWorkerJobOnControlPlane({
        jobExecutionControlPlaneId: AWS_DEFAULT_CONTROL_PLANE_ID,
        requestControlPlaneId: AWS_DEFAULT_CONTROL_PLANE_ID,
        fallbackControlPlaneId: AWS_DEFAULT_CONTROL_PLANE_ID,
      }),
    ).toEqual({ ok: true });
  });
});
