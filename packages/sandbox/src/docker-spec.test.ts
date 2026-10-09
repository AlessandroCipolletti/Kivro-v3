import { describe, expect, it } from "vitest";
import { buildDockerSandboxSpec } from "./docker-spec.js";

const manifest = {
  manifestVersion: 1 as const,
  workerId: "550e8400-e29b-41d4-a716-446655440000",
  capabilityVersionId: "550e8400-e29b-41d4-a716-446655440001",
  runtime: { type: "openclaw" as const, supportedVersionRange: "1.x" },
  skills: [],
  tools: { allow: [], deny: ["browser"] },
  resources: [],
  network: { default: "deny" as const, allow: [] },
  limits: {
    timeoutSeconds: 120,
    memoryMb: 512,
    cpu: 1,
    maxPids: 64,
    maxInputBytes: 0,
    maxOutputBytes: 0,
  },
};

describe("buildDockerSandboxSpec", () => {
  it("uses isolated network and caps", () => {
    const spec = buildDockerSandboxSpec(manifest);
    expect(spec.args).toContain("--network");
    expect(spec.args).toContain("none");
    expect(spec.args).toContain("--read-only");
  });
});
