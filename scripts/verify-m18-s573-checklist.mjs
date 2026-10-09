#!/usr/bin/env node
/** Machine-verifiable subset of MASTER-SPEC §573 checklist. */
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const checks = [];

function ok(id, detail) {
  checks.push({ id, pass: true, detail });
}
function fail(id, detail) {
  checks.push({ id, pass: false, detail });
}

const compose = fs.readFileSync(path.join(root, "docker-compose.yml"), "utf8");
for (const [id, svc] of [
  ["573-postgres", "postgres:"],
  ["573-redis", "redis:"],
  ["573-minio", "minio:"],
]) {
  if (compose.includes(svc)) ok(id, svc);
  else fail(id, `missing ${svc}`);
}

for (const [id, script] of [
  ["573-setup", "scripts/dev-setup.mjs"],
  ["573-seed", "scripts/dev-seed.mjs"],
  ["573-e2e", "scripts/run-local-e2e.mjs"],
  ["573-doc", "docs/DEV-LOCAL.md"],
]) {
  if (fs.existsSync(path.join(root, script))) ok(id, script);
  else fail(id, script);
}

if (fs.readFileSync(path.join(root, "package.json"), "utf8").includes('"worker:dev"')) {
  ok("573-worker-dev", "pnpm worker:dev");
} else {
  fail("573-worker-dev", "missing script");
}

if (
  fs.existsSync(path.join(root, "apps/worker/src/sandbox-fixture-run.ts")) &&
  fs.readFileSync(path.join(root, "apps/worker/src/cli.ts"), "utf8").includes("run-fixture")
) {
  ok("573-sandbox-fixture", "worker sandbox fixture execution");
} else {
  fail("573-sandbox-fixture", "missing sandbox fixture runner");
}

const openclawAdapter = fs.readFileSync(
  path.join(root, "packages/openclaw-adapter/src/openclaw-cli.adapter.ts"),
  "utf8",
);
const hasDockerSandboxPath =
  openclawAdapter.includes("runDockerFixtureOutput") &&
  (openclawAdapter.includes("tryAgentExec") ||
    openclawAdapter.includes("openclaw-docker-sandbox") ||
    openclawAdapter.includes("openclaw-docker-fallback"));
if (hasDockerSandboxPath) {
  ok("573-openclaw-sandbox", "OpenClaw + Docker sandbox execute path");
} else {
  fail("573-openclaw-sandbox", "missing OpenClaw sandbox execute");
}

for (const script of [
  "scripts/run-local-stripe-e2e.mjs",
  "scripts/verify-local-job-correlation.mjs",
  "scripts/run-local-e2e-failures.mjs",
  "scripts/verify-dev-clone-contract.mjs",
  "scripts/run-m18-local-preflight.mjs",
  "docs/testing/M18-LOCAL-TEST-RUNBOOK.md",
]) {
  if (fs.existsSync(path.join(root, script))) ok(`573-${script}`, script);
  else fail(`573-${script}`, script);
}

console.log(JSON.stringify({ checklist: checks }, null, 2));
if (checks.some((c) => !c.pass)) process.exit(1);
