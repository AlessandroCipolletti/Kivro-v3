/** Master Spec §386–§387 — cloud/local marketplace pause sync hints. */

export type MarketplaceControlState = {
  cloudEmergencyPause: boolean;
  localPauseReported: boolean;
  requiresLocalPauseSync: boolean;
  dispatchBlocked: boolean;
};

export function deriveMarketplaceControlState(input: {
  cloudEmergencyPause: boolean;
  localPauseReported: boolean;
  platformSecurityPause?: boolean;
}): MarketplaceControlState {
  const dispatchBlocked =
    input.cloudEmergencyPause ||
    input.localPauseReported ||
    input.platformSecurityPause === true;
  return {
    cloudEmergencyPause: input.cloudEmergencyPause,
    localPauseReported: input.localPauseReported,
    requiresLocalPauseSync: input.cloudEmergencyPause && !input.localPauseReported,
    dispatchBlocked,
  };
}
