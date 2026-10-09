import { describe, expect, it } from "vitest";
import { diffWorkerManifestPermissions, hasPermissionExpansion } from "./permission-diff.js";

const base = {
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
    maxInputBytes: 0,
    maxOutputBytes: 0,
  },
};

describe("permission diff", () => {
  it("detects added network permission", () => {
    const next = {
      ...base,
      network: {
        default: "deny" as const,
        allow: ["api.anthropic.com", "api.openai.com"],
      },
    };
    const diff = diffWorkerManifestPermissions(base, next);
    expect(hasPermissionExpansion(diff)).toBe(true);
  });
});
