/** Master Spec §36 — documented failure-handling invariants (shared Core). */

export const SANDBOX_UNAVAILABLE_INVARIANT =
  "Sandbox unavailable = job does not run; never fall back to host execution." as const;

export const WORKER_LOST_NO_RESUME =
  "Worker disappearance mid-job does not resume partial results; terminal failure + payment policy applies." as const;

export const NETWORK_PERMISSION_NEVER_BROADENED =
  "Network permission failure must fail the job; never temporarily broaden network access." as const;

export const MISSING_SECRET_WORKER_NOT_READY =
  "Required secret missing => worker not ready; do not accept new jobs." as const;

export function shouldFailClosedOnSandboxInit(sandboxOk: boolean): boolean {
  return !sandboxOk;
}
