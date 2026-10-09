import type { JobStatus } from "@kivro/domain";

/** Master Spec §437, §465 — buyer-visible operational status (sanitized). */
export function buyerVisibleJobStatus(
  status: JobStatus,
  context?: {
    scheduledRunAt?: Date | null;
    scheduleWaitDeadlineAt?: Date | null;
    scheduleAdjustedAt?: Date | null;
  },
): {
  label: string;
  detail?: string;
} {
  if (status === "SCHEDULED" && context?.scheduledRunAt) {
    const now = Date.now();
    if (context.scheduledRunAt.getTime() > now) {
      const adjusted =
        context.scheduleAdjustedAt != null
          ? " Provider availability changed; your earliest run time was updated."
          : "";
      return {
        label: "Scheduled",
        detail: `Earliest execution ${context.scheduledRunAt.toISOString()}.${adjusted}`,
      };
    }
    return {
      label: "Waiting for provider availability",
      detail: "Your job is reserved and will queue when the provider becomes available.",
    };
  }
  switch (status) {
    case "PAUSE_REQUESTED":
    case "PAUSED":
      return {
        label: "Paused by provider",
        detail: "This job has been temporarily paused by the provider.",
      };
    case "SECURITY_PAUSED":
      return {
        label: "Paused",
        detail: "The provider temporarily paused this job for operational review.",
      };
    case "RESUME_REQUESTED":
      return {
        label: "Resuming",
        detail: "The provider is preparing to resume this job.",
      };
    default:
      return { label: status.replaceAll("_", " ").toLowerCase() };
  }
}
