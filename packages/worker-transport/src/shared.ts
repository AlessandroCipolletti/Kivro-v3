import { PROTOCOL_VERSION } from "@kivro/contracts";
import type { WorkerPollResult, WorkerProtocolEnvelope, WorkerTransportPort } from "@kivro/cloud-core";

export function parsePollPayload(payload: unknown): WorkerPollResult {
  const obj = payload as { offers?: WorkerPollResult["offers"] };
  return { offers: obj.offers ?? [] };
}

export function createEnvelope(input: {
  controlPlaneId: string;
  workerDeviceId: string;
  operation: WorkerProtocolEnvelope["operation"];
  body: Record<string, unknown>;
}): WorkerProtocolEnvelope {
  return {
    protocolVersion: PROTOCOL_VERSION,
    controlPlaneId: input.controlPlaneId,
    workerDeviceId: input.workerDeviceId,
    operation: input.operation,
    body: input.body,
  };
}

export function assertTransportConformance(transport: WorkerTransportPort): void {
  const hb = transport.buildHeartbeat({ workerVersion: "test" });
  const round = transport.decodeFromWire(transport.encodeForWire(hb));
  if (round.operation !== "heartbeat" || round.protocolVersion !== PROTOCOL_VERSION) {
    throw new Error("Transport wire round-trip failed for heartbeat");
  }
  const poll = transport.buildPoll();
  const sample = { offers: [{ jobId: "j1", workerId: "w1", capabilityVersionId: "cv1" }] };
  const parsed = transport.parsePollResponse(sample);
  if (parsed.offers.length !== 1 || parsed.offers[0]?.jobId !== "j1") {
    throw new Error("Transport poll parsing failed");
  }
  if (poll.operation !== "poll") {
    throw new Error("Transport poll envelope invalid");
  }
}
