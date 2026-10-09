import { describe, expect, it } from "vitest";
import { evaluateEgressRequest, evaluateNetworkAccess, evaluateToolAccess } from "@kivro/policy-engine";
import { mergeSandboxConfig, validateSandboxForManifest } from "@kivro/sandbox";
import { ManifestResourceBroker } from "@kivro/resource-broker";

const manifest = {
  manifestVersion: 1 as const,
  workerId: "550e8400-e29b-41d4-a716-446655440000",
  capabilityVersionId: "550e8400-e29b-41d4-a716-446655440001",
  runtime: { type: "openclaw" as const, supportedVersionRange: "1.x" },
  skills: [{ name: "demo", contentHash: "sha256:" + "a".repeat(64) }],
  tools: { allow: ["exec"], deny: ["browser", "gateway"] },
  resources: [{ id: "gdrive:folder", type: "google_drive", permissions: ["read"] }],
  network: { default: "deny" as const, allow: ["api.openai.com"] },
  limits: {
    timeoutSeconds: 120,
    memoryMb: 1024,
    cpu: 1,
    maxPids: 128,
    maxInputBytes: 1024,
    maxOutputBytes: 1024,
  },
};

describe("M04 adversarial controls", () => {
  it("denies RFC1918 targets", () => {
    expect(evaluateNetworkAccess(manifest, "10.0.0.5").allowed).toBe(false);
    expect(evaluateNetworkAccess(manifest, "192.168.1.1").allowed).toBe(false);
  });
  it("denies undeclared egress", () => {
    expect(evaluateEgressRequest(manifest, "evil.example", 443).allowed).toBe(false);
  });
  it("denies undeclared tools", () => {
    expect(evaluateToolAccess(manifest, "gateway").allowed).toBe(false);
  });
  it("resource broker enforces manifest permissions", () => {
    const broker = new ManifestResourceBroker();
    expect(broker.authorize({ manifest, resourceId: "gdrive:folder", operation: "read" }).allowed).toBe(
      true,
    );
    expect(broker.authorize({ manifest, resourceId: "gdrive:folder", operation: "write" }).allowed).toBe(
      false,
    );
  });
  it("seller cannot weaken docker network baseline", () => {
    expect(() => mergeSandboxConfig({ docker: { network: "host" } })).toThrow();
  });
  it("rejects browser in manifest allow list", () => {
    const bad = {
      ...manifest,
      tools: { allow: ["browser"], deny: [] },
    };
    expect(validateSandboxForManifest(bad).ok).toBe(false);
  });
});
