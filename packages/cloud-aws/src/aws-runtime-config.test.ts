import { describe, expect, it } from "vitest";
import { loadAwsRuntimeConfig } from "./aws-runtime-config.js";

describe("loadAwsRuntimeConfig", () => {
  it("requires DATABASE_URL", () => {
    expect(() => loadAwsRuntimeConfig({ NODE_ENV: "development" })).toThrow(/DATABASE_URL/);
  });

  it("loads aws profile defaults", () => {
    const cfg = loadAwsRuntimeConfig({
      NODE_ENV: "development",
      DATABASE_URL: "postgresql://localhost/kivro",
    });
    expect(cfg.cloudProfile).toBe("aws");
    expect(cfg.region).toBe("us-east-1");
  });
});
