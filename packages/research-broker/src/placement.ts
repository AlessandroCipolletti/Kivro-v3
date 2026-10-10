/** §269 — the first broker is local. Seller-originated public egress is not the final design. */

export const RESEARCH_BROKER_PLACEMENT = "local_hardened" as const;

export function researchBrokerServesLocalArchitecture(): boolean {
  return RESEARCH_BROKER_PLACEMENT === "local_hardened";
}

export function sellerOriginatedEgressIsFinalDesign(): false {
  return false;
}
