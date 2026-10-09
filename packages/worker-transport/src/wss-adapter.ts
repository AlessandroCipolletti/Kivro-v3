import type { WorkerTransportPort } from "@kivro/cloud-core";
import { PROTOCOL_VERSION } from "@kivro/contracts";
import { createEnvelope, parsePollPayload } from "./shared.js";

/** Authenticated WebSocket transport (AWS baseline — ARCH-UNI-008). */
export function createWssWorkerTransport(input: {
  controlPlaneId: string;
  workerDeviceId: string;
  wssUrl: string;
}): WorkerTransportPort {
  const { controlPlaneId, workerDeviceId, wssUrl } = input;
  return {
    kind: "wss",
    protocolVersion: PROTOCOL_VERSION,
    buildHeartbeat(body) {
      return createEnvelope({ controlPlaneId, workerDeviceId, operation: "heartbeat", body });
    },
    buildPoll() {
      return createEnvelope({ controlPlaneId, workerDeviceId, operation: "poll", body: {} });
    },
    parsePollResponse(payload) {
      return parsePollPayload(payload);
    },
    encodeForWire(envelope) {
      return JSON.stringify({
        transport: "wss",
        frame: { type: envelope.operation, url: wssUrl },
        envelope,
      });
    },
    decodeFromWire(encoded) {
      const parsed = JSON.parse(encoded) as { envelope: ReturnType<typeof createEnvelope> };
      return parsed.envelope;
    },
  };
}
