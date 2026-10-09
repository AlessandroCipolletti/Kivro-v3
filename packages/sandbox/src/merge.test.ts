import { describe, expect, it } from "vitest";
import { MARKETPLACE_SANDBOX_BASELINE, mergeSandboxConfig } from "./index.js";

describe("mergeSandboxConfig", () => {
  it("returns baseline when seller has no overrides", () => {
    expect(mergeSandboxConfig()).toEqual(MARKETPLACE_SANDBOX_BASELINE);
  });
  it("rejects network weakening", () => {
    expect(() => mergeSandboxConfig({ docker: { network: "bridge" } })).toThrow(
      "SANDBOX_NETWORK_WEAKENING_FORBIDDEN",
    );
  });
});
