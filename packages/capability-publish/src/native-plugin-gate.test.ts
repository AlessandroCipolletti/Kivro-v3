import { describe, expect, it } from "vitest";
import { assertNoNativePluginsInDiscovery } from "./native-plugin-gate.js";

describe("native plugin gate §33", () => {
  it("blocks when native plugins are present", () => {
    const result = assertNoNativePluginsInDiscovery({ nativePlugins: ["host-bridge"] });
    expect(result.ok).toBe(false);
  });

  it("allows clean discovery", () => {
    expect(assertNoNativePluginsInDiscovery({ nativePlugins: [] }).ok).toBe(true);
  });
});
