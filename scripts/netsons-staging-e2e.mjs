#!/usr/bin/env node
/** HOST-NET-030 — staging paid E2E gate when Netsons staging credentials are configured. */
const required = [
  "KIVRO_NETSONS_STAGING_URL",
  "DATABASE_URL",
  "KIVRO_E2E_BUYER_EMAIL",
  "KIVRO_E2E_SELLER_EMAIL",
];

const missing = required.filter((k) => !process.env[k]?.trim());
if (missing.length) {
  console.log(`SKIP Netsons staging E2E (missing: ${missing.join(", ")})`);
  process.exit(0);
}

process.env.API_URL ??= process.env.KIVRO_NETSONS_STAGING_URL;
process.env.WEB_APP_URL ??= process.env.KIVRO_NETSONS_STAGING_URL;
process.env.KIVRO_CLOUD_URL ??= process.env.KIVRO_NETSONS_STAGING_URL;
process.env.KIVRO_CLOUD_PROFILE = "netsons";

import { spawnSync } from "node:child_process";
const res = spawnSync("pnpm", ["test:e2e:local"], { stdio: "inherit" });
process.exit(res.status ?? 1);
