import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { buyerAccountRequiresOpenClaw } from "@kivro/platform-policy";
import { buildPurchaseSnapshotView, buyerAssetChoice } from "@kivro/buyer-experience";
import {
  filterCapabilityListings,
  mvpAgentAllows,
  rankAgentCandidates,
  runAssistedDiscovery,
  verifiedReputation,
  type CapabilityListingRow,
} from "@kivro/marketplace";
import { authorizePlanApproval } from "./purchase-authorization.js";
import { validatePlanCompatibility } from "./plan-compatibility.js";
import { platformAgentAvailability } from "./platform-inference-policy.js";
import { RoutingPlatformInference, DeterministicPlatformInference } from "./platform-inference.js";

const listing: CapabilityListingRow = {
  id: "research",
  slug: "research",
  name: "Company research",
  description: "Reads private filings",
  category: "Research",
  priceTierCents: 400,
  currency: "USD",
  rating: 4.8,
  jobCount: 12,
  estimatedDuration: 30,
  sellerDisplayName: "Ada",
  availabilityStatus: "ONLINE",
  accepting: true,
};

describe("marketplace MVP acceptance", () => {
  it("keeps the classic marketplace usable and the agent inside its scope", async () => {
    expect(buyerAccountRequiresOpenClaw()).toBe(false);
    expect(filterCapabilityListings([listing], { q: "research", minRating: 4 }).map((row) => row.id)).toEqual([
      "research",
    ]);
    expect(verifiedReputation([{ stars: 5, fromCompletedJob: true }]).count).toBe(1);
    expect(verifiedReputation([{ stars: 5, fromCompletedJob: false }]).count).toBe(0);
    const discovered = runAssistedDiscovery([listing], { goal: "company research under $15" });
    expect(discovered.recommendations[0]?.id).toBe("research");
    const ranked = rankAgentCandidates([listing], { query: "company research", constraints: { minRating: 4.5 } });
    expect(ranked[0]?.rating).toBe(4.8);

    expect(mvpAgentAllows("multi_job_plan")).toBe(true);
    expect(mvpAgentAllows("indefinite_autonomous")).toBe(false);
    expect(mvpAgentAllows("negotiate_price")).toBe(false);
    expect(mvpAgentAllows("unlimited_budget")).toBe(false);
    expect(
      authorizePlanApproval({
        plan: {
          goal: "research",
          constraints: { maxTotalSpendCents: 100 },
          maxBudgetCents: 100,
          estimatedCostCents: 400,
          notes: [],
          steps: [
            {
              clientStepKey: "research",
              label: "Research",
              capabilityId: "research",
              capabilitySlug: "research",
              capabilityVersionId: "v1",
              estimatedPriceCents: 400,
              dependsOnStepIds: [],
            },
          ],
        },
        constraints: { maxTotalSpendCents: 100 },
      }),
    ).toEqual({ ok: false, code: "BUDGET_EXCEEDED" });
    expect(
      validatePlanCompatibility([
        { clientStepKey: "a", outputKind: "text", dependsOnStepIds: [] },
        { clientStepKey: "b", outputKind: "text", inputKind: "text", dependsOnStepIds: ["a"] },
      ]),
    ).toEqual([]);

    const history = buildPurchaseSnapshotView({
      capabilityId: "research",
      versionNumber: 1,
      priceSnapshotCents: 400,
      currency: "USD",
      platformFeeSnapshotCents: 40,
      sellerNetSnapshotCents: 360,
      permissionManifestSnapshot: {},
      inputContractSnapshot: { fields: ["company"] },
      outputContractSnapshot: { fields: ["report"] },
      scheduledRunAt: null,
      buyerHardDeadlineAt: null,
    });
    expect(history.inputContract).toEqual({ fields: ["company"] });
    expect(buyerAssetChoice({ assetId: "a1", requesterId: "buyer", ownerId: "buyer" })).toBe("reuse_previous");

    const root = process.cwd();
    const favorites = readFileSync(resolve(root, "apps/api/src/routes/buyer-favorites.ts"), "utf8");
    const jobs = readFileSync(resolve(root, "apps/api/src/routes/buyer-jobs-list.ts"), "utf8");
    expect(favorites).toContain("userId: user.id");
    expect(jobs).toContain("buyer job history");

    expect(platformAgentAvailability({}).marketplaceAgent).toBe("unavailable");
    expect(platformAgentAvailability({}).classicMarketplace).toBe("functional");
    expect(platformAgentAvailability({ KIVRO_PLATFORM_OPENAI_API_KEY: "sk" }).openai).toBe(true);
    expect(platformAgentAvailability({ KIVRO_PLATFORM_ANTHROPIC_API_KEY: "sk" }).anthropic).toBe(true);
    const router = new RoutingPlatformInference({}, new DeterministicPlatformInference(), {});
    await expect(router.parseGoal("research")).rejects.toThrow();
  });
});
