import type { JobStatus } from "@kivro/domain";

/** BUYERUX-025/026 — seller missed allowed execution window (buyer-visible). */
export type MissedWindowPresentation = {
  missed: boolean;
  headline?: string;
  detail?: string;
};

export function describeMissedWindow(input: {
  status: JobStatus;
  failureCode?: string | null;
  scheduleWaitDeadlineAt?: Date | null;
  now?: Date;
}): MissedWindowPresentation {
  const now = input.now ?? new Date();
  if (
    input.failureCode === "SCHEDULE_WAIT_EXCEEDED" ||
    input.failureCode === "MISSED_EXECUTION_WINDOW" ||
    (input.status === "EXPIRED" && input.scheduleWaitDeadlineAt && input.scheduleWaitDeadlineAt <= now)
  ) {
    return {
      missed: true,
      headline: "Seller did not start within the allowed window",
      detail:
        "Your payment remains protected. You can wait for support review or cancel if the job is still eligible.",
    };
  }
  if (input.status === "WORKER_OFFLINE" && input.scheduleWaitDeadlineAt && input.scheduleWaitDeadlineAt <= now) {
    return {
      missed: true,
      headline: "Provider unavailable during your reserved window",
      detail: "Kivro will keep trying while your reservation remains valid or expire it with a clear outcome.",
    };
  }
  return { missed: false };
}
