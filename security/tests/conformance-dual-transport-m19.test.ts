import { describe, expect, it } from "vitest";
import {
  AWS_DEFAULT_CONTROL_PLANE_ID,
  NETSONS_DEFAULT_CONTROL_PLANE_ID,
  buildWorkerServiceDiscoveryDocument,
} from "@kivro/cloud-core";
import { PROTOCOL_VERSION } from "@kivro/contracts";
import {
  assertTransportSemanticParity,
  createPollingWorkerTransport,
  createWssWorkerTransport,
  selectWorkerTransportBinding,
  WorkerMultiTransportSession,
} from "@kivro/worker-transport";

/**
 * ARCH-UNI-022 / PORT-029 — one paired Worker uses Netsons polling (DRAINING)
 * and AWS WSS (ACTIVE) without cross-routing (simulated harness).
 */
describe("M19 dual control-plane transport coexistence", () => {
  const workerDeviceId = "wd-m19-dual";

  it("M19-GOLD-004 discovery advertises both control planes", () => {
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
    expect(doc.controlPlanes).toHaveLength(2);
    expect(doc.compatibilityWindow.minSupportedProtocolVersion).toBe(PROTOCOL_VERSION);
  });

  it("M19-GOLD-005 simultaneous polling+DRAINING and wss+ACTIVE on one Worker", () => {
    const discovery = buildWorkerServiceDiscoveryDocument({
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
      discovery,
      workerDeviceId,
      buildTransport: ({ controlPlaneId, kind }) =>
        kind === "polling"
          ? createPollingWorkerTransport({
              controlPlaneId,
              workerDeviceId,
              cloudBaseUrl: "http://localhost:3001",
            })
          : createWssWorkerTransport({
              controlPlaneId,
              workerDeviceId,
              wssUrl: "ws://localhost:3001/worker/wss",
            }),
    });

    const session = new WorkerMultiTransportSession();
    for (const b of bindings) {
      session.register(b);
    }

    const polling = session.getBinding(NETSONS_DEFAULT_CONTROL_PLANE_ID).transport;
    const wss = session.getBinding(AWS_DEFAULT_CONTROL_PLANE_ID).transport;
    assertTransportSemanticParity(polling, wss);

    const drainingPoll = polling.buildPoll();
    const activePoll = wss.buildPoll();
    expect(drainingPoll.controlPlaneId).toBe(NETSONS_DEFAULT_CONTROL_PLANE_ID);
    expect(activePoll.controlPlaneId).toBe(AWS_DEFAULT_CONTROL_PLANE_ID);

    session.assertExecutionRouting({
      envelopeControlPlaneId: drainingPoll.controlPlaneId,
      executionControlPlaneId: drainingPoll.controlPlaneId,
    });
  });
});
