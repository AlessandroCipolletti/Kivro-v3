import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { createNetsonsComposition, loadNetsonsRuntimeConfig } from "@kivro/cloud-netsons";

const root = path.resolve(import.meta.dirname, "../..");

describe("M20 Netsons deployment profile", () => {
  it("exposes verify:m20 script and deploy documentation", () => {
    const pkg = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));
    expect(pkg.scripts["verify:m20"]).toBeTruthy();
    expect(fs.existsSync(path.join(root, "docs/deploy/netsons/README.md"))).toBe(true);
    expect(fs.existsSync(path.join(root, "apps/api/src/routes/platform-cron.ts"))).toBe(true);
  });

  it("Netsons composition uses db-cron durable profile baseline", () => {
    const c = createNetsonsComposition();
    expect(c.profile).toBe("netsons");
    expect(c.durableWorkProfile).toBe("netsons-db-cron");
    expect(c.workerTransport.kind).toBe("polling");
    expect(c.objectStorageProfile).toBe("s3-compatible");
  });

  it("loadNetsonsRuntimeConfig requires DATABASE_URL", () => {
    expect(() =>
      loadNetsonsRuntimeConfig({ NODE_ENV: "development", WEB_APP_URL: "http://localhost:3000" }),
    ).toThrow(/DATABASE_URL/);
    const cfg = loadNetsonsRuntimeConfig({
      NODE_ENV: "development",
      DATABASE_URL: "postgresql://localhost:5432/kivro",
      WEB_APP_URL: "http://localhost:3000",
    });
    expect(cfg.cloudProfile).toBe("netsons");
  });
});
