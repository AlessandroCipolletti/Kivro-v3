import type { WorkerTransportPort } from "@kivro/cloud-core";
import { createWorkerCloudClient, type WorkerCloudClient } from "./http-client.js";
import {
  WorkerMultiTransportSession,
  type ControlPlaneTransportBinding,
} from "./multi-transport.js";
import type { PollingRetryPolicy } from "./retry-backoff.js";
import type { WssDispatchMode } from "./http-client.js";

export type WorkerMultiCloudClient = {
  session: WorkerMultiTransportSession;
  clientFor(controlPlaneId: string): WorkerCloudClient;
  sendHeartbeatOn(controlPlaneId: string, body: Record<string, unknown>): Promise<Response>;
  sendPollOn(controlPlaneId: string): Promise<Response>;
  sendHeartbeatOnAll(body: Record<string, unknown>): Promise<Response[]>;
  sendPollOnAll(): Promise<Response[]>;
};

/** PORT-022 — simultaneous transports keyed by controlPlaneId. */
export function createWorkerMultiCloudClient(input: {
  cloudBaseUrl: string;
  workerDeviceId: string;
  bindings: ControlPlaneTransportBinding[];
  pollingRetryPolicy?: PollingRetryPolicy;
  wssDispatchMode?: WssDispatchMode;
}): WorkerMultiCloudClient {
  const session = new WorkerMultiTransportSession();
  const clients = new Map<string, WorkerCloudClient>();
  for (const binding of input.bindings) {
    session.register(binding);
    clients.set(
      binding.controlPlaneId,
      createWorkerCloudClient({
        transport: binding.transport,
        cloudBaseUrl: input.cloudBaseUrl,
        workerDeviceId: input.workerDeviceId,
        pollingRetryPolicy: input.pollingRetryPolicy,
        wssDispatchMode: input.wssDispatchMode,
      }),
    );
  }

  return {
    session,
    clientFor(controlPlaneId) {
      const client = clients.get(controlPlaneId);
      if (!client) {
        throw new Error(`No client for controlPlaneId ${controlPlaneId}`);
      }
      return client;
    },
    sendHeartbeatOn(controlPlaneId, body) {
      return this.clientFor(controlPlaneId).sendHeartbeat(body);
    },
    sendPollOn(controlPlaneId) {
      return this.clientFor(controlPlaneId).sendPoll();
    },
    async sendHeartbeatOnAll(body) {
      return Promise.all(
        session.listBindings().map((b) => this.sendHeartbeatOn(b.controlPlaneId, body)),
      );
    },
    async sendPollOnAll() {
      return Promise.all(session.listBindings().map((b) => this.sendPollOn(b.controlPlaneId)));
    },
  };
}

export function bindingsFromTransports(input: {
  workerDeviceId: string;
  cloudBaseUrl: string;
  entries: Array<{
    controlPlaneId: string;
    lifecycleState: ControlPlaneTransportBinding["lifecycleState"];
    kind: WorkerTransportPort["kind"];
    wssUrl?: string;
  }>;
  createTransport: (args: {
    controlPlaneId: string;
    workerDeviceId: string;
    kind: WorkerTransportPort["kind"];
    cloudBaseUrl: string;
    wssUrl?: string;
  }) => WorkerTransportPort;
}): ControlPlaneTransportBinding[] {
  return input.entries.map((e) => ({
    controlPlaneId: e.controlPlaneId,
    lifecycleState: e.lifecycleState,
    transport: input.createTransport({
      controlPlaneId: e.controlPlaneId,
      workerDeviceId: input.workerDeviceId,
      kind: e.kind,
      cloudBaseUrl: input.cloudBaseUrl,
      wssUrl: e.wssUrl,
    }),
  }));
}
