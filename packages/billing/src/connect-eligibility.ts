/** Master Spec §24.7 — seller Connect state for paid publishing. */

export type ConnectOnboardingStatus =
  | "NOT_STARTED"
  | "IN_PROGRESS"
  | "RESTRICTED"
  | "ACTION_REQUIRED"
  | "READY"
  | "DISABLED";

export function mapSellerConnectStatus(profile: {
  stripeConnectedAccountId: string | null;
  connectOnboardingStatus: string | null;
  payoutsEnabled: boolean;
  transfersCapabilityStatus: string | null;
}): ConnectOnboardingStatus {
  if (!profile.stripeConnectedAccountId) {
    return profile.connectOnboardingStatus === "IN_PROGRESS" ? "IN_PROGRESS" : "NOT_STARTED";
  }
  if (profile.connectOnboardingStatus === "DISABLED") {
    return "DISABLED";
  }
  if (profile.payoutsEnabled && profile.transfersCapabilityStatus === "active") {
    return "READY";
  }
  if (profile.connectOnboardingStatus === "RESTRICTED") {
    return "RESTRICTED";
  }
  if (profile.connectOnboardingStatus === "ACTION_REQUIRED") {
    return "ACTION_REQUIRED";
  }
  return profile.connectOnboardingStatus === "READY" ? "READY" : "IN_PROGRESS";
}

export function canSellerReceivePaidJobs(profile: {
  stripeConnectedAccountId: string | null;
  connectOnboardingStatus: string | null;
  payoutsEnabled: boolean;
  transfersCapabilityStatus: string | null;
}): boolean {
  if (process.env.KIVRO_DEV_PAYMENT_SHORTCUTS === "true" && process.env.NODE_ENV !== "production") {
    return true;
  }
  return mapSellerConnectStatus(profile) === "READY";
}
