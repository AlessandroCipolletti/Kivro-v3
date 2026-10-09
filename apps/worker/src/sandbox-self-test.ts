import { parseWorkerManifest } from "@kivro/contracts";
import { createOpenClawAdapter } from "@kivro/openclaw-adapter";
import { isDockerAvailable, runDockerFixtureOutput } from "@kivro/sandbox";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const FIXTURE_MANIFEST = {
  manifestVersion: 1,
  workerId: "550e8400-e29b-41d4-a716-446655440000",
  capabilityVersionId: "550e8400-e29b-41d4-a716-446655440001",
  runtime: { type: "openclaw", supportedVersionRange: ">=2026.8.0" },
  skills: [{ name: "demo", contentHash: `sha256:${"c".repeat(64)}` }],
  tools: { allow: ["exec"], deny: ["browser", "gateway", "nodes", "cron"] },
  resources: [],
  network: { default: "deny", allow: [] },
  limits: {
    timeoutSeconds: 120,
    memoryMb: 512,
    cpu: 1,
    maxPids: 64,
    maxInputBytes: 1048576,
    maxOutputBytes: 5242880,
  },
};

export async function runSandboxSelfTest(): Promise<{
  docker: boolean;
  dockerFixture: boolean;
  openClawInstalled: boolean;
  openClawSandboxList: boolean;
}> {
  const docker = isDockerAvailable();
  let dockerFixture = false;
  if (docker) {
    const outDir = path.join(os.tmpdir(), `kivro-selftest-${process.pid}`);
    try {
      runDockerFixtureOutput({
        manifest: parseWorkerManifest(FIXTURE_MANIFEST),
        outputDir: outDir,
        summaryText: "sandbox self-test",
      });
      dockerFixture = fs.existsSync(path.join(outDir, "summary.txt"));
    } catch {
      dockerFixture = false;
    }
  }
  const adapter = await createOpenClawAdapter();
  const detection = await adapter.detect();
  const openclawBin = process.env.OPENCLAW_BIN ?? "openclaw";
  const openClawSandboxList =
    detection.installed &&
    spawnSync(openclawBin, ["sandbox", "list", "--json"], { stdio: "ignore" }).status === 0;
  return {
    docker,
    dockerFixture,
    openClawInstalled: detection.installed,
    openClawSandboxList,
  };
}
