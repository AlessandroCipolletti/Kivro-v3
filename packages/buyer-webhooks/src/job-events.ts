import type { JobStatus } from "@kivro/domain";
import type { WebhookEventType } from "./events.js";

const FAILURE_TERMINAL_STATUSES: ReadonlySet<JobStatus> = new Set([
  "FAILED_STARTUP",
  "FAILED_POLICY",
  "FAILED_EXECUTION",
  "TIMED_OUT",
  "RESULT_REJECTED",
  "REJECTED",
]);

export function webhookEventForJobStatus(status: JobStatus): WebhookEventType | null {
  if (status === "COMPLETED") {
    return "job.completed";
  }
  if (status === "CANCELLED") {
    return "job.cancelled";
  }
  if (status === "RUNNING") {
    return "job.started";
  }
  if (status === "SCHEDULED") {
    return "job.scheduled";
  }
  if (status === "EXPIRED") {
    return "job.expired";
  }
  if (FAILURE_TERMINAL_STATUSES.has(status)) {
    return "job.failed";
  }
  return null;
}
