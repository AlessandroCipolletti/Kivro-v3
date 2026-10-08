#!/usr/bin/env node
/**
 * Terminal M03 gate: auth → pair → analyze deps → publish → marketplace list.
 * Requires API on PORT (default 3001), db + optional MinIO configured.
 */
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const base = process.env.KIVRO_CLOUD_URL ?? "http://localhost:3001";
const email = `m03-script-${Date.now()}@example.com`;
const password = "longpassword123";
const runtime = path.join(os.tmpdir(), `kivro-m03-${process.pid}`);
const cookies = path.join(os.tmpdir(), `kivro-m03-${process.pid}.cookies`);

async function main() {
  const reg = await post("/auth/register", { email, password });
  await post("/auth/verify-email", { token: reg.verificationToken });
  const loginRes = await fetch(`${base}/auth/login`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const set =
    loginRes.headers.getSetCookie?.() ??
    (loginRes.headers.get("set-cookie") ? [loginRes.headers.get("set-cookie")] : []);
  if (!set.length) {
    throw new Error("login did not return session cookie");
  }
  fs.writeFileSync(cookies, set.map((c) => c.split(";")[0]).join("; "));

  const code = (await post("/worker-devices/pairing-codes", {})).code;
  spawnSync(
    "node",
    ["apps/worker/dist/cli.js", "pair", "--code", code],
    {
      env: { ...process.env, KIVRO_RUNTIME_ROOT: runtime, KIVRO_CLOUD_URL: base },
      stdio: "inherit",
    },
  );
  const state = JSON.parse(fs.readFileSync(path.join(runtime, "worker-state.json"), "utf8"));
  const deviceId = state.device.workerDeviceId;

  const manifestRun = spawnSync(
    "node",
    ["apps/worker/dist/cli.js", "manifest", "--skills", "company-research"],
    { encoding: "utf8", cwd: process.cwd() },
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
  const analyze = await post("/seller/import/analyze-dependencies", {
    discovery,
    consent,
    rootName: "M03 Script",
  });
  if (analyze.blockers?.length) {
    throw new Error(`blockers: ${analyze.blockers.join(",")}`);
  }

  const slug = `m03-script-${Date.now()}`;
  const contract = {
    name: "M03 Script",
    description: "automated",
    currency: "USD",
    priceTierCents: 500,
    inputs: { contractVersion: 1, fields: [{ key: "q", type: "string", required: true }] },
    output: { contractVersion: 1, type: "TEXT" },
  };
  const draft = await post("/seller/capabilities", {
    slug,
    contract,
    permissionManifest: consent.permissionManifest,
  });
  const pub = await post(`/seller/capabilities/${draft.capability.id}/publish`, {
    workerDeviceId: deviceId,
    localWorkerId: "local-1",
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
    rootName: "M03 Script",
  });
  if (pub.capability.status !== "PUBLISHED") {
    throw new Error("publish failed");
  }
  const listed = await get(`/capabilities/${slug}`, false);
  console.log("M03 verify OK", listed.capability.slug, pub.version.versionLabel);
}

async function post(pathname, body) {
  const res = await fetch(`${base}${pathname}`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      cookie: fs.existsSync(cookies) ? fs.readFileSync(cookies, "utf8") : "",
    },
    body: JSON.stringify(body),
  });
  const json = await res.json();
  if (!res.ok) {
    throw new Error(`${pathname} ${res.status} ${JSON.stringify(json)}`);
  }
  return json;
}

async function get(pathname, auth) {
  const res = await fetch(`${base}${pathname}`, {
    headers: auth && fs.existsSync(cookies) ? { cookie: fs.readFileSync(cookies, "utf8") } : {},
  });
  const json = await res.json();
  if (!res.ok) {
    throw new Error(`${pathname} ${res.status} ${JSON.stringify(json)}`);
  }
  return json;
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
