/** Master Spec §26, §403 — buyer-facing operational availability. */

export const BUYER_AVAILABILITY_STATUSES = [
  "ONLINE",
  "BUSY",
  "SCHEDULED_OFFLINE",
  "OFFLINE",
  "PAUSED",
] as const;

export type BuyerAvailabilityStatus = (typeof BUYER_AVAILABILITY_STATUSES)[number];

export function mapWorkerDeviceToBuyerAvailability(input: {
  deviceStatus: string;
  sellerGlobalPause: boolean;
  scheduleAccepting: boolean;
  hasActiveJob: boolean;
}): BuyerAvailabilityStatus {
  if (input.sellerGlobalPause) {
    return "PAUSED";
  }
  if (!input.scheduleAccepting) {
    return "SCHEDULED_OFFLINE";
  }
  if (input.deviceStatus === "OFFLINE" || input.deviceStatus === "REVOKED") {
    return "OFFLINE";
  }
  if (input.hasActiveJob) {
    return "BUSY";
  }
  return "ONLINE";
}
