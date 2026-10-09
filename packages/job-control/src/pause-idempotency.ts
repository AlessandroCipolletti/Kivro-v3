import type { JobStatus } from "@kivro/domain";
import { isPauseControlStatus } from "@kivro/domain";

export type PauseCommandOutcome =
  | { kind: "noop"; status: JobStatus }
  | { kind: "request_pause"; next: "PAUSE_REQUESTED" }
  | { kind: "request_resume"; next: "RESUME_REQUESTED" }
  | { kind: "reject"; code: string };

/** §446 — idempotent pause/resume intent from cloud control plane. */
export function planSellerPauseTransition(
  current: JobStatus,
  command: "pause" | "resume",
): PauseCommandOutcome {
  if (command === "pause") {
    if (current === "PAUSED" || current === "PAUSE_REQUESTED") {
      return { kind: "noop", status: current };
    }
    if (current === "RUNNING" || current === "STARTING" || current === "UPLOADING_RESULT") {
      return { kind: "request_pause", next: "PAUSE_REQUESTED" };
    }
    if (isPauseControlStatus(current)) {
      return { kind: "noop", status: current };
    }
    return { kind: "reject", code: "JOB_NOT_PAUSABLE" };
  }

  if (current === "RUNNING" || current === "RESUME_REQUESTED") {
    return { kind: "noop", status: current };
  }
  if (current === "PAUSED" || current === "SECURITY_PAUSED") {
    return { kind: "request_resume", next: "RESUME_REQUESTED" };
  }
  return { kind: "reject", code: "JOB_NOT_RESUMABLE" };
}
