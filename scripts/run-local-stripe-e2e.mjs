#!/usr/bin/env node
/** Stripe test-mode local path smoke (DEV-LOCAL-015). Skips when STRIPE_SECRET_KEY unset. */
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const base = process.env.KIVRO_E2E_API_URL ?? process.env.KIVRO_CLOUD_URL ?? "http://localhost:3001";

async function main() {
  if (!process.env.STRIPE_SECRET_KEY?.startsWith("sk_test")) {
    console.log(JSON.stringify({ skipped: true, reason: "STRIPE_SECRET_KEY (sk_test_*) not set" }));
    process.exit(0);
  }
  const live = await fetch(`${base}/health/live`).then((r) => r.ok).catch(() => false);
  if (!live) {
    console.log(JSON.stringify({ skipped: true, reason: "API not running" }));
    process.exit(0);
  }

  const cookies = path.join(os.tmpdir(), `kivro-stripe-e2e-${process.pid}.cookies`);
  await login("buyer@kivro.local", cookies);

  const caps = await get("/marketplace/capabilities", cookies);
  const capId = caps.capabilities?.[0]?.id;
  if (!capId) {
    console.log(JSON.stringify({ skipped: true, reason: "no capability" }));
    process.exit(0);
  }

  const res = await fetch(`${base}/buyer/jobs`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      cookie: fs.readFileSync(cookies, "utf8"),
    },
    body: JSON.stringify({
      capabilityId: capId,
      inputs: { question: "stripe test path" },
      paymentMode: "card",
    }),
  });
  const json = await res.json();
  if (res.status === 503 && json.error === "STRIPE_NOT_CONFIGURED") {
    throw new Error("STRIPE_SECRET_KEY set but API reports STRIPE_NOT_CONFIGURED");
  }
  if (res.status !== 201 || !json.clientSecret) {
    throw new Error(`expected card authorized job 201, got ${res.status} ${JSON.stringify(json)}`);
  }
  console.log(JSON.stringify({ stripeLocal: "ok", jobId: json.jobId, hasClientSecret: true }));
}

async function login(email, cookieFile) {
  const res = await fetch(`${base}/auth/login`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ email, password: "KivroDevPass123!" }),
  });
  const set =
    res.headers.getSetCookie?.() ??
    (res.headers.get("set-cookie") ? [res.headers.get("set-cookie")] : []);
  if (!set.length) throw new Error("login failed");
  fs.writeFileSync(cookieFile, set.map((c) => c.split(";")[0]).join("; "));
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
