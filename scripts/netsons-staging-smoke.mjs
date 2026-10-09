#!/usr/bin/env node
/** HOST-NET-029 — optional real-host smoke when staging URL is configured. */
const base = process.env.KIVRO_NETSONS_STAGING_URL?.replace(/\/$/, "");
if (!base) {
  console.log("SKIP netsons staging smoke (KIVRO_NETSONS_STAGING_URL unset)");
  process.exit(0);
}

async function check(path) {
  const res = await fetch(`${base}${path}`);
  if (!res.ok) {
    throw new Error(`${path} returned ${res.status}`);
  }
  return res.json();
}

const live = await check("/health/live");
if (live.status !== "live") {
  throw new Error("health/live not live");
}
const ready = await check("/health/ready");
if (ready.cloudProfile !== "netsons") {
  throw new Error(`expected cloudProfile netsons, got ${ready.cloudProfile}`);
}
if (ready.workerTransport !== "polling") {
  throw new Error(`expected workerTransport polling, got ${ready.workerTransport}`);
}
const discovery = await check("/worker/discovery");
if (!Array.isArray(discovery.controlPlanes) || discovery.controlPlanes.length < 1) {
  throw new Error("worker discovery missing control planes");
}
if (ready.checks?.database !== true) {
  throw new Error("database check failed on staging");
}
const cronProbe = await fetch(`${base}/platform/cron/netsons-tick`, {
  method: "POST",
  headers: {
    "content-type": "application/json",
    "x-kivro-cron-secret": process.env.KIVRO_CRON_SECRET ?? "",
  },
  body: "{}",
});
if (cronProbe.status === 401 && !process.env.KIVRO_CRON_SECRET) {
  console.log("cron tick auth skipped (KIVRO_CRON_SECRET unset)");
} else if (!cronProbe.ok && cronProbe.status !== 403) {
  throw new Error(`cron tick probe failed: ${cronProbe.status}`);
}
console.log("Netsons staging smoke OK");
