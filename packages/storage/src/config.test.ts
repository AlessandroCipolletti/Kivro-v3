import { describe, expect, it } from "vitest";
import { getObjectStorageConfig } from "./config.js";

describe("object storage config", () => {
  it("MinIO local requires endpoint and keys", () => {
    expect(
      getObjectStorageConfig({
        S3_BUCKET: "kivro-dev",
        S3_ENDPOINT: "http://localhost:9000",
        S3_ACCESS_KEY: "kivro",
        S3_SECRET_KEY: "secret",
      }),
    ).toMatchObject({ useNativeAws: false, forcePathStyle: true });
  });

  it("AWS profile uses native S3 when endpoint omitted", () => {
    expect(
      getObjectStorageConfig({
        KIVRO_CLOUD_PROFILE: "aws",
        S3_BUCKET: "kivro-prod",
        AWS_REGION: "eu-west-1",
      }),
    ).toMatchObject({ useNativeAws: true, bucket: "kivro-prod", region: "eu-west-1" });
  });
});
