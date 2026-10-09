#!/usr/bin/env node
/**
 * Local paid job path (§563 / DEV-LOCAL-023).
 * Requires API running (`pnpm dev`) and DB from `pnpm dev:demo`.
 */
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const base = process.env.KIVRO_E2E_API_URL ?? process.env.KIVRO_CLOUD_URL ?? "http://localhost:3001";
const sellerEmail = "seller@kivro.local";
const buyerEmail = "buyer@kivro.local";
const password = "KivroDevPass123!";
const cookiesSeller = path.join(os.tmpdir(), `kivro-e2e-seller-${process.pid}.cookies`);
const cookiesBuyer = path.join(os.tmpdir(), `kivro-e2e-buyer-${process.pid}.cookies`);
const runtime = path.join(os.tmpdir(), `kivro-e2e-worker-${process.pid}`);

async function main() {
  const live = await fetch(`${base}/health/live`).then((r) => r.ok).catch(() => false);
  if (!live) {
    if (process.env.KIVRO_E2E_REQUIRE_API === "true") {
      throw new Error(`API not reachable at ${base}`);
    }
    console.log(JSON.stringify({ skipped: true, reason: "API not running", base }));
    process.exit(0);
  }

  const buildWorker = spawnSync("pnpm", ["--filter", "@kivro/worker", "run", "build"], {
    cwd: root,
    stdio: "inherit",
  });
  if (buildWorker.status !== 0) {
    throw new Error("worker build failed");
  }

  spawnSync("node", ["scripts/run-with-env.mjs", "node", "scripts/dev-seed.mjs"], {
    stdio: "inherit",
    cwd: root,
  });

  await login(sellerEmail, cookiesSeller);
  await login(buyerEmail, cookiesBuyer);

  const code = (await postSeller("/worker-devices/pairing-codes", {})).code;
  const pairRun = spawnSync("node", ["apps/worker/dist/cli.js", "pair", "--code", code], {
    env: { ...process.env, KIVRO_RUNTIME_ROOT: runtime, KIVRO_CLOUD_URL: base },
    stdio: "inherit",
    cwd: root,
  });
  if (pairRun.status !== 0) {
    throw new Error("worker pair failed");
  }
  const state = JSON.parse(fs.readFileSync(path.join(runtime, "worker-state.json"), "utf8"));
  const deviceId = state.device.workerDeviceId;

  const manifestRun = spawnSync(
    "node",
    ["apps/worker/dist/cli.js", "manifest", "--skills", "company-research"],
    { encoding: "utf8", cwd: root },
  );
  if (manifestRun.status !== 0) {
    throw new Error(`manifest CLI failed: ${manifestRun.stderr}`);
  }
  const manifest = JSON.parse(manifestRun.stdout);

  const discovery = {
    snapshotVersion: 1,
    skills: ["company-research"],
    tools: [],
    warnings: [],
  };
  const consent = {
    consentVersion: 1,
    selectedSkills: ["company-research"],
    selectedTools: [],
    permissionManifest: {
      manifestVersion: 1,
      categories: [{ key: "PUBLIC_INTERNET", state: "USED", buyerLabel: "Web" }],
    },
  };

  const slug = `e2e-local-${Date.now()}`;
  const contract = {
    name: "E2E Local Fixture",
    description: "M18 document-style fixture",
    currency: "USD",
    priceTierCents: 500,
    inputs: { contractVersion: 1, fields: [{ key: "question", type: "string", required: true }] },
    output: { contractVersion: 1, type: "TEXT" },
  };
  const draft = await postSeller("/seller/capabilities", {
    slug,
    contract,
    permissionManifest: consent.permissionManifest,
  });
  await postSeller(`/seller/capabilities/${draft.capability.id}/publish`, {
    workerDeviceId: deviceId,
    localWorkerId: "local-e2e",
    contract,
    permissionManifest: consent.permissionManifest,
    workerManifest: manifest,
    inferenceDependency: {
      mode: "LOCAL",
      provider: "ollama",
      model: "llama",
      billingOwner: "SELLER",
    },
    executionModelAcknowledged: true,
    discovery,
    consent,
    rootName: "E2E Local Fixture",
  });

  const listed = await getBuyer(`/marketplace/capabilities?q=${encodeURIComponent(slug)}`);
  const found = listed.capabilities?.find((c) => c.slug === slug);
  if (!found) throw new Error("buyer did not discover capability");

  const job = await postBuyer("/buyer/jobs", {
    capabilityId: draft.capability.id,
    inputs: { question: "Summarize the fixture." },
  });
  const jobId = job.jobId ?? job.id;
  if (!jobId) throw new Error("missing job id");

  const dispatchRes = await fetch(`${base}/worker/jobs/${jobId}/dispatch`, {
    method: "POST",
    headers: { "x-worker-device-id": deviceId },
  });
  const dispatchJson = await dispatchRes.json().catch(() => ({}));
  if (!dispatchRes.ok) {
    throw new Error(`dispatch failed ${dispatchRes.status} ${JSON.stringify(dispatchJson)}`);
  }

  const acceptRes = await fetch(`${base}/worker/jobs/accept`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-worker-device-id": deviceId,
    },
    body: JSON.stringify({
      type: "JOB_ACCEPTED",
      protocolVersion: 1,
      jobId,
      workerDeviceId: deviceId,
      acceptedAt: new Date().toISOString(),
    }),
  });
  if (!acceptRes.ok) throw new Error(`accept failed ${acceptRes.status}`);

  const runningRes = await fetch(`${base}/worker/jobs/${jobId}/running`, {
    method: "POST",
    headers: { "x-worker-device-id": deviceId },
  });
  if (!runningRes.ok) throw new Error(`running failed ${runningRes.status}`);

  const completeRes = await fetch(`${base}/worker/jobs/${jobId}/complete`, {
    method: "POST",
    headers: { "x-worker-device-id": deviceId },
  });
  if (!completeRes.ok) {
    const body = await completeRes.json().catch(() => ({}));
    throw new Error(`complete failed ${completeRes.status} ${JSON.stringify(body)}`);
  }

  const detail = await getBuyer(`/buyer/jobs/${jobId}`);
  if (detail.status !== "COMPLETED") {
    throw new Error(`expected COMPLETED job, got ${detail.status}`);
  }

  console.log(JSON.stringify({ e2e: "ok", jobId, status: detail.status, correlation: "local-e2e" }));
}

async function login(email, cookieFile) {
  const res = await fetch(`${base}/auth/login`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const set =
    res.headers.getSetCookie?.() ??
    (res.headers.get("set-cookie") ? [res.headers.get("set-cookie")] : []);
  if (!set.length) throw new Error(`login failed for ${email}`);
  fs.writeFileSync(cookieFile, set.map((c) => c.split(";")[0]).join("; "));
}

async function postSeller(p, body) {
  return request("POST", p, body, cookiesSeller);
}
async function postBuyer(p, body) {
  return request("POST", p, body, cookiesBuyer);
}
async function getBuyer(p) {
  return request("GET", p, null, cookiesBuyer);
}

async function request(method, p, body, cookieFile) {
  const res = await fetch(`${base}${p}`, {
    method,
    headers: {
      "content-type": "application/json",
      cookie: fs.readFileSync(cookieFile, "utf8"),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`${method} ${p} → ${res.status} ${JSON.stringify(json)}`);
  return json;
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
