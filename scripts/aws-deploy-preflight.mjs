#!/usr/bin/env node
/** M21 — validate AWS profile env before promote (fail closed in production). */
import { loadAwsRuntimeConfig } from "../packages/cloud-aws/dist/aws-runtime-config.js";

const errors = [];

try {
  loadAwsRuntimeConfig(process.env);
} catch (err) {
  errors.push(err instanceof Error ? err.message : String(err));
}

const requiredProd = [
  "KIVRO_CLOUD_PROFILE",
  "DATABASE_URL",
  "KIVRO_CRON_SECRET",
  "WEB_APP_URL",
  "KIVRO_CLOUD_URL",
  "S3_BUCKET",
  "AWS_REGION",
];

if (process.env.NODE_ENV === "production") {
  for (const key of requiredProd) {
    if (key === "S3_BUCKET" && process.env.AWS_S3_BUCKET?.trim()) {
      continue;
    }
    if (!process.env[key]?.trim()) {
      errors.push(`missing:${key}`);
    }
  }
  if (process.env.KIVRO_CRON_SECRET === "dev-cron-not-for-production") {
    errors.push("unsafe:KIVRO_CRON_SECRET");
  }
}

if (process.env.KIVRO_CLOUD_PROFILE?.trim().toLowerCase() !== "aws") {
  errors.push("KIVRO_CLOUD_PROFILE must be aws");
}

if (errors.length) {
  console.error("AWS deploy preflight FAILED:");
  for (const e of errors) {
    console.error(`  ${e}`);
  }
  process.exit(1);
}

console.log("AWS deploy preflight OK");
