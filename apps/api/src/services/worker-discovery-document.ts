import {
  AWS_DEFAULT_CONTROL_PLANE_ID,
  NETSONS_DEFAULT_CONTROL_PLANE_ID,
  buildWorkerServiceDiscoveryDocument,
} from "@kivro/cloud-core";
import { PROTOCOL_VERSION } from "@kivro/contracts";

function lifecycleFromEnv(
  key: string,
  fallback: "ACTIVE" | "DRAINING" | "RETIRED",
): "ACTIVE" | "DRAINING" | "RETIRED" {
  const raw = process.env[key]?.trim().toUpperCase();
  if (raw === "ACTIVE" || raw === "DRAINING" || raw === "RETIRED") {
    return raw;
  }
  return fallback;
}

/** Unified discovery for backend transition (PORT-021, ARCH-UNI-022). */
export function buildApiWorkerDiscoveryDocument(publicApiBaseUrl: string) {
  const base = publicApiBaseUrl.replace(/\/$/, "");
  const wsBase = base.replace(/^http/, "ws");
  return buildWorkerServiceDiscoveryDocument({
    protocolVersion: PROTOCOL_VERSION,
    publicApiBaseUrl: base,
    controlPlanes: [
      {
        controlPlaneId: NETSONS_DEFAULT_CONTROL_PLANE_ID,
        lifecycleState: lifecycleFromEnv("KIVRO_NETSONS_CP_STATE", "DRAINING"),
        transports: [
          {
            kind: "polling",
            protocolVersion: PROTOCOL_VERSION,
            baseUrl: base,
            pollPath: "/worker/poll",
            heartbeatPath: "/worker/heartbeat",
          },
        ],
      },
      {
        controlPlaneId: AWS_DEFAULT_CONTROL_PLANE_ID,
        lifecycleState: lifecycleFromEnv("KIVRO_AWS_CP_STATE", "ACTIVE"),
        transports: [
          {
            kind: "wss",
            protocolVersion: PROTOCOL_VERSION,
            wssUrl: `${wsBase}/worker/wss`,
          },
        ],
      },
    ],
  });
}
