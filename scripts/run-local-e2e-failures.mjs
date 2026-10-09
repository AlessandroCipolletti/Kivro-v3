#!/usr/bin/env node
/**
 * DEV-LOCAL-024 — HTTP failure-path smoke (requires API + seed + prior capability).
 */
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const base = process.env.KIVRO_E2E_API_URL ?? process.env.KIVRO_CLOUD_URL ?? "http://localhost:3001";
const password = "KivroDevPass123!";
const scenarios = [];

async function main() {
  const live = await fetch(`${base}/health/live`).then((r) => r.ok).catch(() => false);
  if (!live) {
    console.log(JSON.stringify({ skipped: true, reason: "API not running" }));
    process.exit(0);
  }

  spawnSync("node", ["scripts/run-with-env.mjs", "node", "scripts/dev-seed.mjs"], {
    cwd: root,
    stdio: "inherit",
  });

  const buyerEmail = "buyer@kivro.local";
  const sellerEmail = "seller@kivro.local";
  const cookiesBuyer = path.join(os.tmpdir(), `kivro-fail-buyer-${process.pid}.cookies`);
  const cookiesSeller = path.join(os.tmpdir(), `kivro-fail-seller-${process.pid}.cookies`);
  await login(buyerEmail, cookiesBuyer);
  await login(sellerEmail, cookiesSeller);

  const caps = await get("/marketplace/capabilities", cookiesBuyer);
  const capId = caps.capabilities?.[0]?.id;
  if (!capId) {
    console.log(JSON.stringify({ skipped: true, reason: "no published capability" }));
    process.exit(0);
  }

  const { getPrismaClient } = await import("@kivro/database");
  const { grantBuyerCredits } = await import("@kivro/billing");
  const prisma = getPrismaClient();
  const buyer = await prisma.user.findUnique({ where: { email: buyerEmail } });
  if (!buyer) throw new Error("buyer missing");

  await prisma.ledgerEntry.deleteMany({ where: { userId: buyer.id } });
  const poorRes = await fetch(`${base}/buyer/jobs`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      cookie: fs.readFileSync(cookiesBuyer, "utf8"),
    },
    body: JSON.stringify({ capabilityId: capId, inputs: { question: "x" } }),
  });
  const poor = await poorRes.json();
  if (poorRes.status !== 402 || poor.error !== "INSUFFICIENT_CREDITS") {
    throw new Error(`insufficient_credits expected 402, got ${poorRes.status}`);
  }
  scenarios.push("insufficient_credits");

  await grantBuyerCredits(prisma, {
    buyerId: buyer.id,
    amountCents: 50_000,
    externalId: `fail-e2e-${Date.now()}`,
  });

  const job = await post("/buyer/jobs", { capabilityId: capId, inputs: { question: "cancel me" } }, cookiesBuyer);
  const cancelRes = await fetch(`${base}/buyer/jobs/${job.jobId}/cancel`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      cookie: fs.readFileSync(cookiesBuyer, "utf8"),
    },
    body: JSON.stringify({ reason: "e2e cancel" }),
  });
  const cancelled = await cancelRes.json();
  if (cancelRes.status !== 200 || cancelled.status !== "CANCELLED") {
    throw new Error(`cancel failed ${cancelRes.status} ${JSON.stringify(cancelled)}`);
  }
  scenarios.push("buyer_cancel_refund_path");

  const releases = await prisma.ledgerEntry.count({
    where: { jobId: job.jobId, type: "JOB_RELEASE" },
  });
  if (releases < 1) {
    throw new Error("expected JOB_RELEASE after buyer cancel");
  }
  scenarios.push("refund_ledger_release");

  const invalidComplete = await fetch(`${base}/worker/jobs/${job.jobId}/complete`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-worker-device-id": "00000000-0000-4000-8000-000000000001",
    },
    body: JSON.stringify({ structuredOutput: "not-an-object" }),
  });
  if (invalidComplete.status !== 400) {
    const body = await invalidComplete.json().catch(() => ({}));
    if (body.error !== "INVALID_DELIVERABLE_OUTPUT" && invalidComplete.status !== 403) {
      throw new Error(`invalid_output expected 400/403, got ${invalidComplete.status}`);
    }
  }
  scenarios.push("invalid_deliverable_rejected");

  const runtime = path.join(os.tmpdir(), `kivro-fail-worker-${process.pid}`);
  spawnSync("pnpm", ["--filter", "@kivro/worker", "run", "build"], { cwd: root, stdio: "ignore" });
  const code = (await post("/worker-devices/pairing-codes", {}, cookiesSeller)).code;
  spawnSync("node", ["apps/worker/dist/cli.js", "pair", "--code", code], {
    env: { ...process.env, KIVRO_RUNTIME_ROOT: runtime, KIVRO_CLOUD_URL: base },
    cwd: root,
    stdio: "ignore",
  });
  const state = JSON.parse(fs.readFileSync(path.join(runtime, "worker-state.json"), "utf8"));
  const deviceId = state.device.workerDeviceId;

  const job2 = await post("/buyer/jobs", { capabilityId: capId, inputs: { question: "reject" } }, cookiesBuyer);
  await fetch(`${base}/worker/jobs/${job2.jobId}/dispatch`, {
    method: "POST",
    headers: { "x-worker-device-id": deviceId },
  });
  const rejectRes = await fetch(`${base}/worker/jobs/reject`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-worker-device-id": deviceId,
    },
    body: JSON.stringify({ jobId: job2.jobId, reason: "worker offline e2e" }),
  });
  if (!rejectRes.ok) {
    throw new Error(`worker reject failed ${rejectRes.status}`);
  }
  scenarios.push("worker_offline_reject");

  console.log(JSON.stringify({ failures: "ok", scenarios }));
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
  if (!set.length) throw new Error("login failed");
  fs.writeFileSync(cookieFile, set.map((c) => c.split(";")[0]).join("; "));
}

async function post(p, body, cookieFile) {
  const res = await fetch(`${base}${p}`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      cookie: fs.readFileSync(cookieFile, "utf8"),
    },
    body: JSON.stringify(body),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(`${p} ${res.status} ${JSON.stringify(json)}`);
  return json;
}

async function get(p, cookieFile) {
  const res = await fetch(`${base}${p}`, {
    headers: { cookie: fs.readFileSync(cookieFile, "utf8") },
  });
  return res.json();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
