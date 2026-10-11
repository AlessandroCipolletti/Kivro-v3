import { describe, expect, it } from "vitest";
import { isDockerAvailable, previewSandboxResult, runDockerFixtureOutput } from "./docker-fixture-run.js";

const manifest = {
  manifestVersion: 1 as const,
  workerId: "550e8400-e29b-41d4-a716-446655440000",
  capabilityVersionId: "550e8400-e29b-41d4-a716-446655440001",
  runtime: { type: "openclaw" as const, supportedVersionRange: ">=2026.8.0" },
  skills: [{ name: "demo", contentHash: `sha256:${"a".repeat(64)}` }],
  tools: { allow: ["exec"], deny: ["browser", "gateway", "nodes", "cron"] },
  resources: [],
  network: { default: "deny" as const, allow: [] },
  limits: {
    timeoutSeconds: 120,
    memoryMb: 512,
    cpu: 1,
    maxPids: 64,
    maxInputBytes: 1048576,
    maxOutputBytes: 5242880,
  },
};

describe("docker fixture run", () => {
  it("isDockerAvailable reflects docker info", () => {
    expect(typeof isDockerAvailable()).toBe("boolean");
  });

  it("does not spawn a preview when Docker is down", () => {
    expect(
      previewSandboxResult(false, () => {
        throw new Error("docker should not start");
      }),
    ).toEqual({ ok: false, reason: "docker_unavailable" });
  });

  it("runs fixture output when Docker is up", (ctx) => {
    if (!isDockerAvailable()) {
      ctx.skip();
    }
    const out = runDockerFixtureOutput({
      manifest,
      outputDir: `/tmp/kivro-sandbox-test-${process.pid}`,
      summaryText: "hello sandbox",
    });
    expect(out.summaryPath).toContain("summary.txt");
  });
});
