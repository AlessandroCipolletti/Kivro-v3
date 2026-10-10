/** §479 — a future service is described as eligible later, with runtime after start. */
export function scheduledCapabilityDisclosure(input: {
  nextEligibleAt: string;
  durationMinutes: number | null;
}): string {
  const runtime =
    input.durationMinutes != null && input.durationMinutes > 0
      ? ` and typically takes ~${input.durationMinutes} minutes`
      : "";
  return `This capability is not available now. It can become eligible at ${input.nextEligibleAt}${runtime}.`;
}

export type HardConstraintDecision = "ACCEPT" | "REJECT_CONSTRAINT";

/** §509 — being available now does not waive a hard constraint. */
export function candidateRespectsHardConstraints(input: {
  buyerForbidsInternet: boolean;
  capabilityUsesInternet: boolean;
}): HardConstraintDecision {
  if (input.buyerForbidsInternet && input.capabilityUsesInternet) {
    return "REJECT_CONSTRAINT";
  }
  return "ACCEPT";
}

export function timingConflictWhenConstraintsLeaveOnlyLater(input: {
  validImmediateCount: number;
  validLaterCount: number;
}): string | null {
  if (input.validImmediateCount > 0) {
    return null;
  }
  if (input.validLaterCount === 0) {
    return "No service matches the hard constraints.";
  }
  return "The services that match your constraints cannot run now.";
}
