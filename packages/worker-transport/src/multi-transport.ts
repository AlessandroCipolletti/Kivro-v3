import type {
  ControlPlaneLifecycleState,
  WorkerProtocolEnvelope,
  WorkerServiceDiscoveryDocument,
  WorkerTransportPort,
} from "@kivro/cloud-core";

export type ControlPlaneTransportBinding = {
  controlPlaneId: string;
  lifecycleState: ControlPlaneLifecycleState;
  transport: WorkerTransportPort;
};

/** PORT-022 / PORT-023 — scoped transports; no cross controlPlane routing. */
export class WorkerMultiTransportSession {
  private readonly bindings = new Map<string, ControlPlaneTransportBinding>();

  register(binding: ControlPlaneTransportBinding): void {
    if (this.bindings.has(binding.controlPlaneId)) {
      throw new Error(`Duplicate controlPlaneId: ${binding.controlPlaneId}`);
    }
    this.bindings.set(binding.controlPlaneId, binding);
  }

  getBinding(controlPlaneId: string): ControlPlaneTransportBinding {
    const b = this.bindings.get(controlPlaneId);
    if (!b) {
      throw new Error(`Unknown controlPlaneId: ${controlPlaneId}`);
    }
    return b;
  }

  resolveTransportForEnvelope(envelope: WorkerProtocolEnvelope): WorkerTransportPort {
    return this.getBinding(envelope.controlPlaneId).transport;
  }

  assertExecutionRouting(input: {
    envelopeControlPlaneId: string;
    executionControlPlaneId: string;
  }): void {
    if (input.envelopeControlPlaneId !== input.executionControlPlaneId) {
      throw new Error(
        `Cross control-plane routing blocked: ${input.envelopeControlPlaneId} -> ${input.executionControlPlaneId}`,
      );
    }
  }

  listBindings(): ControlPlaneTransportBinding[] {
    return [...this.bindings.values()].sort((a, b) =>
      a.controlPlaneId.localeCompare(b.controlPlaneId),
    );
  }
}

/** PORT-027 — deterministic, explicit transport selection from discovery. */
export function selectWorkerTransportBinding(input: {
  discovery: WorkerServiceDiscoveryDocument;
  workerDeviceId: string;
  buildTransport: (args: {
    controlPlaneId: string;
    kind: "polling" | "wss";
    connection: WorkerServiceDiscoveryDocument["controlPlanes"][number]["transports"][number];
  }) => WorkerTransportPort;
}): ControlPlaneTransportBinding[] {
  const sorted = [...input.discovery.controlPlanes].sort((a, b) => {
    const rank = (s: ControlPlaneLifecycleState) =>
      s === "ACTIVE" ? 0 : s === "DRAINING" ? 1 : 2;
    const d = rank(a.lifecycleState) - rank(b.lifecycleState);
    if (d !== 0) {
      return d;
    }
    return a.controlPlaneId.localeCompare(b.controlPlaneId);
  });

  const out: ControlPlaneTransportBinding[] = [];
  for (const cp of sorted) {
    if (cp.lifecycleState === "RETIRED") {
      continue;
    }
    const transports = [...cp.transports].sort((a, b) => a.kind.localeCompare(b.kind));
    const primary = transports[0];
    if (!primary) {
      continue;
    }
    out.push({
      controlPlaneId: cp.controlPlaneId,
      lifecycleState: cp.lifecycleState,
      transport: input.buildTransport({
        controlPlaneId: cp.controlPlaneId,
        kind: primary.kind,
        connection: primary,
      }),
    });
  }
  return out;
}

/** PORT-028 — reconnect must not imply duplicate financial side effects (transport layer is stateless). */
export function assertTransportReconnectIsSideEffectFree(input: {
  priorAckIdempotencyKey: string | null;
  nextAckIdempotencyKey: string | null;
}): void {
  if (
    input.priorAckIdempotencyKey &&
    input.nextAckIdempotencyKey &&
    input.priorAckIdempotencyKey !== input.nextAckIdempotencyKey
  ) {
    throw new Error("Transport reconnect changed idempotency key unexpectedly");
  }
}
