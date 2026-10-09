import type { JobTimeoutPolicy } from "./timeouts.js";

export type SupervisionState = "idle" | "running" | "cancel_requested" | "terminated" | "timed_out";

export interface SupervisedAttempt {
  jobId: string;
  attemptId: string;
  state: SupervisionState;
  pid?: number;
  startedAtMs?: number;
}

/** §70 — in-process supervisor (real spawn wired with OpenClaw in M06). */
export class JobProcessSupervisor {
  private readonly attempts = new Map<string, SupervisedAttempt>();

  constructor(private readonly timeouts: JobTimeoutPolicy) {}

  attemptKey(jobId: string, attemptId: string): string {
    return `${jobId}:${attemptId}`;
  }

  registerStart(jobId: string, attemptId: string, pid?: number): SupervisedAttempt {
    const key = this.attemptKey(jobId, attemptId);
    const record: SupervisedAttempt = {
      jobId,
      attemptId,
      state: "running",
      pid,
      startedAtMs: Date.now(),
    };
    this.attempts.set(key, record);
    return record;
  }

  requestCancel(jobId: string, attemptId: string): SupervisedAttempt | undefined {
    const key = this.attemptKey(jobId, attemptId);
    const existing = this.attempts.get(key);
    if (!existing) {
      return undefined;
    }
    existing.state = "cancel_requested";
    return existing;
  }

  markTerminated(jobId: string, attemptId: string, timedOut = false): SupervisedAttempt | undefined {
    const key = this.attemptKey(jobId, attemptId);
    const existing = this.attempts.get(key);
    if (!existing) {
      return undefined;
    }
    existing.state = timedOut ? "timed_out" : "terminated";
    return existing;
  }

  isPastExecutionDeadline(startedAtMs: number, nowMs = Date.now()): boolean {
    return nowMs - startedAtMs > this.timeouts.executionTimeoutMs;
  }

  getAttempt(jobId: string, attemptId: string): SupervisedAttempt | undefined {
    return this.attempts.get(this.attemptKey(jobId, attemptId));
  }
}
