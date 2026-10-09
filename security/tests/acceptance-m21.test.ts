import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { createAwsComposition, loadAwsRuntimeConfig } from "@kivro/cloud-aws";

const root = path.resolve(import.meta.dirname, "../..");

describe("M21 AWS deployment profile", () => {
  it("exposes verify:m21 script and deploy documentation", () => {
    const pkg = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));
    expect(pkg.scripts["verify:m21"]).toBeTruthy();
    expect(fs.existsSync(path.join(root, "docs/deploy/aws/README.md"))).toBe(true);
    expect(fs.existsSync(path.join(root, "docs/deploy/aws/DEPLOYMENT-GUIDE.md"))).toBe(true);
    expect(fs.existsSync(path.join(root, "scripts/aws-unified-start.mjs"))).toBe(true);
    const cron = fs.readFileSync(path.join(root, "apps/api/src/routes/platform-cron.ts"), "utf8");
    expect(cron).toContain("/aws-tick");
  });

  it("AWS composition uses managed-queue durable profile and WSS transport", () => {
    const c = createAwsComposition();
    expect(c.profile).toBe("aws");
    expect(c.durableWorkProfile).toBe("aws-managed-queue");
    expect(c.workerTransport.kind).toBe("wss");
    expect(c.objectStorageProfile).toBe("aws-s3");
  });

  it("loadAwsRuntimeConfig requires DATABASE_URL", () => {
    expect(() => loadAwsRuntimeConfig({ NODE_ENV: "development" })).toThrow(/DATABASE_URL/);
  });
});
