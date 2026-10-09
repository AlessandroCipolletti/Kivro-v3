#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const runtime = path.join(os.tmpdir(), `kivro-m06-${process.pid}`);
const manifestPath = path.join(runtime, "manifest.json");

function run(cmd, args, opts = {}) {
  const res = spawnSync(cmd, args, { stdio: "inherit", cwd: root, ...opts });
  if (res.status !== 0) {
    process.exit(res.status ?? 1);
  }
}

const manifest = {
  manifestVersion: 1,
  workerId: "550e8400-e29b-41d4-a716-446655440000",
  capabilityVersionId: "550e8400-e29b-41d4-a716-446655440001",
  runtime: { type: "openclaw", supportedVersionRange: ">=2026.8.0" },
  skills: [{ name: "company-research", contentHash: `sha256:${"e".repeat(64)}` }],
  tools: { allow: ["exec"], deny: ["browser", "gateway", "nodes", "cron"] },
  resources: [],
  network: { default: "deny", allow: [] },
  limits: {
    timeoutSeconds: 120,
    memoryMb: 1024,
    cpu: 1,
    maxPids: 128,
    maxInputBytes: 1048576,
    maxOutputBytes: 5242880,
  },
  internet: {
    mode: "PUBLIC_WEB_RESEARCH",
    domainPolicy: "ANY_PUBLIC_DOMAIN",
    search: { enabled: true, maxQueriesPerJob: 5 },
    fetch: {
      enabled: true,
      maxPagesPerJob: 5,
      maxResponseBytes: 500000,
      allowedContentTypes: ["text/plain", "text/html"],
    },
  },
};

fs.mkdirSync(runtime, { recursive: true });
fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));

run("pnpm", [
  "exec",
  "vitest",
  "run",
  "packages/research-broker/src/research-broker.test.ts",
  "packages/research-broker/src/ssrf.test.ts",
  "packages/contracts/src/research-policy.test.ts",
  "security/tests/adversarial-m06.test.ts",
]);

run("node", ["apps/worker/dist/cli.js", "research-probe", "--file", manifestPath], {
  env: { ...process.env, KIVRO_RUNTIME_ROOT: runtime },
});

const blocked = spawnSync(
  "node",
  [
    "apps/worker/dist/cli.js",
    "research-probe",
    "--file",
    manifestPath,
    "--url",
    "http://127.0.0.1/private",
  ],
  { stdio: "inherit", cwd: root, env: { ...process.env, KIVRO_RUNTIME_ROOT: runtime } },
);
if (blocked.status === 0) {
  console.error("Expected SSRF probe to fail");
  process.exit(1);
}

console.log("M06 verify flow passed");
