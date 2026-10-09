import { describe, expect, it } from "vitest";
import { buildWorkerServiceDiscoveryDocument } from "@kivro/cloud-core";
import { PROTOCOL_VERSION } from "@kivro/contracts";
import {
  createPollingWorkerTransport,
  createWssWorkerTransport,
  selectWorkerTransportBinding,
  WorkerMultiTransportSession,
} from "./index.js";

describe("worker multi-transport session", () => {
  it("blocks cross control-plane execution routing (PORT-022/023)", () => {
    const session = new WorkerMultiTransportSession();
    session.register({
      controlPlaneId: "netsons-default",
      lifecycleState: "DRAINING",
      transport: createPollingWorkerTransport({
        controlPlaneId: "netsons-default",
        workerDeviceId: "wd",
        cloudBaseUrl: "http://localhost:3001",
      }),
    });
    session.register({
      controlPlaneId: "aws-default",
      lifecycleState: "ACTIVE",
      transport: createWssWorkerTransport({
        controlPlaneId: "aws-default",
        workerDeviceId: "wd",
        wssUrl: "ws://localhost:3001/worker/wss",
      }),
    });

    const poll = session
      .resolveTransportForEnvelope(
        session.getBinding("netsons-default").transport.buildPoll(),
      )
      .buildPoll();
    expect(poll.controlPlaneId).toBe("netsons-default");

    expect(() =>
      session.assertExecutionRouting({
        envelopeControlPlaneId: "netsons-default",
        executionControlPlaneId: "aws-default",
      }),
    ).toThrow(/Cross control-plane routing blocked/);
  });

  it("selects transports deterministically from discovery (PORT-027)", () => {
    const discovery = buildWorkerServiceDiscoveryDocument({
      protocolVersion: PROTOCOL_VERSION,
      publicApiBaseUrl: "http://localhost:3001",
      controlPlanes: [
        {
          controlPlaneId: "b-cp",
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
          controlPlaneId: "a-cp",
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
      workerDeviceId: "wd",
      buildTransport: ({ controlPlaneId, kind }) =>
        kind === "polling"
          ? createPollingWorkerTransport({
              controlPlaneId,
              workerDeviceId: "wd",
              cloudBaseUrl: "http://localhost:3001",
            })
          : createWssWorkerTransport({
              controlPlaneId,
              workerDeviceId: "wd",
              wssUrl: "ws://localhost:3001/worker/wss",
            }),
    });

    expect(bindings.map((b) => b.controlPlaneId)).toEqual(["a-cp", "b-cp"]);
    expect(bindings[0]?.lifecycleState).toBe("ACTIVE");
  });
});
