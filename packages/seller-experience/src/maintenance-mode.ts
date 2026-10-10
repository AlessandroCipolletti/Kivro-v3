/** SELLERUX-029 — maintenance prevents new work with buyer-visible messaging. */
export type MaintenanceState = {
  active: boolean;
  message: string | null;
  expectedReturnAt: string | null;
};

export function buildMaintenanceState(input: {
  maintenanceMode: boolean;
  maintenanceMessage: string | null;
  maintenanceExpectedReturnAt: Date | null;
}): MaintenanceState {
  return {
    active: input.maintenanceMode,
    message: input.maintenanceMessage,
    expectedReturnAt: input.maintenanceExpectedReturnAt?.toISOString() ?? null,
  };
}

export function buildBuyerMaintenanceCopy(state: MaintenanceState): string {
  if (!state.active) {
    return "";
  }
  const returnHint = state.expectedReturnAt
    ? ` Expected return: ${state.expectedReturnAt}.`
    : "";
  return state.message ?? `Seller is in maintenance mode.${returnHint}`;
}
