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
