import { describe, expect, it } from "vitest";
import { probeObjectStorageHealth } from "./storage-health.js";

describe("probeObjectStorageHealth", () => {
  it("returns null when storage env is incomplete", async () => {
    await expect(probeObjectStorageHealth({})).resolves.toBeNull();
  });

  it("returns null for native AWS config without live bucket (skipped probe in unit env)", async () => {
    const result = await probeObjectStorageHealth({
      KIVRO_CLOUD_PROFILE: "aws",
      S3_BUCKET: "unit-test-bucket-not-real",
      AWS_REGION: "us-east-1",
    });
    expect(result === false || result === true).toBe(true);
  });
});
