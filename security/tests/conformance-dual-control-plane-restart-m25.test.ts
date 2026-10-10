import { describe, expect, it } from "vitest";
import {
  AWS_DEFAULT_CONTROL_PLANE_ID,
  NETSONS_DEFAULT_CONTROL_PLANE_ID,
  buildWorkerServiceDiscoveryDocument,
  jobVisibleOnControlPlane,
  resolveActiveControlPlaneIdForNewExecutions,
} from "@kivro/cloud-core";
import {
  WorkerMultiTransportSession,
  createPollingWorkerTransport,
  createWssWorkerTransport,
  selectWorkerTransportBinding,
} from "@kivro/worker-transport";
import { backendTransitionRequiresWorkerBinaryUpdate } from "@kivro/compatibility";
import { PROTOCOL_VERSION } from "@kivro/contracts";

/** M25 — Worker restart during dual ACTIVE/DRAINING coexistence (IMPLEMENTATION-PLAN). */
describe("M25 dual control-plane restart continuity", () => {
  const env = {
    KIVRO_DUAL_CONTROL_PLANE: "1",
    KIVRO_NETSONS_CP_STATE: "DRAINING",
    KIVRO_AWS_CP_STATE: "ACTIVE",
  } as NodeJS.ProcessEnv;

  it("M25-GOLD-004 in-flight job stays on Netsons after transport session rebuild", () => {
    const a1 = NETSONS_DEFAULT_CONTROL_PLANE_ID;
    const doc = buildWorkerServiceDiscoveryDocument({
      protocolVersion: PROTOCOL_VERSION,
      publicApiBaseUrl: "http://localhost:3001",
      controlPlanes: [
        {
          controlPlaneId: NETSONS_DEFAULT_CONTROL_PLANE_ID,
          lifecycleState: "DRAINING",
          transports: [
            {
              kind: "polling",
              protocolVersion: PROTOCOL_VERSION,
              baseUrl: "http://localhost:3001",
              pollPath: "/worker/poll",
              heartbeatPath: "/worker/heartbeat",
            },
          ],
        },
        {
          controlPlaneId: AWS_DEFAULT_CONTROL_PLANE_ID,
          lifecycleState: "ACTIVE",
          transports: [
            {
              kind: "wss",
              protocolVersion: PROTOCOL_VERSION,
              wssUrl: "ws://localhost:3001/worker/wss",
            },
          ],
        },
      ],
    });

    const bindings = selectWorkerTransportBinding({
      discovery: doc,
      workerDeviceId: "wd-restart",
      buildTransport: ({ controlPlaneId, kind, connection }) =>
        kind === "polling"
          ? createPollingWorkerTransport({
              controlPlaneId,
              workerDeviceId: "wd-restart",
              cloudBaseUrl: "http://localhost:3001",
            })
          : createWssWorkerTransport({
              controlPlaneId,
              workerDeviceId: "wd-restart",
              wssUrl: connection.kind === "wss" ? connection.wssUrl : "ws://x",
            }),
    });

    const session = new WorkerMultiTransportSession();
    for (const binding of bindings) {
      session.register(binding);
    }
    expect(session.listBindings().map((b) => b.controlPlaneId).sort()).toEqual(
      [AWS_DEFAULT_CONTROL_PLANE_ID, NETSONS_DEFAULT_CONTROL_PLANE_ID].sort(),
    );

    expect(
      jobVisibleOnControlPlane({
        jobExecutionControlPlaneId: a1,
        requestControlPlaneId: NETSONS_DEFAULT_CONTROL_PLANE_ID,
        fallbackControlPlaneId: AWS_DEFAULT_CONTROL_PLANE_ID,
      }),
    ).toBe(true);

    expect(resolveActiveControlPlaneIdForNewExecutions(env)).toBe(AWS_DEFAULT_CONTROL_PLANE_ID);

    expect(
      backendTransitionRequiresWorkerBinaryUpdate({
        workerProtocolVersion: PROTOCOL_VERSION,
        workerAlreadySupportsTransports: ["polling", "wss"],
        targetActiveTransports: ["wss", "polling"],
      }),
    ).toBe(false);
  });
});
