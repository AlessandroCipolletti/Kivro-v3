import { describe, expect, it } from "vitest";
import { classifyDiscoveredResource, evaluateSellerSetup, resourceStartsUnselected } from "./setup-wizard.js";

const ready = {
  nodeOk: true,
  openClawPresent: true,
  dockerPresent: true,
  osCompatible: true,
  openClawVersionSupported: true,
  scan: { version: "1.2.0", skills: 2, agents: 1, plugins: 0 },
  sourceSelected: true,
  resources: [{ id: "notes", kind: "file", selected: true }],
  dedicatedCredentials: true,
  contract: {
    name: "Research",
    description: "Reads the selected notes.",
    inputCount: 1,
    hasOutput: true,
    priceCents: 500,
    timeoutSeconds: 120,
    hasExample: true,
  },
  securityPreviewShown: true,
  selfTestPassed: true,
  adversarialProbesBlocked: true,
};

describe("seller setup wizard", () => {
  it("starts every discovered resource unselected and blocks secrets", () => {
    expect(resourceStartsUnselected("file")).toEqual({ category: "REQUIRES_REVIEW", selected: false });
    expect(classifyDiscoveredResource("secret")).toBe("BLOCKED");
  });

  it("publishes only after install, scan, contract, preview, and both tests pass", () => {
    expect(evaluateSellerSetup(ready).readyToPublish).toBe(true);
    expect(evaluateSellerSetup({ ...ready, selfTestPassed: false }).blockedReasons).toContain("self_test");
    expect(
      evaluateSellerSetup({
        ...ready,
        resources: [{ id: "shell", kind: "shell", selected: true }],
      }).blockedReasons,
    ).toContain("blocked_resource:shell");
  });
});
