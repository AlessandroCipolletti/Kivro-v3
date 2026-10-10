/** §190 — a provider failure is not a purchase. */
export function inferenceFailureMayCreatePurchase(): false {
  return false;
}

export type InferenceOwner = "PLATFORM" | "SELLER" | "BUYER";

/** §191 — platform, seller, and buyer inference stay separate. */
export function inferenceOwnership(owner: InferenceOwner): {
  owner: InferenceOwner;
  runsOn: "cloud" | "seller_computer" | null;
  paidBy: "marketplace" | "seller" | null;
  performsPaidJob: boolean;
  buyerNeedsOwnProvider: false;
} {
  if (owner === "PLATFORM") {
    return {
      owner,
      runsOn: "cloud",
      paidBy: "marketplace",
      performsPaidJob: false,
      buyerNeedsOwnProvider: false,
    };
  }
  if (owner === "SELLER") {
    return {
      owner,
      runsOn: "seller_computer",
      paidBy: "seller",
      performsPaidJob: true,
      buyerNeedsOwnProvider: false,
    };
  }
  return {
    owner,
    runsOn: null,
    paidBy: null,
    performsPaidJob: false,
    buyerNeedsOwnProvider: false,
  };
}
