import type { WorkerTransportPort } from "@kivro/cloud-core";
import { PROTOCOL_VERSION } from "@kivro/contracts";
import { createEnvelope, parsePollPayload } from "./shared.js";

/** HTTPS polling transport (Netsons baseline — ARCH-UNI-007). */
export function createPollingWorkerTransport(input: {
  controlPlaneId: string;
  workerDeviceId: string;
  cloudBaseUrl: string;
}): WorkerTransportPort {
  const { controlPlaneId, workerDeviceId, cloudBaseUrl } = input;
  return {
    kind: "polling",
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
        transport: "polling",
        http: {
          method: envelope.operation === "poll" ? "POST" : "POST",
          path:
            envelope.operation === "poll"
              ? "/worker/poll"
              : envelope.operation === "heartbeat"
                ? "/worker/heartbeat"
                : `/worker/jobs/${envelope.body.jobId ?? ""}/${envelope.operation}`,
          baseUrl: cloudBaseUrl,
        },
        envelope,
      });
    },
    decodeFromWire(encoded) {
      const parsed = JSON.parse(encoded) as { envelope: ReturnType<typeof createEnvelope> };
      return parsed.envelope;
    },
  };
}
