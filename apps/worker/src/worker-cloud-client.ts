import {
  createPollingWorkerTransport,
  createWorkerCloudClient,
  createWorkerMultiCloudClient,
  createWssWorkerTransport,
  selectWorkerTransportBinding,
  type WorkerCloudClient,
  type WorkerMultiCloudClient,
  type WssDispatchMode,
} from "@kivro/worker-transport";
import {
  AWS_DEFAULT_CONTROL_PLANE_ID,
  NETSONS_DEFAULT_CONTROL_PLANE_ID,
  buildWorkerServiceDiscoveryDocument,
  type WorkerServiceDiscoveryDocument,
} from "@kivro/cloud-core";
import { PROTOCOL_VERSION } from "@kivro/contracts";

function wssDispatchMode(): WssDispatchMode {
  return (process.env.KIVRO_WSS_DISPATCH ?? "native").toLowerCase() === "shim"
    ? "shim"
    : "native";
}

function wsUrl(cloudUrl: string): string {
  return `${cloudUrl.replace(/^http/, "ws")}/worker/wss`;
}

async function fetchCloudDiscovery(cloudUrl: string): Promise<WorkerServiceDiscoveryDocument | null> {
  try {
    const res = await fetch(`${cloudUrl.replace(/\/$/, "")}/worker/discovery`);
    if (!res.ok) {
      return null;
    }
    return (await res.json()) as WorkerServiceDiscoveryDocument;
  } catch {
    return null;
  }
}

export type WorkerCloudRuntime =
  | { mode: "single"; client: WorkerCloudClient }
  | { mode: "dual"; client: WorkerMultiCloudClient };

export async function resolveWorkerCloudRuntime(input: {
  cloudUrl: string;
  workerDeviceId: string;
  controlPlaneId?: string;
}): Promise<WorkerCloudRuntime> {
  const dual = process.env.KIVRO_DUAL_CONTROL_PLANE === "1";
  const wssMode = wssDispatchMode();

  if (!dual) {
    const controlPlaneId = input.controlPlaneId ?? process.env.KIVRO_CONTROL_PLANE_ID ?? "local-dev";
    const mode = (process.env.KIVRO_WORKER_TRANSPORT ?? "polling").toLowerCase();
    const transport =
      mode === "wss"
        ? createWssWorkerTransport({
            controlPlaneId,
            workerDeviceId: input.workerDeviceId,
            wssUrl: wsUrl(input.cloudUrl),
          })
        : createPollingWorkerTransport({
            controlPlaneId,
            workerDeviceId: input.workerDeviceId,
            cloudBaseUrl: input.cloudUrl,
          });
    return {
      mode: "single",
      client: createWorkerCloudClient({
        transport,
        cloudBaseUrl: input.cloudUrl,
        workerDeviceId: input.workerDeviceId,
        wssDispatchMode: wssMode,
      }),
    };
  }

  const discovery =
    (await fetchCloudDiscovery(input.cloudUrl)) ??
    buildWorkerServiceDiscoveryDocument({
      protocolVersion: PROTOCOL_VERSION,
      publicApiBaseUrl: input.cloudUrl,
      controlPlanes: [
        {
          controlPlaneId: NETSONS_DEFAULT_CONTROL_PLANE_ID,
          lifecycleState:
            (process.env.KIVRO_NETSONS_CP_STATE as "DRAINING" | "ACTIVE" | undefined) ??
            "DRAINING",
          transports: [
            {
              kind: "polling",
              protocolVersion: PROTOCOL_VERSION,
              baseUrl: input.cloudUrl,
              pollPath: "/worker/poll",
              heartbeatPath: "/worker/heartbeat",
            },
          ],
        },
        {
          controlPlaneId: AWS_DEFAULT_CONTROL_PLANE_ID,
          lifecycleState:
            (process.env.KIVRO_AWS_CP_STATE as "ACTIVE" | "DRAINING" | undefined) ?? "ACTIVE",
          transports: [
            {
              kind: "wss",
              protocolVersion: PROTOCOL_VERSION,
              wssUrl: wsUrl(input.cloudUrl),
            },
          ],
        },
      ],
    });

  const bindings = selectWorkerTransportBinding({
    discovery,
    workerDeviceId: input.workerDeviceId,
    buildTransport: ({ controlPlaneId, kind, connection }) => {
      if (kind === "polling" && connection.kind === "polling") {
        return createPollingWorkerTransport({
          controlPlaneId,
          workerDeviceId: input.workerDeviceId,
          cloudBaseUrl: connection.baseUrl,
        });
      }
      const wss =
        connection.kind === "wss"
          ? connection.wssUrl
          : wsUrl(input.cloudUrl);
      return createWssWorkerTransport({
        controlPlaneId,
        workerDeviceId: input.workerDeviceId,
        wssUrl: wss,
      });
    },
  });

  return {
    mode: "dual",
    client: createWorkerMultiCloudClient({
      cloudBaseUrl: input.cloudUrl,
      workerDeviceId: input.workerDeviceId,
      bindings,
      wssDispatchMode: wssMode,
    }),
  };
}

/** @deprecated use resolveWorkerCloudRuntime */
export async function resolveWorkerCloudClient(input: {
  cloudUrl: string;
  workerDeviceId: string;
  controlPlaneId?: string;
}): Promise<WorkerCloudClient> {
  const runtime = await resolveWorkerCloudRuntime(input);
  if (runtime.mode === "dual") {
    const active =
      runtime.client.session
        .listBindings()
        .find((b) => b.lifecycleState === "ACTIVE") ?? runtime.client.session.listBindings()[0];
    if (!active) {
      throw new Error("No transport bindings");
    }
    return runtime.client.clientFor(active.controlPlaneId);
  }
  return runtime.client;
}
