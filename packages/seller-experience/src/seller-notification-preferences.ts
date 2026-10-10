import type { SellerProfile } from "@kivro/database";

/** SELLERUX-028 — seller-controlled operational alerts. */
export type SellerNotificationEvent =
  | "jobCompleted"
  | "healthAlert"
  | "failure"
  | "missedWindow"
  | "problemReport"
  | "payout";

export type SellerNotificationPreferences = Record<SellerNotificationEvent, boolean>;

/** Minimum gap between repeated alerts of the same event for one seller (dedup window). */
export const SELLER_NOTIFICATION_DEDUP_MS = 15 * 60_000;

export function readSellerNotificationPreferences(
  profile: SellerProfile,
): SellerNotificationPreferences {
  return {
    jobCompleted: profile.sellerNotifyJobCompleted,
    healthAlert: profile.sellerNotifyHealthAlert,
    failure: profile.sellerNotifyFailure,
    missedWindow: profile.sellerNotifyMissedWindow,
    problemReport: profile.sellerNotifyProblemReport,
    payout: profile.sellerNotifyPayout,
  };
}

export function mergeSellerNotificationPreferences(
  current: SellerNotificationPreferences,
  patch: Partial<SellerNotificationPreferences>,
): SellerNotificationPreferences {
  return {
    jobCompleted: patch.jobCompleted ?? current.jobCompleted,
    healthAlert: patch.healthAlert ?? current.healthAlert,
    failure: patch.failure ?? current.failure,
    missedWindow: patch.missedWindow ?? current.missedWindow,
    problemReport: patch.problemReport ?? current.problemReport,
    payout: patch.payout ?? current.payout,
  };
}

export function sellerNotificationAllowed(
  prefs: SellerNotificationPreferences,
  event: SellerNotificationEvent,
): boolean {
  return prefs[event] === true;
}

/** Deterministic dedup: same seller+event+subject inside the window is suppressed. */
export function sellerNotificationDedupKey(input: {
  sellerProfileId: string;
  event: SellerNotificationEvent;
  subjectId: string;
}): string {
  return `${input.sellerProfileId}:${input.event}:${input.subjectId}`;
}

export function isWithinSellerNotificationDedupWindow(
  lastSentAt: Date | null,
  now: Date,
): boolean {
  if (!lastSentAt) {
    return false;
  }
  return now.getTime() - lastSentAt.getTime() < SELLER_NOTIFICATION_DEDUP_MS;
}
