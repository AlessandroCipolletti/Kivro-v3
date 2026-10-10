import { KIVRO_COMPATIBILITY_MATRIX } from "./matrix.js";
import { compareWorkerVersions } from "./worker-policy.js";

/** Master Spec §22 — OpenClaw adapter compatibility window from matrix. */
export function isOpenClawVersionSupported(openClawVersion: string): boolean {
  const range = KIVRO_COMPATIBILITY_MATRIX.openClawAdapter;
  if (compareWorkerVersions(openClawVersion, range.minInclusive) < 0) {
    return false;
  }
  if (compareWorkerVersions(openClawVersion, range.maxExclusive) >= 0) {
    return false;
  }
  return true;
}
