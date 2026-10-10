export const WEBHOOK_EVENT_TYPES = [
  "job.completed",
  "job.failed",
  "job.cancelled",
  "job.started",
  "job.scheduled",
  "job.expired",
] as const;

export type WebhookEventType = (typeof WEBHOOK_EVENT_TYPES)[number];

export function parseWebhookEvents(raw: unknown): WebhookEventType[] {
  if (!Array.isArray(raw)) {
    return ["job.completed", "job.failed"];
  }
  return raw.filter(
    (e): e is WebhookEventType =>
      typeof e === "string" && (WEBHOOK_EVENT_TYPES as readonly string[]).includes(e),
  );
}
