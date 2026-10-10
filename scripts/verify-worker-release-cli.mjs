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

const dir = fs.mkdtempSync(path.join(os.tmpdir(), "kivro-m25-release-"));
const manifestPath = path.join(dir, "manifest.json");
const keyPath = path.join(dir, "pub.pem");
fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
fs.writeFileSync(keyPath, keys.publicKeyPem);

const cli = path.join(root, "apps/worker/dist/cli.js");
const ok = spawnSync(
  process.execPath,
  [cli, "update", "verify", "--manifest", manifestPath, "--signature", signature, "--public-key", keyPath],
  { cwd: root, encoding: "utf8" },
);
if (ok.status !== 0) {
  console.error(ok.stderr || ok.stdout);
  process.exit(ok.status ?? 1);
}

const badSig = spawnSync(
  process.execPath,
  [cli, "update", "verify", "--manifest", manifestPath, "--signature", "AAAA", "--public-key", keyPath],
  { cwd: root, encoding: "utf8" },
);
if (badSig.status === 0) {
  console.error("Expected invalid signature to fail");
  process.exit(1);
}

console.log("Worker update CLI verification OK (M25)");
