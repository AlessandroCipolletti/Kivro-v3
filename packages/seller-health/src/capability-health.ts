/** Master Spec §376 — capability-level health summary for seller dashboard. */

export type CapabilityHealthLabel =
  | "ONLINE"
  | "BUSY"
  | "PAUSED"
  | "SCHEDULED_OFFLINE"
  | "OFFLINE"
  | "NOT_ACCEPTING";

const REASON_COPY: Record<string, string> = {
  EMERGENCY_PAUSE: "Emergency pause — no new jobs",
  PLATFORM_SECURITY_PAUSE: "Platform security pause — fix issue before resume",
  SECURITY_NOT_READY: "Security check blocking new jobs",
  MANUALLY_PAUSED: "Manually paused",
  WORKER_NOT_ONLINE: "Worker offline",
  WORKER_BUSY: "Worker busy with another job",
  SCHEDULE_CLOSED: "Outside scheduled hours",
  NOT_PUBLISHED: "Capability not published",
  GLOBAL_DISPATCH_DISABLED: "Platform dispatch disabled",
};

export function describeCapabilityHealth(input: {
  buyerAvailability: string;
  accepting: boolean;
  reasons: string[];
}): { healthLabel: CapabilityHealthLabel; detail: string | null } {
  let healthLabel: CapabilityHealthLabel = "NOT_ACCEPTING";
  if (input.buyerAvailability === "ONLINE") {
    healthLabel = "ONLINE";
  } else if (input.buyerAvailability === "BUSY") {
    healthLabel = "BUSY";
  } else if (input.buyerAvailability === "PAUSED") {
    healthLabel = "PAUSED";
  } else if (input.buyerAvailability === "SCHEDULED_OFFLINE") {
    healthLabel = "SCHEDULED_OFFLINE";
  } else if (input.buyerAvailability === "OFFLINE") {
    healthLabel = "OFFLINE";
  }

  const primary = input.reasons[0];
  const detail = primary ? (REASON_COPY[primary] ?? primary) : null;
  if (!input.accepting && healthLabel === "ONLINE") {
    healthLabel = "NOT_ACCEPTING";
  }
  return { healthLabel, detail };
}
