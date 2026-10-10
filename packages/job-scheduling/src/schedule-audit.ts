export type ScheduleAuditSource = "WEB" | "LOCAL_APP" | "API";

/** §423 — a schedule edit records who changed what, without mixing in pause history. */
export function scheduleAuditRecord(input: {
  sellerId: string;
  capabilityId: string;
  workerId?: string | null;
  oldSchedule: unknown;
  newSchedule: unknown;
  timezone: string;
  changedAt: Date;
  source: ScheduleAuditSource;
}): {
  sellerId: string;
  capabilityId: string;
  workerId: string | null;
  oldSchedule: unknown;
  newSchedule: unknown;
  timezone: string;
  changedAt: string;
  source: ScheduleAuditSource;
} {
  return {
    sellerId: input.sellerId,
    capabilityId: input.capabilityId,
    workerId: input.workerId ?? null,
    oldSchedule: input.oldSchedule,
    newSchedule: input.newSchedule,
    timezone: input.timezone,
    changedAt: input.changedAt.toISOString(),
    source: input.source,
  };
}
