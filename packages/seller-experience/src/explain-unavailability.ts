/** SELLERUX-030 — human-readable composable unavailability factors. */
const REASON_COPY: Record<string, { title: string; detail: string }> = {
  NOT_PUBLISHED: { title: "Not published", detail: "Capability is not live on the marketplace." },
  GLOBAL_DISPATCH_DISABLED: { title: "Dispatch disabled", detail: "Platform dispatch is temporarily disabled." },
  PLATFORM_SECURITY_PAUSE: { title: "Security pause", detail: "Platform blocked new jobs until health recovers." },
  EMERGENCY_PAUSE: { title: "Emergency pause", detail: "You paused all new marketplace jobs." },
  SELLER_MAINTENANCE: { title: "Maintenance", detail: "You enabled seller maintenance mode." },
  MANUALLY_PAUSED: { title: "Manual pause", detail: "This capability is manually paused." },
  SCHEDULE_CLOSED: { title: "Outside schedule", detail: "Current time is outside configured availability windows." },
  WORKER_NOT_ONLINE: { title: "Worker offline", detail: "Worker is not online or heartbeat is stale." },
  CONCURRENCY_LIMIT: { title: "At capacity", detail: "Worker is at maximum concurrent jobs." },
  SECURITY_NOT_READY: { title: "Worker not ready", detail: "Blocking security warnings must be resolved." },
};

export function buildExplainableUnavailability(input: {
  reasons: string[];
  maintenanceMessage?: string | null;
  maintenanceExpectedReturnAt?: string | null;
}): Array<{ code: string; title: string; detail: string }> {
  return input.reasons.map((code) => {
    const copy = REASON_COPY[code] ?? { title: code, detail: "Blocking availability." };
    if (code === "SELLER_MAINTENANCE" && input.maintenanceMessage) {
      return { code, title: copy.title, detail: input.maintenanceMessage };
    }
    if (code === "SELLER_MAINTENANCE" && input.maintenanceExpectedReturnAt) {
      return {
        code,
        title: copy.title,
        detail: `${copy.detail} Expected return: ${input.maintenanceExpectedReturnAt}.`,
      };
    }
    return { code, ...copy };
  });
}
