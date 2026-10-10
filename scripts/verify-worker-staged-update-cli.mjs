#!/usr/bin/env node
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";

const root = path.resolve(import.meta.dirname, "..");
const compatibility = await import(path.join(root, "packages/compatibility/dist/index.js"));
const keys = compatibility.generateWorkerReleaseSigningKeyPair();
const manifest = compatibility.demoWorkerReleaseManifest();
const signature = compatibility.signWorkerReleaseManifest(manifest, keys.privateKeyPem);

const runtime = fs.mkdtempSync(path.join(os.tmpdir(), "kivro-m25-staged-"));
const manifestPath = path.join(runtime, "manifest.json");
const keyPath = path.join(runtime, "pub.pem");
fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
fs.writeFileSync(keyPath, keys.publicKeyPem);

const cli = path.join(root, "apps/worker/dist/cli.js");
const env = { ...process.env, KIVRO_RUNTIME_ROOT: runtime };

function run(args) {
  const res = spawnSync(process.execPath, [cli, ...args], { cwd: root, env, encoding: "utf8" });
  if (res.status !== 0) {
    console.error(res.stderr || res.stdout);
    process.exit(res.status ?? 1);
  }
  return res.stdout;
}

run([
  "update",
  "begin",
  "--manifest",
  manifestPath,
  "--signature",
  signature,
  "--public-key",
  keyPath,
]);
run(["update", "health-check"]);
run(["update", "health-check"]);
const status = run(["update", "status"]);
if (!status.includes('"phase":"active"')) {
  console.error("Expected active phase after health checks");
  process.exit(1);
}

console.log("Worker staged update CLI OK (M25 HARD-012)");
