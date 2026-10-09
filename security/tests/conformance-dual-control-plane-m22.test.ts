import { describe, expect, it } from "vitest";
import {
  AWS_DEFAULT_CONTROL_PLANE_ID,
  NETSONS_DEFAULT_CONTROL_PLANE_ID,
  buildWorkerServiceDiscoveryDocument,
  dedupePollOffersByJobId,
  jobVisibleOnControlPlane,
  resolveActiveControlPlaneIdForNewExecutions,
  resolveExecutionControlPlaneForDispatch,
} from "@kivro/cloud-core";
import {
  WorkerMultiTransportSession,
  createPollingWorkerTransport,
  createWssWorkerTransport,
  selectWorkerTransportBinding,
} from "@kivro/worker-transport";
import { PROTOCOL_VERSION } from "@kivro/contracts";

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

  it("M22-GOLD-003 ASYNC-GOLD-010 policy — A1 stays Netsons after ACTIVE flip", () => {
    expect(
      resolveExecutionControlPlaneForDispatch({
        existingExecutionControlPlaneId: NETSONS_DEFAULT_CONTROL_PLANE_ID,
        proposedControlPlaneId: AWS_DEFAULT_CONTROL_PLANE_ID,
      }),
    ).toBe(NETSONS_DEFAULT_CONTROL_PLANE_ID);
  });

  it("M22-GOLD-004 RETIRED plane omitted from worker bindings", () => {
    const doc = buildWorkerServiceDiscoveryDocument({
      protocolVersion: PROTOCOL_VERSION,
      publicApiBaseUrl: "http://localhost:3001",
      controlPlanes: [
        {
          controlPlaneId: NETSONS_DEFAULT_CONTROL_PLANE_ID,
          lifecycleState: "RETIRED",
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
      workerDeviceId: "wd",
      buildTransport: ({ controlPlaneId, kind, connection }) =>
        kind === "polling"
          ? createPollingWorkerTransport({
              controlPlaneId,
              workerDeviceId: "wd",
              cloudBaseUrl: "http://localhost:3001",
            })
          : createWssWorkerTransport({
              controlPlaneId,
              workerDeviceId: "wd",
              wssUrl: connection.kind === "wss" ? connection.wssUrl : "ws://x",
            }),
    });
    expect(bindings.map((b) => b.controlPlaneId)).toEqual([AWS_DEFAULT_CONTROL_PLANE_ID]);
  });

  it("M22-GOLD-007 stale discovery refresh drops retired Netsons binding", () => {
    const before = buildWorkerServiceDiscoveryDocument({
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
    const after = buildWorkerServiceDiscoveryDocument({
      protocolVersion: PROTOCOL_VERSION,
      publicApiBaseUrl: "http://localhost:3001",
      controlPlanes: [
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
    const build = (discovery: ReturnType<typeof buildWorkerServiceDiscoveryDocument>) =>
      selectWorkerTransportBinding({
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
    expect(build(before).map((b) => b.controlPlaneId).sort()).toEqual(
      [AWS_DEFAULT_CONTROL_PLANE_ID, NETSONS_DEFAULT_CONTROL_PLANE_ID].sort(),
    );
    expect(build(after).map((b) => b.controlPlaneId)).toEqual([AWS_DEFAULT_CONTROL_PLANE_ID]);
  });

  it("M22-GOLD-006 rollback before retirement — new work binds to Netsons", () => {
    const rollbackEnv = {
      KIVRO_DUAL_CONTROL_PLANE: "1",
      KIVRO_NETSONS_CP_STATE: "ACTIVE",
      KIVRO_AWS_CP_STATE: "DRAINING",
    } as NodeJS.ProcessEnv;
    expect(resolveActiveControlPlaneIdForNewExecutions(rollbackEnv)).toBe(
      NETSONS_DEFAULT_CONTROL_PLANE_ID,
    );
  });

  it("M22-GOLD-005 duplicate poll offers deduped by jobId", () => {
    const offers = dedupePollOffersByJobId([
      { jobId: "j1", controlPlaneId: "netsons-default" },
      { jobId: "j1", controlPlaneId: "aws-default" },
      { jobId: "j2", controlPlaneId: "aws-default" },
    ]);
    expect(offers).toHaveLength(2);
    expect(offers[0]?.jobId).toBe("j1");
  });
});
