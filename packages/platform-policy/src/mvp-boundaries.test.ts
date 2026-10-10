import { describe, expect, it } from "vitest";
import { mvpAllows } from "./mvp-boundaries.js";

describe("MVP boundaries", () => {
  it("keeps the first product on OpenClaw, read-only discovery, and an outbound worker", () => {
    expect(mvpAllows("openclaw_sellers")).toBe(true);
    expect(mvpAllows("read_only_discovery")).toBe(true);
    expect(mvpAllows("outbound_worker_connection")).toBe(true);
  });

  it("leaves later marketplace ideas outside the first product", () => {
    expect(mvpAllows("gpu_rental")).toBe(false);
    expect(mvpAllows("auctions")).toBe(false);
    expect(mvpAllows("automatic_price_negotiation")).toBe(false);
    expect(mvpAllows("other_agent_frameworks")).toBe(false);
    expect(mvpAllows("unrestricted_shell")).toBe(false);
  });
});
