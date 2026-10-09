import { isGlobalDispatchEnabled } from "./dispatch.js";

export type WorkerDeviceStatus = "PAIRED" | "ONLINE" | "OFFLINE" | "REVOKED";

/** §67 / §19 invariant 14 */
export function canWorkerDeviceAcceptJobs(status: WorkerDeviceStatus): boolean {
  if (!isGlobalDispatchEnabled()) {
    return false;
  }
  return status !== "REVOKED";
}
