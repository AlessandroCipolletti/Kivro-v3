import { describe, expect, it } from "vitest";
import {
  isWithinSellerNotificationDedupWindow,
  mergeSellerNotificationPreferences,
  sellerNotificationAllowed,
  SELLER_NOTIFICATION_DEDUP_MS,
} from "./seller-notification-preferences.js";

const base = {
  jobCompleted: true,
  healthAlert: true,
  failure: true,
  missedWindow: true,
  problemReport: true,
  payout: true,
};

describe("seller notification preferences", () => {
  it("honors opt-out and dedup window", () => {
    const merged = mergeSellerNotificationPreferences(base, { failure: false, payout: false });
    expect(sellerNotificationAllowed(merged, "failure")).toBe(false);
    expect(sellerNotificationAllowed(merged, "healthAlert")).toBe(true);
    const now = new Date("2026-04-10T12:00:00.000Z");
    const recent = new Date(now.getTime() - SELLER_NOTIFICATION_DEDUP_MS + 1000);
    expect(isWithinSellerNotificationDedupWindow(recent, now)).toBe(true);
    expect(isWithinSellerNotificationDedupWindow(null, now)).toBe(false);
  });
});