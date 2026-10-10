import { describe, expect, it } from "vitest";
import {
  READ_ONLY_DISCOVERY_SOURCES,
  buyerStartsOnWebMarketplace,
  configurationAccessMode,
  discoveryAccessMode,
  explicitMinimumSubset,
  projectDeclaredResult,
} from "./companion-worker.js";

describe("companion worker boundaries", () => {
  it("reads configuration and discovery without writing, and starts the buyer on the marketplace", () => {
    expect(discoveryAccessMode()).toBe("read_only");
    expect(READ_ONLY_DISCOVERY_SOURCES).toEqual([
      "proprietary_read_only_database",
      "selected_local_files",
      "private_configuration",
    ]);
    expect(configurationAccessMode()).toBe("read_only");
    expect(buyerStartsOnWebMarketplace("web_marketplace")).toBe(true);
    expect(buyerStartsOnWebMarketplace("seller_openclaw")).toBe(false);
  });

  it("keeps unselected resources out and returns only declared output", () => {
    const selected = explicitMinimumSubset([
      { id: "notes", selected: true },
      { id: "database", selected: false },
    ]);
    expect(selected.map((resource) => resource.id)).toEqual(["notes"]);
    expect(
      projectDeclaredResult(
        { report: "ok", secret: "no", runtimeMs: 10 },
        ["report"],
        ["runtimeMs"],
      ),
    ).toEqual({ report: "ok", runtimeMs: 10 });
  });
});
