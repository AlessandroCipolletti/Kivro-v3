import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { mvpAllows } from "./mvp-boundaries.js";
import {
  DEMAND_PATH,
  MARKETPLACE_DOMAIN_CONCEPTS,
  MARKETPLACE_LOOP,
  SUPPLY_PATH,
  buyerAccountRequiresOpenClaw,
  isPrimaryMarketplaceSupply,
  marketplacePrimarilySellsInference,
  mvpSupportsDemandSurface,
} from "./supply-thesis.js";

describe("product thesis", () => {
  it("treats private data and local software as a reason to pay", () => {
    expect(isPrimaryMarketplaceSupply(["private_read_only_database"])).toBe(true);
    expect(isPrimaryMarketplaceSupply(["buyer_lacks_data"])).toBe(true);
    expect(isPrimaryMarketplaceSupply(["buyer_lacks_tool", "local_software"])).toBe(true);
  });

  it("does not treat a better prompt as primary supply", () => {
    expect(isPrimaryMarketplaceSupply(["better_prompt"])).toBe(false);
    expect(isPrimaryMarketplaceSupply([])).toBe(false);
  });

  it("keeps OpenClaw as the first runtime and the domain model about the service", () => {
    expect(mvpAllows("openclaw_sellers")).toBe(true);
    expect(mvpAllows("other_agent_frameworks")).toBe(false);
    const schema = readFileSync(
      resolve(process.cwd(), "packages/database/prisma/schema.prisma"),
      "utf8",
    );
    expect(schema).toContain("model Capability ");
    expect(schema).toContain("model Job ");
    expect(schema).toContain("model WorkerDevice ");
    expect(schema).not.toContain("model OpenClaw ");
    expect(MARKETPLACE_DOMAIN_CONCEPTS).toContain("Capability");
    expect(MARKETPLACE_DOMAIN_CONCEPTS).toContain("Job");
  });

  it("supports a human marketplace and agent primitives together", () => {
    expect(mvpSupportsDemandSurface("human_marketplace")).toBe(true);
    expect(mvpSupportsDemandSurface("agent_primitives")).toBe(true);
    expect(marketplacePrimarilySellsInference()).toBe(false);
    expect(buyerAccountRequiresOpenClaw()).toBe(false);
    expect(SUPPLY_PATH[0]).toBe("import_select");
    expect(SUPPLY_PATH.at(-1)).toBe("publish_paid_service");
    expect(DEMAND_PATH).toContain("browse_or_describe");
    expect(DEMAND_PATH).toContain("reviews");
    expect(MARKETPLACE_LOOP).toContain("ratings_history");
    expect(MARKETPLACE_DOMAIN_CONCEPTS).not.toContain("OpenClaw");
    expect(mvpAllows("hardware_marketplace")).toBe(false);
  });
});
