import { describe, expect, it } from "vitest";
import { evaluateNetworkAccess } from "./index.js";

const baseManifest = {
  manifestVersion: 1 as const,
  workerId: "550e8400-e29b-41d4-a716-446655440000",
  capabilityVersionId: "550e8400-e29b-41d4-a716-446655440001",
  runtime: { type: "openclaw" as const, supportedVersionRange: "1.x" },
  skills: [],
  tools: { allow: [], deny: ["browser"] },
  resources: [],
  network: { default: "deny" as const, allow: ["api.anthropic.com"] },
  limits: {
    timeoutSeconds: 120,
    memoryMb: 1024,
    cpu: 1,
    maxPids: 128,
    maxInputBytes: 1,
    maxOutputBytes: 1,
  },
};

describe("evaluateNetworkAccess", () => {
  it("denies undeclared hosts", () => {
    expect(evaluateNetworkAccess(baseManifest, "evil.example").allowed).toBe(false);
  });
  it("allows declared hosts", () => {
    expect(evaluateNetworkAccess(baseManifest, "api.anthropic.com").allowed).toBe(true);
  });
});
