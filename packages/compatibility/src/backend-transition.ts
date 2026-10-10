import { KIVRO_COMPATIBILITY_MATRIX } from "./matrix.js";

/**
 * HARD-013 — provider/backend transition must not require Worker binary update when
 * protocol and advertised transport remain compatible.
 */
export function backendTransitionRequiresWorkerBinaryUpdate(input: {
  workerProtocolVersion: number;
  workerAlreadySupportsTransports: Array<"polling" | "wss">;
  targetActiveTransports: Array<"polling" | "wss">;
}): boolean {
  if (!KIVRO_COMPATIBILITY_MATRIX.controlPlaneOverlap.allowedDuringBackendTransition) {
    return true;
  }
  const min = KIVRO_COMPATIBILITY_MATRIX.workerProtocolMin;
  const max = KIVRO_COMPATIBILITY_MATRIX.workerProtocolMax;
  if (input.workerProtocolVersion < min || input.workerProtocolVersion > max) {
    return true;
  }
  for (const kind of input.targetActiveTransports) {
    if (!input.workerAlreadySupportsTransports.includes(kind)) {
      return true;
    }
  }
  return false;
}
