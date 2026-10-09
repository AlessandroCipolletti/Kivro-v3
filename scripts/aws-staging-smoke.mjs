#!/usr/bin/env node
/** M21 — optional real-AWS smoke when staging URL is configured. */
const base = process.env.KIVRO_AWS_STAGING_URL?.replace(/\/$/, "");
if (!base) {
  console.log("SKIP AWS staging smoke (KIVRO_AWS_STAGING_URL unset)");
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
if (ready.cloudProfile !== "aws") {
  throw new Error(`expected cloudProfile aws, got ${ready.cloudProfile}`);
}
if (ready.workerTransport !== "wss") {
  throw new Error(`expected workerTransport wss, got ${ready.workerTransport}`);
}
if (ready.durableWorkProfile !== "aws-managed-queue") {
  throw new Error(`expected durableWorkProfile aws-managed-queue, got ${ready.durableWorkProfile}`);
}
const discovery = await check("/worker/discovery");
if (!Array.isArray(discovery.controlPlanes) || discovery.controlPlanes.length < 1) {
  throw new Error("worker discovery missing control planes");
}
if (ready.checks?.database !== true) {
  throw new Error("database check failed on staging");
}
const cronProbe = await fetch(`${base}/platform/cron/aws-tick`, {
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
  throw new Error(`aws-tick probe failed: ${cronProbe.status}`);
}
console.log("AWS staging smoke OK");
