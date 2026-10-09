import { describe, expect, it } from "vitest";
import { resolveDatabaseUrlWithPoolLimit } from "./index.js";

describe("managed database pool limits", () => {
  it("adds connection_limit for netsons profile", () => {
    const prevProfile = process.env.KIVRO_CLOUD_PROFILE;
    const prevMax = process.env.KIVRO_DATABASE_POOL_MAX;
    process.env.KIVRO_CLOUD_PROFILE = "netsons";
    process.env.KIVRO_DATABASE_POOL_MAX = "5";
    try {
      const url = resolveDatabaseUrlWithPoolLimit(
        "postgresql://u:p@localhost:5432/kivro?schema=public",
      );
      expect(url).toContain("connection_limit=5");
    } finally {
      if (prevProfile === undefined) delete process.env.KIVRO_CLOUD_PROFILE;
      else process.env.KIVRO_CLOUD_PROFILE = prevProfile;
      if (prevMax === undefined) delete process.env.KIVRO_DATABASE_POOL_MAX;
      else process.env.KIVRO_DATABASE_POOL_MAX = prevMax;
    }
  });

  it("adds connection_limit for aws profile (RDS default 10)", () => {
    const prevProfile = process.env.KIVRO_CLOUD_PROFILE;
    const prevMax = process.env.KIVRO_DATABASE_POOL_MAX;
    delete process.env.KIVRO_DATABASE_POOL_MAX;
    process.env.KIVRO_CLOUD_PROFILE = "aws";
    try {
      const url = resolveDatabaseUrlWithPoolLimit(
        "postgresql://u:p@localhost:5432/kivro?schema=public",
      );
      expect(url).toContain("connection_limit=10");
    } finally {
      if (prevProfile === undefined) delete process.env.KIVRO_CLOUD_PROFILE;
      else process.env.KIVRO_CLOUD_PROFILE = prevProfile;
      if (prevMax === undefined) delete process.env.KIVRO_DATABASE_POOL_MAX;
      else process.env.KIVRO_DATABASE_POOL_MAX = prevMax;
    }
  });
});
