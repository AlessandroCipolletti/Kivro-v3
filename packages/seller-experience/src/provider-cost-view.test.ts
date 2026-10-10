import { getPriceTierById } from "@kivro/billing";
import { describe, expect, it } from "vitest";
import {
  assertProviderCostWithinGuardrail,
  buildProviderCostEstimateView,
} from "./provider-cost-view.js";

describe("provider cost view", () => {
  it("labels guardrails and rejects excessive estimates", () => {
    const tier = getPriceTierById("USD_999");
    expect(tier).toBeTruthy();
    const view = buildProviderCostEstimateView({
      tier: tier!,
      estimatedProviderCostCents: 120,
    });
    expect(view.disclaimer).toContain("authoritative");
    expect(view.guardrails.label).toContain("cannot override");
    expect(assertProviderCostWithinGuardrail(120)).toBe(true);
    expect(assertProviderCostWithinGuardrail(900)).toBe(false);
  });
});
