import type { PROTOCOL_VERSION } from "@kivro/contracts";

export type WorkerTransportKind = "polling" | "wss";

/** Canonical Worker Protocol message envelope (transport-agnostic). */
export interface WorkerProtocolEnvelope {
  protocolVersion: typeof PROTOCOL_VERSION;
  controlPlaneId: string;
  workerDeviceId: string;
  operation: "heartbeat" | "poll" | "accept" | "complete";
  body: Record<string, unknown>;
}

export interface WorkerPollResult {
  offers: Array<{ jobId: string; workerId: string; capabilityVersionId: string }>;
}

/** Shared port implemented by polling and WebSocket adapters (ARCH-UNI-005, PORT-*). */
export interface WorkerTransportPort {
  readonly kind: WorkerTransportKind;
  readonly protocolVersion: typeof PROTOCOL_VERSION;
  buildHeartbeat(body: Record<string, unknown>): WorkerProtocolEnvelope;
  buildPoll(): WorkerProtocolEnvelope;
  parsePollResponse(payload: unknown): WorkerPollResult;
  /** Wire encoding differs by transport; semantics must not. */
  encodeForWire(envelope: WorkerProtocolEnvelope): string;
  decodeFromWire(encoded: string): WorkerProtocolEnvelope;
}
