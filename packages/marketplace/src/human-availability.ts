export type HumanAvailabilityGroup = "NOW" | "LATER" | "UNAVAILABLE";

export function humanAvailabilityGroup(row: {
  availabilityStatus?: string | null;
  accepting?: boolean;
  nextAvailableAt?: string | null;
}): HumanAvailabilityGroup {
  if ((row.availabilityStatus === "ONLINE" || row.availabilityStatus === "BUSY") && row.accepting === true) {
    return "NOW";
  }
  if (row.availabilityStatus === "SCHEDULED_OFFLINE" && row.nextAvailableAt) {
    return "LATER";
  }
  return "UNAVAILABLE";
}

/** §511 — humans can compare what can run now with what can be reserved for later. */
export function partitionHumanListings<T extends {
  availabilityStatus?: string | null;
  accepting?: boolean;
  nextAvailableAt?: string | null;
}>(rows: T[]): { availableNow: T[]; availableLater: T[]; unavailable: T[] } {
  const availableNow: T[] = [];
  const availableLater: T[] = [];
  const unavailable: T[] = [];
  for (const row of rows) {
    const group = humanAvailabilityGroup(row);
    if (group === "NOW") {
      availableNow.push(row);
    } else if (group === "LATER") {
      availableLater.push(row);
    } else {
      unavailable.push(row);
    }
  }
  return { availableNow, availableLater, unavailable };
}

/** §512 — advice may include later services. Buying does not, unless the buyer allowed a wait. */
export function agentInteractionMode(goal: string): "RECOMMENDATION" | "EXECUTION" {
  const lower = goal.toLowerCase();
  const asksForAdvice = /\b(which service|what(?:'s| is) best|recommend|compare services)\b/.test(lower);
  const asksToExecute = /\b(do this|buy it|run it|purchase|for me)\b/.test(lower);
  if (asksForAdvice && !asksToExecute) {
    return "RECOMMENDATION";
  }
  return "EXECUTION";
}
