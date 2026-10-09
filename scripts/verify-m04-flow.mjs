#!/usr/bin/env node
/**
 * Terminal M04 gate: policy/sandbox unit tests + worker policy-check preflight.
 */
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const runtime = path.join(os.tmpdir(), `kivro-m04-${process.pid}`);
const manifestPath = path.join(runtime, "manifest.json");

const manifest = {
  manifestVersion: 1,
  workerId: "550e8400-e29b-41d4-a716-446655440000",
  capabilityVersionId: "550e8400-e29b-41d4-a716-446655440001",
  runtime: { type: "openclaw", supportedVersionRange: ">=2026.8.0" },
  skills: [{ name: "demo", contentHash: `sha256:${"b".repeat(64)}` }],
  tools: { allow: ["exec"], deny: ["browser", "gateway", "nodes", "cron"] },
  resources: [],
  network: { default: "deny", allow: ["api.anthropic.com"] },
  limits: {
    timeoutSeconds: 120,
    memoryMb: 1024,
    cpu: 1,
    maxPids: 128,
    maxInputBytes: 1048576,
    maxOutputBytes: 5242880,
  },
};

function run(cmd, args, opts = {}) {
  const res = spawnSync(cmd, args, { stdio: "inherit", cwd: root, ...opts });
  if (res.status !== 0) {
    process.exit(res.status ?? 1);
  }
}

fs.mkdirSync(runtime, { recursive: true });
fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));

run("pnpm", [
  "exec",
  "vitest",
  "run",
  "packages/policy-engine/src/index.test.ts",
  "packages/sandbox/src/merge.test.ts",
  "packages/egress-proxy/src/controlled-egress.test.ts",
  "packages/capability-publish/src/permission-diff.test.ts",
  "packages/contracts/src/worker-manifest.test.ts",
  "security/tests/adversarial-m04.test.ts",
  "security/tests/invariants.test.ts",
  "security/tests/invariants-19.test.ts",
]);

run("node", ["apps/worker/dist/cli.js", "policy-check", "--file", manifestPath], {
  env: { ...process.env, KIVRO_RUNTIME_ROOT: runtime, KIVRO_SANDBOX_DRY_RUN: "true" },
});

console.log("M04 verify flow passed");
