import { describe, expect, it } from "vitest";
import {
  AWS_DEFAULT_CONTROL_PLANE_ID,
  NETSONS_DEFAULT_CONTROL_PLANE_ID,
  jobVisibleOnControlPlane,
  resolveActiveControlPlaneIdForNewExecutions,
} from "@kivro/cloud-core";
import { WorkerMultiTransportSession } from "@kivro/worker-transport";
import { createPollingWorkerTransport, createWssWorkerTransport } from "@kivro/worker-transport";

/**
 * M22 acceptance harness — IMPLEMENTATION-PLAN dual-control-plane scenario (simulated).
 */
describe("M22 dual control-plane continuity", () => {
  const env = {
    KIVRO_DUAL_CONTROL_PLANE: "1",
    KIVRO_NETSONS_CP_STATE: "DRAINING",
    KIVRO_AWS_CP_STATE: "ACTIVE",
  } as NodeJS.ProcessEnv;

  it("M22-GOLD-001 A1 on Netsons, B1 new on AWS after ACTIVE switch", () => {
    const a1Owner = NETSONS_DEFAULT_CONTROL_PLANE_ID;
    const b1Owner = resolveActiveControlPlaneIdForNewExecutions(env);
    expect(b1Owner).toBe(AWS_DEFAULT_CONTROL_PLANE_ID);

    expect(
      jobVisibleOnControlPlane({
        jobExecutionControlPlaneId: a1Owner,
        requestControlPlaneId: NETSONS_DEFAULT_CONTROL_PLANE_ID,
        fallbackControlPlaneId: AWS_DEFAULT_CONTROL_PLANE_ID,
      }),
    ).toBe(true);
    expect(
      jobVisibleOnControlPlane({
        jobExecutionControlPlaneId: b1Owner,
        requestControlPlaneId: AWS_DEFAULT_CONTROL_PLANE_ID,
        fallbackControlPlaneId: AWS_DEFAULT_CONTROL_PLANE_ID,
      }),
    ).toBe(true);
    expect(
      jobVisibleOnControlPlane({
        jobExecutionControlPlaneId: b1Owner,
        requestControlPlaneId: NETSONS_DEFAULT_CONTROL_PLANE_ID,
        fallbackControlPlaneId: AWS_DEFAULT_CONTROL_PLANE_ID,
      }),
    ).toBe(false);
  });

  it("M22-GOLD-002 cross control-plane routing blocked at transport session", () => {
    const session = new WorkerMultiTransportSession();
    session.register({
      controlPlaneId: NETSONS_DEFAULT_CONTROL_PLANE_ID,
      lifecycleState: "DRAINING",
      transport: createPollingWorkerTransport({
        controlPlaneId: NETSONS_DEFAULT_CONTROL_PLANE_ID,
        workerDeviceId: "wd",
        cloudBaseUrl: "http://localhost:3001",
      }),
    });
    session.register({
      controlPlaneId: AWS_DEFAULT_CONTROL_PLANE_ID,
      lifecycleState: "ACTIVE",
      transport: createWssWorkerTransport({
        controlPlaneId: AWS_DEFAULT_CONTROL_PLANE_ID,
        workerDeviceId: "wd",
        wssUrl: "ws://localhost:3001/worker/wss",
      }),
    });
    expect(() =>
      session.assertExecutionRouting({
        envelopeControlPlaneId: AWS_DEFAULT_CONTROL_PLANE_ID,
        executionControlPlaneId: NETSONS_DEFAULT_CONTROL_PLANE_ID,
      }),
    ).toThrow(/Cross control-plane routing blocked/);
  });
});
