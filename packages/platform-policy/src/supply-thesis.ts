/** Master Spec §2. A capability is worth buying when the buyer cannot reproduce it. */

export const CAPABILITY_VALUE_SOURCES = [
  "proprietary_data",
  "private_read_only_database",
  "local_software",
  "buyer_lacks_data",
  "buyer_lacks_tool",
  "proven_record",
] as const;

export function isPrimaryMarketplaceSupply(advantages: string[]): boolean {
  if (advantages.length === 0) {
    return false;
  }
  return advantages.some((advantage) => advantage !== "better_prompt");
}

/** The marketplace domain stays about the service, not the first runtime. */
export const MARKETPLACE_DOMAIN_CONCEPTS = [
  "Worker",
  "Capability",
  "Job",
  "Input schema",
  "Output schema",
  "Resource permission",
  "Tool permission",
  "Network permission",
  "Price",
  "Runtime",
  "Seller",
] as const;

export const MVP_DEMAND_SURFACES = ["human_marketplace", "agent_primitives"] as const;

export function mvpSupportsDemandSurface(surface: string): boolean {
  return (MVP_DEMAND_SURFACES as readonly string[]).includes(surface);
}

/** §2 — the marketplace sells a capability, not tokens. */
export function marketplacePrimarilySellsInference(): false {
  return false;
}

export const SUPPLY_PATH = [
  "import_select",
  "dependency_analysis",
  "explicit_permissions",
  "isolated_worker",
  "publish_paid_service",
] as const;

export const DEMAND_PATH = [
  "browse_or_describe",
  "discover",
  "choose_or_approve",
  "pay_or_reserve",
  "execute",
  "results",
  "optional_downstream",
  "final_result",
  "reviews",
] as const;

export const MARKETPLACE_LOOP = [
  "publish",
  "discover_purchase",
  "ratings_history",
  "better_discovery",
  "more_demand",
  "more_publish_incentive",
] as const;

export function buyerAccountRequiresOpenClaw(): false {
  return false;
}
