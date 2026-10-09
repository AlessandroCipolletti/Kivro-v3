import type { PrismaClient } from "@kivro/database";
import { buildWorkerHealthReport } from "@kivro/seller-health";
import type { WorkerTransportPort } from "@kivro/cloud-core";
import { applyWorkerHeartbeat } from "./worker-heartbeat-service.js";
import { executeWorkerPoll } from "./worker-poll-service.js";

export type WorkerTransportFrameResult =
  | { status: number; json: unknown }
  | { status: number; text: string };

/** Shared Worker Protocol frame handler for polling shim and WSS upgrade (PORT-024). */
export async function handleWorkerTransportFrame(
  prisma: PrismaClient,
  workerDeviceId: string,
  encoded: string,
  decodeTransport: WorkerTransportPort,
): Promise<WorkerTransportFrameResult> {
  let envelope;
  try {
    envelope = decodeTransport.decodeFromWire(encoded);
  } catch {
    return { status: 400, text: "INVALID_FRAME" };
  }
  if (envelope.workerDeviceId && envelope.workerDeviceId !== workerDeviceId) {
    return { status: 403, text: "WORKER_DEVICE_MISMATCH" };
  }

  if (envelope.operation === "heartbeat") {
    const body = envelope.body;
    const report = buildWorkerHealthReport({
      workerVersion: String(body.workerVersion ?? "unknown"),
      openClawVersion: (body.openClawVersion as string | null) ?? null,
      dockerOk: body.dockerOk === true,
      sandboxOk: body.sandboxOk === true,
      openClawInstalled: body.openClawInstalled === true,
      openClawCompatible: body.openClawCompatible === true,
      globalPauseActive: body.globalPauseActive === true,
      cloudConnectionOk: true,
    });
    const result = await applyWorkerHeartbeat(prisma, { workerDeviceId, report });
    if ("error" in result) {
      return { status: 403, json: { error: result.error } };
    }
    return { status: 200, json: result };
  }

  if (envelope.operation === "poll") {
    const poll = await executeWorkerPoll(prisma, workerDeviceId);
    if ("error" in poll) {
      return { status: 403, json: { error: poll.error } };
    }
    return { status: 200, json: poll };
  }

  return { status: 400, text: "UNSUPPORTED_OPERATION" };
}
