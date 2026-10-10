export type ParallelBranch = {
  id: string;
  fits: boolean;
  alternativeFits: boolean;
  alternativeWithinBudget: boolean;
  permissionsPreserved: boolean;
};

/** §500 — one unavailable branch is replaced on its own. Siblings that still fit stay. */
export function repairParallelBranches(branches: ParallelBranch[]):
  | { ok: true; replacements: string[] }
  | { ok: false; blockedBranchId: string } {
  const replacements: string[] = [];
  for (const branch of branches) {
    if (branch.fits) {
      continue;
    }
    if (branch.alternativeFits && branch.alternativeWithinBudget && branch.permissionsPreserved) {
      replacements.push(branch.id);
      continue;
    }
    return { ok: false, blockedBranchId: branch.id };
  }
  return { ok: true, replacements };
}

/** §501 — an unavailable step is not purchased from a stale plan. */
export function purchaseDecisionForStaleStep(input: {
  stillAvailable: boolean;
  alternativeFound: boolean;
  priceUnchanged: boolean;
  permissionsUnchanged: boolean;
}): "BUY" | "REPAIR" | "ASK_APPROVAL" {
  if (input.stillAvailable) {
    return "BUY";
  }
  if (!input.alternativeFound) {
    return "REPAIR";
  }
  if (!input.priceUnchanged || !input.permissionsUnchanged) {
    return "ASK_APPROVAL";
  }
  return "REPAIR";
}
