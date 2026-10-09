import {
  WORKER_PROTOCOL_COMPATIBILITY_WINDOW,
  type PROTOCOL_VERSION,
} from "@kivro/contracts";
import type { WorkerTransportKind } from "./ports.js";

export const NETSONS_DEFAULT_CONTROL_PLANE_ID = "netsons-default" as const;
export const AWS_DEFAULT_CONTROL_PLANE_ID = "aws-default" as const;

export type ControlPlaneLifecycleState = "ACTIVE" | "DRAINING" | "RETIRED";

export type PollingTransportAdvertisement = {
  kind: "polling";
  protocolVersion: typeof PROTOCOL_VERSION;
  pollPath: string;
  heartbeatPath: string;
  baseUrl: string;
};

export type WssTransportAdvertisement = {
  kind: "wss";
  protocolVersion: typeof PROTOCOL_VERSION;
  wssUrl: string;
};

export type ControlPlaneAdvertisement = {
  controlPlaneId: string;
  lifecycleState: ControlPlaneLifecycleState;
  transports: Array<PollingTransportAdvertisement | WssTransportAdvertisement>;
};

/** PORT-021 — versioned transport connection parameters per control plane. */
export type WorkerServiceDiscoveryDocument = {
  protocolVersion: typeof PROTOCOL_VERSION;
  compatibilityWindow: typeof WORKER_PROTOCOL_COMPATIBILITY_WINDOW;
  controlPlanes: ControlPlaneAdvertisement[];
};

export function buildWorkerServiceDiscoveryDocument(input: {
  protocolVersion: typeof PROTOCOL_VERSION;
  publicApiBaseUrl: string;
  controlPlanes: ControlPlaneAdvertisement[];
}): WorkerServiceDiscoveryDocument {
  const base = input.publicApiBaseUrl.replace(/\/$/, "");
  return {
    protocolVersion: input.protocolVersion,
    compatibilityWindow: WORKER_PROTOCOL_COMPATIBILITY_WINDOW,
    controlPlanes: input.controlPlanes.map((cp) => ({
      ...cp,
      transports: cp.transports.map((t) => {
        if (t.kind === "polling") {
          return {
            ...t,
            baseUrl: t.baseUrl || base,
            pollPath: t.pollPath || "/worker/poll",
            heartbeatPath: t.heartbeatPath || "/worker/heartbeat",
          };
        }
        return t;
      }),
    })),
  };
}

export function listAdvertisedTransportKinds(
  doc: WorkerServiceDiscoveryDocument,
): WorkerTransportKind[] {
  const kinds = new Set<WorkerTransportKind>();
  for (const cp of doc.controlPlanes) {
    for (const t of cp.transports) {
      kinds.add(t.kind);
    }
  }
  return [...kinds].sort();
}
