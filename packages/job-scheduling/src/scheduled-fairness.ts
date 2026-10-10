import { assertJobTransition } from "@kivro/domain";
import { deliveryMeasurementStart } from "./execution-preference.js";
import { purchaseBlockedBeforeFunds } from "./submission-gate.js";
import { scheduleChangeIsMaterial } from "./scheduled-timing-record.js";
import { computeScheduleWaitDeadline } from "./wait-policy.js";

export type ReservationFairness = {
  showsFutureAvailability: boolean;
  fundsCopyDisclosesReservation: boolean;
  doesNotStartBeforeAuthorization: boolean;
  doesNotClaimImmediateDelivery: boolean;
  slaStartsAtExecution: boolean;
  notifiesMaterialScheduleChange: boolean;
  buyerCanCancelBeforeStart: boolean;
  waitIsBounded: boolean;
  earlierReservationFirst: boolean;
};

/** §486 — a future reservation is disclosed, bounded, and measured from execution. */
export function scheduledReservationFairness(input: {
  nextAvailableAt: string;
  reservedAt: Date;
  purchaseLabel: string;
  reservationCopy: string;
  previousEligibleAt: Date;
  nextEligibleAt: Date;
  queue: Array<{ id: string; createdAt: Date }>;
}): ReservationFairness {
  const scheduledRunAt = new Date(input.nextAvailableAt);
  const measured = deliveryMeasurementStart({
    reservedAt: input.reservedAt,
    scheduledRunAt,
  });
  let buyerCanCancelBeforeStart = true;
  try {
    assertJobTransition("SCHEDULED", "CANCELLED");
  } catch {
    buyerCanCancelBeforeStart = false;
  }
  const blocked = purchaseBlockedBeforeFunds({
    accepting: false,
    buyerAvailability: "SCHEDULED_OFFLINE",
  });
  const ordered = fairQueueOrder(input.queue);
  const oldest = input.queue.reduce<(typeof input.queue)[number] | undefined>((best, job) => {
    if (!best) {
      return job;
    }
    if (job.createdAt.getTime() < best.createdAt.getTime()) {
      return job;
    }
    if (job.createdAt.getTime() === best.createdAt.getTime() && job.id < best.id) {
      return job;
    }
    return best;
  }, undefined);
  return {
    showsFutureAvailability: Number.isFinite(scheduledRunAt.getTime()),
    fundsCopyDisclosesReservation: /reserv/i.test(input.reservationCopy),
    doesNotStartBeforeAuthorization: blocked.ok === false,
    doesNotClaimImmediateDelivery: !/run now|^run$/i.test(input.purchaseLabel),
    slaStartsAtExecution: measured.getTime() === scheduledRunAt.getTime(),
    notifiesMaterialScheduleChange: scheduleChangeIsMaterial(input.previousEligibleAt, input.nextEligibleAt),
    buyerCanCancelBeforeStart,
    waitIsBounded: computeScheduleWaitDeadline(input.reservedAt).getTime() > input.reservedAt.getTime(),
    earlierReservationFirst: !oldest || ordered[0]?.id === oldest.id,
  };
}

/** Earlier reservations are released and considered first. Ties break on id. */
export function fairQueueOrder<T extends { id: string; createdAt: Date }>(jobs: T[]): T[] {
  return [...jobs].sort((left, right) => {
    const delta = left.createdAt.getTime() - right.createdAt.getTime();
    if (delta !== 0) {
      return delta;
    }
    return left.id < right.id ? -1 : left.id > right.id ? 1 : 0;
  });
}
