import { describe, expect, it } from "vitest";
import {
  evaluateEgressRequest,
  evaluateNetworkAccess,
  evaluateToolAccess,
  isBlockedEgressHost,
  validateExecutionPreflight,
} from "./index.js";

const baseManifest = {
  manifestVersion: 1 as const,
  workerId: "550e8400-e29b-41d4-a716-446655440000",
  capabilityVersionId: "550e8400-e29b-41d4-a716-446655440001",
  runtime: { type: "openclaw" as const, supportedVersionRange: "1.x" },
  skills: [],
  tools: { allow: ["exec"], deny: ["browser"] },
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
  it("blocks localhost SSRF even if allow-listed", () => {
    const manifest = {
      ...baseManifest,
      network: { default: "deny" as const, allow: ["127.0.0.1", "localhost"] },
    };
    expect(evaluateNetworkAccess(manifest, "127.0.0.1").allowed).toBe(false);
    expect(evaluateNetworkAccess(manifest, "localhost").allowed).toBe(false);
  });
  it("blocks cloud metadata endpoints", () => {
    expect(isBlockedEgressHost("169.254.169.254")).toBe(true);
    expect(evaluateNetworkAccess(baseManifest, "169.254.169.254").allowed).toBe(false);
  });
});

describe("evaluateEgressRequest", () => {
  it("allows https port for declared host", () => {
    expect(evaluateEgressRequest(baseManifest, "api.anthropic.com", 443).allowed).toBe(true);
  });
  it("denies unexpected ports", () => {
    expect(evaluateEgressRequest(baseManifest, "api.anthropic.com", 8080).allowed).toBe(false);
  });
  it("honors structured port allow lists", () => {
    const structured = {
      ...baseManifest,
      network: {
        default: "deny" as const,
        allow: [{ host: "api.anthropic.com", ports: [443], purpose: "LLM" }],
      },
    };
    expect(evaluateEgressRequest(structured, "api.anthropic.com", 443).allowed).toBe(true);
    expect(evaluateEgressRequest(structured, "api.anthropic.com", 80).allowed).toBe(false);
  });
});

describe("evaluateToolAccess", () => {
  it("denies browser tool", () => {
    expect(evaluateToolAccess(baseManifest, "browser").allowed).toBe(false);
  });
  it("allows declared tools", () => {
    expect(evaluateToolAccess(baseManifest, "exec").allowed).toBe(true);
  });
});

describe("validateExecutionPreflight", () => {
  it("passes marketplace-safe manifest", () => {
    expect(validateExecutionPreflight(baseManifest).ok).toBe(true);
  });
  it("fails when browser is allow-listed", () => {
    const bad = {
      ...baseManifest,
      tools: { allow: ["browser"], deny: [] },
    };
    expect(validateExecutionPreflight(bad).ok).toBe(false);
  });
});
