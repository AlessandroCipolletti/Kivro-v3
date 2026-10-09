#!/usr/bin/env node
/** M21 — staging paid E2E gate when AWS staging credentials are configured. */
const required = [
  "KIVRO_AWS_STAGING_URL",
  "DATABASE_URL",
  "KIVRO_E2E_BUYER_EMAIL",
  "KIVRO_E2E_SELLER_EMAIL",
];

const missing = required.filter((k) => !process.env[k]?.trim());
if (missing.length) {
  console.log(`SKIP AWS staging E2E (missing: ${missing.join(", ")})`);
  process.exit(0);
}

process.env.API_URL ??= process.env.KIVRO_AWS_STAGING_URL;
process.env.WEB_APP_URL ??= process.env.KIVRO_AWS_STAGING_URL;
process.env.KIVRO_CLOUD_URL ??= process.env.KIVRO_AWS_STAGING_URL;
process.env.KIVRO_CLOUD_PROFILE = "aws";

import { spawnSync } from "node:child_process";
const res = spawnSync("pnpm", ["test:e2e:local"], { stdio: "inherit" });
process.exit(res.status ?? 1);
