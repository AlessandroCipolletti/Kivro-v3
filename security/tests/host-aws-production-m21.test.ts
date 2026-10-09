import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { AWS_DEFAULT_BATCH_LIMITS, resolveSqsDurableWorkConfig } from "@kivro/cloud-aws";
import { resolveDatabaseUrlWithPoolLimit } from "@kivro/database";

const root = path.resolve(import.meta.dirname, "../..");

describe("M21 AWS production profile evidence", () => {
  it("bounded event tick batches exported", () => {
    expect(AWS_DEFAULT_BATCH_LIMITS.durableWork).toBeLessThanOrEqual(50);
    expect(AWS_DEFAULT_BATCH_LIMITS.webhooks).toBeLessThanOrEqual(50);
  });

  it("SQS durable work is optional (PostgreSQL remains authoritative)", () => {
    expect(resolveSqsDurableWorkConfig({})).toBeNull();
    expect(
      resolveSqsDurableWorkConfig({
        AWS_SQS_DURABLE_WORK_QUEUE_URL: "https://sqs.us-east-1.amazonaws.com/123/q",
        AWS_REGION: "us-east-1",
      }),
    ).toMatchObject({ queueUrl: expect.stringContaining("sqs") });
  });

  it("native S3 config supports IAM default chain", () => {
    const cfg = fs.readFileSync(path.join(root, "packages/storage/src/config.ts"), "utf8");
    expect(cfg).toContain("useNativeAws");
  });

  it("AWS production guards fail closed on bucket", () => {
    const guards = fs.readFileSync(path.join(root, "apps/api/src/aws-production-guards.ts"), "utf8");
    expect(guards).toContain("S3_BUCKET");
  });

  it("RDS pool default for aws profile", () => {
    const prevProfile = process.env.KIVRO_CLOUD_PROFILE;
    const prevMax = process.env.KIVRO_DATABASE_POOL_MAX;
    delete process.env.KIVRO_DATABASE_POOL_MAX;
    process.env.KIVRO_CLOUD_PROFILE = "aws";
    try {
      const url = resolveDatabaseUrlWithPoolLimit("postgresql://localhost/kivro");
      expect(url).toContain("connection_limit=10");
    } finally {
      if (prevProfile === undefined) delete process.env.KIVRO_CLOUD_PROFILE;
      else process.env.KIVRO_CLOUD_PROFILE = prevProfile;
      if (prevMax === undefined) delete process.env.KIVRO_DATABASE_POOL_MAX;
      else process.env.KIVRO_DATABASE_POOL_MAX = prevMax;
    }
  });
});
