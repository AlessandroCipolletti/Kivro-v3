import type { JobStatus } from "@kivro/domain";

/** Master Spec §437 — buyer-visible operational status (sanitized). */
export function buyerVisibleJobStatus(status: JobStatus): {
  label: string;
  detail?: string;
} {
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
