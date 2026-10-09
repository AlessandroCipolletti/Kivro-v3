import { describe, expect, it } from "vitest";
import { ControlledEgressProxy, evaluateControlledEgress } from "./controlled-egress.js";

const manifest = {
  manifestVersion: 1 as const,
  workerId: "550e8400-e29b-41d4-a716-446655440000",
  capabilityVersionId: "550e8400-e29b-41d4-a716-446655440001",
  runtime: { type: "openclaw" as const, supportedVersionRange: "1.x" },
  skills: [],
  tools: { allow: ["exec"], deny: ["browser"] },
  resources: [],
  network: {
    default: "deny" as const,
    allow: [{ host: "api.anthropic.com", ports: [443], purpose: "LLM" }],
  },
  limits: {
    timeoutSeconds: 120,
    memoryMb: 1024,
    cpu: 1,
    maxPids: 128,
    maxInputBytes: 1,
    maxOutputBytes: 1,
  },
};

describe("ControlledEgressProxy", () => {
  it("allows declared HTTPS destination", () => {
    const d = evaluateControlledEgress(manifest, "https://api.anthropic.com/v1/messages");
    expect(d.allowed).toBe(true);
  });
  it("denies undeclared host", () => {
    expect(evaluateControlledEgress(manifest, "https://evil.example").allowed).toBe(false);
  });
  it("denies wrong port for host", () => {
    expect(evaluateControlledEgress(manifest, "https://api.anthropic.com:8080/x").allowed).toBe(
      false,
    );
  });
  it("denies redirect to different host", () => {
    const d = new ControlledEgressProxy().evaluate({
      manifest,
      url: "https://api.anthropic.com/a",
      redirectUrl: "https://evil.example/b",
    });
    expect(d.allowed).toBe(false);
  });
});
