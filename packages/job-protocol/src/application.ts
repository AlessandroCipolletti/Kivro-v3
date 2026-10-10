import { PROTOCOL_VERSION } from "@kivro/contracts";

/** Application-layer Worker Protocol messages (PORT-019 — independent of transport). */
export function buildWorkerHeartbeatBody(input: {
  workerVersion: string;
  dockerOk: boolean;
  sandboxOk: boolean;
  openClawInstalled: boolean;
  openClawCompatible: boolean;
  globalPauseActive: boolean;
  openClawVersion?: string | null;
}): Record<string, unknown> {
  return {
    protocolVersion: PROTOCOL_VERSION,
    workerVersion: input.workerVersion,
    openClawVersion: input.openClawVersion ?? null,
    dockerOk: input.dockerOk,
    sandboxOk: input.sandboxOk,
    openClawInstalled: input.openClawInstalled,
    openClawCompatible: input.openClawCompatible,
    globalPauseActive: input.globalPauseActive,
  };
}

export function buildJobAcceptedMessage(input: {
  jobId: string;
  workerDeviceId: string;
  acceptedAt?: string;
}): Record<string, unknown> {
  return {
    type: "JOB_ACCEPTED",
    protocolVersion: PROTOCOL_VERSION,
    jobId: input.jobId,
    workerDeviceId: input.workerDeviceId,
    acceptedAt: input.acceptedAt ?? new Date().toISOString(),
  };
}
