#!/usr/bin/env node
/**
 * Dev-only: ensure seller@kivro.local exists and this machine is paired (§556 / DEV-LOCAL-010).
 * Requires API reachable at KIVRO_CLOUD_URL / API_URL.
 */
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const sellerEmail = "seller@kivro.local";
const devPassword = "KivroDevPass123!";

function resolveCloudUrl() {
  return (
    process.env.KIVRO_CLOUD_URL?.trim() ||
    process.env.API_URL?.trim() ||
    `http://localhost:${process.env.PORT?.trim() || "3001"}`
  );
}

function runtimeRoot() {
  const configured = process.env.KIVRO_RUNTIME_ROOT ?? "~/.kivro/runtime";
  return configured.startsWith("~")
    ? path.join(os.homedir(), configured.slice(1))
    : configured;
}

function readPairedDeviceId() {
  const statePath = path.join(runtimeRoot(), "worker-state.json");
  if (!fs.existsSync(statePath)) {
    return null;
  }
  try {
    const file = JSON.parse(fs.readFileSync(statePath, "utf8"));
    return file.device?.workerDeviceId ?? null;
  } catch {
    return null;
  }
}

async function fetchWithRetry(url, init, attempts = 10) {
  let lastErr;
  for (let i = 0; i < attempts; i++) {
    try {
      return await fetch(url, init);
    } catch (err) {
      lastErr = err;
      await new Promise((r) => setTimeout(r, 400 + i * 250));
    }
  }
  throw lastErr;
}

/** Avoid pairing while `node --watch` is restarting the API after dist churn. */
async function waitForStableApi(base, timeoutMs = 120_000) {
  const deadline = Date.now() + timeoutMs;
  let streak = 0;
  while (Date.now() < deadline) {
    try {
      const liveOk = await fetch(`${base}/health/live`).then((r) => r.ok);
      const ready = liveOk
        ? await fetch(`${base}/health/ready`)
            .then((r) => r.json())
            .catch(() => null)
        : null;
      const dbOk = ready?.checks?.database === true;
      if (liveOk && dbOk) {
        streak += 1;
        if (streak >= 3) {
          return;
        }
      } else {
        streak = 0;
      }
    } catch {
      streak = 0;
    }
    await new Promise((r) => setTimeout(r, 400));
  }
  throw new Error(`API not stable at ${base} — wait for listen/ready or use API without --watch`);
}

async function main() {
  if (process.env.KIVRO_DEV_AUTO_PAIR === "false") {
    console.log("KIVRO_DEV_AUTO_PAIR=false — skipping worker auto-pair");
    process.exit(0);
  }
  if (process.env.NODE_ENV === "production") {
    console.error("dev-worker-auto-pair is not allowed in production");
    process.exit(1);
  }

  const cloudUrl = resolveCloudUrl();
  process.env.KIVRO_CLOUD_URL = cloudUrl;

  const existing = readPairedDeviceId();
  if (existing) {
    console.log(JSON.stringify({ autoPair: "skipped", workerDeviceId: existing, cloudUrl }));
    return;
  }

  console.log(`Waiting for stable API at ${cloudUrl}…`);
  await waitForStableApi(cloudUrl);

  console.log("Ensuring dev seed (seller identity)…");
  const seed = spawnSync("node", ["scripts/run-with-env.mjs", "node", "scripts/run-dev-seed.mjs"], {
    cwd: root,
    stdio: "inherit",
    env: process.env,
  });
  if (seed.status !== 0) {
    process.exit(seed.status ?? 1);
  }

  const loginRes = await fetchWithRetry(`${cloudUrl}/auth/login`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ email: sellerEmail, password: devPassword }),
  });
  const set =
    loginRes.headers.getSetCookie?.() ??
    (loginRes.headers.get("set-cookie") ? [loginRes.headers.get("set-cookie")] : []);
  if (!set.length) {
    throw new Error(`Dev seller login failed — run pnpm dev:demo or dev:all:demo first`);
  }
  const cookie = set.map((c) => c.split(";")[0]).join("; ");

  const codeRes = await fetchWithRetry(`${cloudUrl}/worker-devices/pairing-codes`, {
    method: "POST",
    headers: { "content-type": "application/json", cookie },
    body: "{}",
  });
  const codePayload = await codeRes.json().catch(() => ({}));
  if (!codeRes.ok || !codePayload.code) {
    throw new Error(`pairing-codes failed: ${JSON.stringify(codePayload)}`);
  }

  console.log("Pairing worker with seller account…");
  const pair = spawnSync(
    "node",
    ["apps/worker/dist/cli.js", "pair", "--code", codePayload.code],
    { cwd: root, stdio: "inherit", env: process.env },
  );
  if (pair.status !== 0) {
    process.exit(pair.status ?? 1);
  }

  const deviceId = readPairedDeviceId();
  console.log(JSON.stringify({ autoPair: "ok", workerDeviceId: deviceId, cloudUrl }));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
