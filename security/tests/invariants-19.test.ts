import { describe, expect, it } from "vitest";
import { runSecurityInvariantChecks } from "@kivro/policy-engine";
import { canWorkerDeviceAcceptJobs } from "@kivro/platform-policy";
import { isForbiddenHostPath } from "@kivro/sandbox";

const manifest = {
  manifestVersion: 1 as const,
  workerId: "550e8400-e29b-41d4-a716-446655440000",
  capabilityVersionId: "550e8400-e29b-41d4-a716-446655440001",
  runtime: { type: "openclaw" as const, supportedVersionRange: "1.x" },
  skills: [{ name: "demo", contentHash: "sha256:" + "c".repeat(64) }],
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

describe("§19 security invariants", () => {
  it("runs catalog and passes baseline marketplace context", () => {
    const results = runSecurityInvariantChecks({
      manifest,
      marketplaceConfigPath: "/tmp/kivro/runtime/marketplace/id/openclaw.marketplace.json",
      jobInputPath: "/tmp/job/input",
      globalDispatchEnabled: true,
      workerDeviceRevoked: false,
    });
    expect(results.every((r) => r.ok)).toBe(true);
  });

  it("fails when device revoked", () => {
    expect(canWorkerDeviceAcceptJobs("REVOKED")).toBe(false);
    const results = runSecurityInvariantChecks({
      manifest,
      marketplaceConfigPath: "/marketplace/x.json",
      workerDeviceRevoked: true,
    });
    expect(results.find((r) => r.id === 14)?.ok).toBe(false);
  });

  it("blocks sensitive host paths", () => {
    expect(isForbiddenHostPath("/Users/seller/.ssh/id_rsa")).toBe(true);
  });

  it("denies undeclared network in invariant 8", () => {
    const results = runSecurityInvariantChecks({
      manifest,
      marketplaceConfigPath: "/marketplace/x.json",
      networkHost: "evil.example",
    });
    expect(results.find((r) => r.id === 8)?.ok).toBe(false);
  });
});
