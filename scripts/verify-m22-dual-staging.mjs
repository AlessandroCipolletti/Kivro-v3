#!/usr/bin/env node
/** M22 — optional dual control-plane discovery smoke on a staging API. */
const base = (
  process.env.KIVRO_M22_STAGING_URL ??
  process.env.KIVRO_AWS_STAGING_URL ??
  process.env.KIVRO_NETSONS_STAGING_URL
)?.replace(/\/$/, "");

if (!base) {
  console.log(
    "SKIP M22 dual staging smoke (set KIVRO_M22_STAGING_URL or AWS/Netsons staging URL)",
  );
  process.exit(0);
}

async function check(path, init) {
  const res = await fetch(`${base}${path}`, init);
  if (!res.ok) {
    throw new Error(`${path} returned ${res.status}`);
  }
  return res.json();
}

const discovery = await check("/worker/discovery");
if (!discovery.protocolVersion || !discovery.compatibilityWindow) {
  throw new Error("discovery missing protocolVersion or compatibilityWindow");
}
if (!Array.isArray(discovery.controlPlanes) || discovery.controlPlanes.length < 1) {
  throw new Error("discovery missing controlPlanes");
}
for (const cp of discovery.controlPlanes) {
  if (!cp.controlPlaneId || !cp.lifecycleState || !Array.isArray(cp.transports)) {
    throw new Error("invalid control plane advertisement");
  }
  if (cp.lifecycleState === "RETIRED") {
    throw new Error("RETIRED control plane must not appear in worker discovery");
  }
}

const adminToken = process.env.KIVRO_ADMIN_TOKEN;
if (adminToken) {
  const registry = await check("/platform/admin/control-planes", {
    headers: { "x-kivro-admin-token": adminToken },
  });
  if (!Array.isArray(registry.controlPlanes)) {
    throw new Error("admin control-planes missing registry");
  }
} else {
  console.log("admin control-planes check skipped (KIVRO_ADMIN_TOKEN unset)");
}

console.log("M22 dual staging smoke OK");
