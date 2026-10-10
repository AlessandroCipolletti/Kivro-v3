import { describe, expect, it } from "vitest";
import { fairQueueOrder, scheduledReservationFairness } from "./scheduled-fairness.js";

describe("scheduled reservation fairness", () => {
  it("discloses a later run and keeps the older reservation first", () => {
    const fairness = scheduledReservationFairness({
      nextAvailableAt: "2026-10-11T18:00:00.000Z",
      reservedAt: new Date("2026-10-10T16:00:00.000Z"),
      purchaseLabel: "Schedule for earliest availability",
      reservationCopy: "You are reserving this job now. It starts when the provider is eligible.",
      previousEligibleAt: new Date("2026-10-11T18:00:00.000Z"),
      nextEligibleAt: new Date("2026-10-11T19:00:00.000Z"),
      queue: [
        { id: "b", createdAt: new Date("2026-10-10T16:05:00.000Z") },
        { id: "a", createdAt: new Date("2026-10-10T16:00:00.000Z") },
      ],
    });
    expect(Object.values(fairness).every(Boolean)).toBe(true);
    expect(fairQueueOrder([
      { id: "b", createdAt: new Date("2026-10-10T16:05:00.000Z") },
      { id: "a", createdAt: new Date("2026-10-10T16:00:00.000Z") },
    ]).map((job) => job.id)).toEqual(["a", "b"]);
  });

  it("rejects a reservation labeled as an immediate run", () => {
    const fairness = scheduledReservationFairness({
      nextAvailableAt: "2026-10-11T18:00:00.000Z",
      reservedAt: new Date("2026-10-10T16:00:00.000Z"),
      purchaseLabel: "Run now",
      reservationCopy: "You are reserving this job now.",
      previousEligibleAt: new Date("2026-10-11T18:00:00.000Z"),
      nextEligibleAt: new Date("2026-10-11T18:20:00.000Z"),
      queue: [],
    });
    expect(fairness.doesNotClaimImmediateDelivery).toBe(false);
  });
});
