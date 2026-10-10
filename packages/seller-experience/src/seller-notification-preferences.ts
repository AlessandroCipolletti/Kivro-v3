import type { SellerProfile } from "@kivro/database";

/** SELLERUX-028 */
export type SellerNotificationPreferences = {
  jobCompleted: boolean;
  healthAlert: boolean;
  payout: boolean;
};

export function readSellerNotificationPreferences(
  profile: SellerProfile,
): SellerNotificationPreferences {
  return {
    jobCompleted: profile.sellerNotifyJobCompleted,
    healthAlert: profile.sellerNotifyHealthAlert,
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
    payout: patch.payout ?? current.payout,
  };
}
