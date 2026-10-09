import type { WorkerTransportPort } from "@kivro/cloud-core";
import { fetchWithPollingRetry, type PollingRetryPolicy } from "./retry-backoff.js";
import { dispatchWssNativeFrame } from "./wss-native-dispatch.js";

export type WssDispatchMode = "native" | "shim";

export type WorkerCloudClient = {
  transport: WorkerTransportPort;
  sendHeartbeat(body: Record<string, unknown>): Promise<Response>;
  sendPoll(): Promise<Response>;
};

/** Dispatch transport envelopes to HTTP (polling paths or WSS shim). */
export function createWorkerCloudClient(input: {
  transport: WorkerTransportPort;
  cloudBaseUrl: string;
  workerDeviceId: string;
  pollingRetryPolicy?: PollingRetryPolicy;
  wssDispatchMode?: WssDispatchMode;
}): WorkerCloudClient {
  const base = input.cloudBaseUrl.replace(/\/$/, "");
  const wssMode = input.wssDispatchMode ?? "native";
  const headers = {
    "content-type": "application/json",
    "x-worker-device-id": input.workerDeviceId,
  };

  async function dispatch(envelope: ReturnType<WorkerTransportPort["buildPoll"]>): Promise<Response> {
    if (input.transport.kind === "polling") {
      const wire = JSON.parse(input.transport.encodeForWire(envelope)) as {
        http: { method: string; path: string };
        envelope: { body: Record<string, unknown> };
      };
      return fetchWithPollingRetry(
        `${base}${wire.http.path}`,
        {
          method: wire.http.method,
          headers,
          body:
            envelope.operation === "poll"
              ? "{}"
              : JSON.stringify(envelope.body),
        },
        input.pollingRetryPolicy,
      );
    }
    const encoded = input.transport.encodeForWire(envelope);
    if (wssMode === "native") {
      const wire = JSON.parse(encoded) as { frame?: { url?: string } };
      const wssUrl =
        wire.frame?.url ??
        `${base.replace(/^http/, "ws")}/worker/wss`;
      return dispatchWssNativeFrame({
        wssUrl,
        workerDeviceId: input.workerDeviceId,
        encoded,
      });
    }
    return fetch(`${base}/worker/wss/dispatch`, {
      method: "POST",
      headers: {
        ...headers,
        "content-type": "text/plain; charset=utf-8",
      },
      body: encoded,
    });
  }

  return {
    transport: input.transport,
    sendHeartbeat(body) {
      return dispatch(input.transport.buildHeartbeat(body));
    },
    sendPoll() {
      return dispatch(input.transport.buildPoll());
    },
  };
}
