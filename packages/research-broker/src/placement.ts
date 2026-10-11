/** §269 — the first broker is local. Seller-originated public egress is not the final design. */

export const RESEARCH_BROKER_PLACEMENT = "local_hardened" as const;

export function researchBrokerServesLocalArchitecture(): boolean {
  return RESEARCH_BROKER_PLACEMENT === "local_hardened";
}

export function sellerOriginatedEgressIsFinalDesign(): false {
  return false;
}

export type ResearchAudience = "generic_public" | "seller_private";

/** Generic public research prefers the platform broker when one is configured. Private seller APIs stay local. */
export function selectResearchEgress(input: {
  audience: ResearchAudience;
  platformBrokerUrl?: string;
}): "local_hardened" | "platform" {
  if (input.audience === "seller_private") {
    return "local_hardened";
  }
  const url = input.platformBrokerUrl?.trim() ?? "";
  if (url.startsWith("https://")) {
    return "platform";
  }
  return "local_hardened";
}

export function platformResearchUrl(platformBrokerUrl: string, query: string): string {
  const base = new URL(platformBrokerUrl);
  if (base.protocol !== "https:") {
    throw new Error("platform research broker requires https");
  }
  const target = new URL("/research/search", base);
  target.searchParams.set("q", query);
  return target.toString();
}
