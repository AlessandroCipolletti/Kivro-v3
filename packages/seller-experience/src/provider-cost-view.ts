import { estimateSellerMarginMinor } from "@kivro/billing";
import type { MarketplacePriceTier } from "@kivro/billing";
import { DEFAULT_PLATFORM_RESEARCH_CEILINGS } from "@kivro/platform-policy";

/** MVP illustrative per-job provider spend cap (USD cents) for seller guardrail UX. */
const DEFAULT_MAX_PROVIDER_COST_PER_JOB_CENTS = 500;

/** SELLERUX-017..018 — estimated provider cost separate from buyer price; guardrails labeled. */
export function buildProviderCostEstimateView(input: {
  tier: MarketplacePriceTier;
  estimatedProviderCostCents: number;
}): {
  buyerPaysCents: number;
  sellerNetCents: number;
  estimatedProviderCostCents: number;
  estimatedMarginCents: number;
  guardrails: {
    maxProviderCostPerJobCents: number;
    maxConcurrentResearchRequests: number;
    label: string;
  };
  disclaimer: string;
} {
  const margin = estimateSellerMarginMinor(input.tier, input.estimatedProviderCostCents);
  return {
    buyerPaysCents: input.tier.buyerPriceMinor,
    sellerNetCents: margin.sellerNetMinor,
    estimatedProviderCostCents: input.estimatedProviderCostCents,
    estimatedMarginCents: margin.estimatedMarginMinor,
    guardrails: {
      maxProviderCostPerJobCents: DEFAULT_MAX_PROVIDER_COST_PER_JOB_CENTS,
      maxConcurrentResearchRequests:
        DEFAULT_PLATFORM_RESEARCH_CEILINGS.maxConcurrentRequestsPerJob,
      label: "Enforced by Worker proxy — buyers cannot override provider spend caps.",
    },
    disclaimer: "Provider cost is seller-funded and estimated; ledger earnings use authoritative settlement.",
  };
}

export function assertProviderCostWithinGuardrail(estimatedProviderCostCents: number): boolean {
  return estimatedProviderCostCents <= DEFAULT_MAX_PROVIDER_COST_PER_JOB_CENTS;
}
