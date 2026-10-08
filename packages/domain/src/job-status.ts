/** Master Spec §9 — job lifecycle states and transition rules. */

export const JOB_STATUSES = [
  "CREATED",
  "PAYMENT_RESERVED",
  "QUEUED",
  "DISPATCHED",
  "ACCEPTED",
  "STARTING",
  "RUNNING",
  "UPLOADING_RESULT",
  "COMPLETED",
  "REJECTED",
  "EXPIRED",
  "CANCELLED",
  "FAILED_STARTUP",
  "FAILED_POLICY",
  "FAILED_EXECUTION",
  "TIMED_OUT",
  "WORKER_OFFLINE",
  "RESULT_REJECTED",
  "REFUNDED",
] as const;

export type JobStatus = (typeof JOB_STATUSES)[number];

export const TERMINAL_JOB_STATUSES: ReadonlySet<JobStatus> = new Set([
  "COMPLETED",
  "REJECTED",
  "EXPIRED",
  "CANCELLED",
  "FAILED_STARTUP",
  "FAILED_POLICY",
  "FAILED_EXECUTION",
  "TIMED_OUT",
  "WORKER_OFFLINE",
  "RESULT_REJECTED",
  "REFUNDED",
]);

const ALLOWED_TRANSITIONS: Record<JobStatus, readonly JobStatus[]> = {
  CREATED: ["PAYMENT_RESERVED", "CANCELLED", "EXPIRED"],
  PAYMENT_RESERVED: ["QUEUED", "CANCELLED", "EXPIRED", "REFUNDED"],
  QUEUED: ["DISPATCHED", "CANCELLED", "EXPIRED", "WORKER_OFFLINE"],
  DISPATCHED: ["ACCEPTED", "REJECTED", "EXPIRED", "WORKER_OFFLINE", "CANCELLED"],
  ACCEPTED: ["STARTING", "FAILED_STARTUP", "CANCELLED", "TIMED_OUT"],
  STARTING: ["RUNNING", "FAILED_STARTUP", "FAILED_POLICY", "TIMED_OUT"],
  RUNNING: [
    "UPLOADING_RESULT",
    "FAILED_EXECUTION",
    "FAILED_POLICY",
    "TIMED_OUT",
    "CANCELLED",
  ],
  UPLOADING_RESULT: ["COMPLETED", "RESULT_REJECTED", "FAILED_EXECUTION"],
  COMPLETED: [],
  REJECTED: ["REFUNDED"],
  EXPIRED: ["REFUNDED"],
  CANCELLED: ["REFUNDED"],
  FAILED_STARTUP: ["REFUNDED"],
  FAILED_POLICY: ["REFUNDED"],
  FAILED_EXECUTION: ["REFUNDED"],
  TIMED_OUT: ["REFUNDED"],
  WORKER_OFFLINE: ["REFUNDED", "QUEUED"],
  RESULT_REJECTED: ["REFUNDED"],
  REFUNDED: [],
};

export class InvalidJobTransitionError extends Error {
  readonly from: JobStatus;
  readonly to: JobStatus;

  constructor(from: JobStatus, to: JobStatus) {
    super(`Invalid job transition: ${from} → ${to}`);
    this.name = "InvalidJobTransitionError";
    this.from = from;
    this.to = to;
  }
}

export function assertJobTransition(from: JobStatus, to: JobStatus): void {
  if (from === to) {
    return;
  }
  const allowed = ALLOWED_TRANSITIONS[from];
  if (!allowed.includes(to)) {
    throw new InvalidJobTransitionError(from, to);
  }
}

export function isTerminalJobStatus(status: JobStatus): boolean {
  return TERMINAL_JOB_STATUSES.has(status);
}
