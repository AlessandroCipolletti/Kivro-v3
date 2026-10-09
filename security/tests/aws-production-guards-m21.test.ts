import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { assertAwsProductionEnvironment } from "../../apps/api/src/aws-production-guards.js";

describe("assertAwsProductionEnvironment (M21)", () => {
  const keys = [
    "NODE_ENV",
    "KIVRO_CLOUD_PROFILE",
    "DATABASE_URL",
    "KIVRO_CRON_SECRET",
    "WEB_APP_URL",
    "KIVRO_CLOUD_URL",
    "S3_BUCKET",
  ] as const;
  const snapshot: Record<string, string | undefined> = {};

  beforeEach(() => {
    for (const k of keys) {
      snapshot[k] = process.env[k];
    }
  });

  afterEach(() => {
    for (const k of keys) {
      if (snapshot[k] === undefined) delete process.env[k];
      else process.env[k] = snapshot[k];
    }
  });

  function setProdAws(overrides: Record<string, string | undefined> = {}) {
    process.env.NODE_ENV = "production";
    process.env.KIVRO_CLOUD_PROFILE = "aws";
    process.env.DATABASE_URL = "postgresql://localhost/kivro";
    process.env.KIVRO_CRON_SECRET = "prod-secret";
    process.env.WEB_APP_URL = "https://app.example";
    process.env.KIVRO_CLOUD_URL = "https://api.example";
    process.env.S3_BUCKET = "kivro-prod";
    for (const [k, v] of Object.entries(overrides)) {
      if (v === undefined) delete process.env[k];
      else process.env[k] = v;
    }
  }

  it("requires S3 bucket in production aws profile", () => {
    setProdAws();
    delete process.env.S3_BUCKET;
    expect(() => assertAwsProductionEnvironment()).toThrow(/S3_BUCKET/);
  });
});
