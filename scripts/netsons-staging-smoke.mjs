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
console.log("Netsons staging smoke OK");
