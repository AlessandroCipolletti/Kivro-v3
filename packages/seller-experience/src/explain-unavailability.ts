/** SELLERUX-030 — human-readable composable unavailability factors. */
const REASON_COPY: Record<string, { title: string; detail: string; remediation: string }> = {
  NOT_PUBLISHED: {
    title: "Not published",
    detail: "Capability is not live on the marketplace.",
    remediation: "Finish readiness checks and publish a version.",
  },
  GLOBAL_DISPATCH_DISABLED: {
    title: "Dispatch disabled",
    detail: "Platform dispatch is temporarily disabled.",
    remediation: "Wait for platform dispatch to resume. No seller action clears this.",
  },
  PLATFORM_SECURITY_PAUSE: {
    title: "Security pause",
    detail: "Platform blocked new jobs until health recovers.",
    remediation: "Clear blocking Worker health warnings, then retest.",
  },
  EMERGENCY_PAUSE: {
    title: "Emergency pause",
    detail: "You paused all new marketplace jobs.",
    remediation: "Resume from the seller dashboard when you are ready.",
  },
  SELLER_MAINTENANCE: {
    title: "Maintenance",
    detail: "You enabled seller maintenance mode.",
    remediation: "Turn off maintenance mode when you can accept new jobs.",
  },
  MANUALLY_PAUSED: {
    title: "Manual pause",
    detail: "This capability is manually paused.",
    remediation: "Resume the capability schedule. This does not create a new version.",
  },
  SCHEDULE_CLOSED: {
    title: "Outside schedule",
    detail: "Current time is outside configured availability windows.",
    remediation: "Wait for the next window or edit the schedule timezone.",
  },
  WORKER_NOT_ONLINE: {
    title: "Worker offline",
    detail: "Worker is not online or heartbeat is stale.",
    remediation: "Start the Worker and confirm a fresh heartbeat.",
  },
  CONCURRENCY_LIMIT: {
    title: "At capacity",
    detail: "Worker is at maximum concurrent jobs.",
    remediation: "Wait for a running job to finish or raise concurrent capacity.",
  },
  SECURITY_NOT_READY: {
    title: "Worker not ready",
    detail: "Blocking security warnings must be resolved.",
    remediation: "Run doctor, fix blockers, then refresh health.",
  },
};

export function buildExplainableUnavailability(input: {
  reasons: string[];
  maintenanceMessage?: string | null;
  maintenanceExpectedReturnAt?: string | null;
}): Array<{ code: string; title: string; detail: string; remediation: string }> {
  return input.reasons.map((code) => {
    const copy = REASON_COPY[code] ?? {
      title: code,
      detail: "Blocking availability.",
      remediation: "Review seller operations for the blocking factor.",
    };
    if (code === "SELLER_MAINTENANCE") {
      const parts = [input.maintenanceMessage ?? copy.detail];
      if (input.maintenanceExpectedReturnAt) {
        parts.push(`Expected return: ${input.maintenanceExpectedReturnAt}.`);
      }
      return { code, title: copy.title, detail: parts.join(" "), remediation: copy.remediation };
    }
    return { code, ...copy };
  });
}
