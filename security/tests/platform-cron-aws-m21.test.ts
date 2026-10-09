import { afterEach, describe, expect, it } from "vitest";
import { Hono } from "hono";
import { platformCronRoutes } from "../../apps/api/src/routes/platform-cron.js";
import { resolveCloudComposition } from "../../apps/api/src/cloud-composition.js";

const hasDb = Boolean(process.env.DATABASE_URL);

describe("platform cron AWS tick (M21)", () => {
  const savedProfile = process.env.KIVRO_CLOUD_PROFILE;
  const savedCron = process.env.KIVRO_CRON_SECRET;

  afterEach(() => {
    if (savedProfile === undefined) delete process.env.KIVRO_CLOUD_PROFILE;
    else process.env.KIVRO_CLOUD_PROFILE = savedProfile;
    if (savedCron === undefined) delete process.env.KIVRO_CRON_SECRET;
    else process.env.KIVRO_CRON_SECRET = savedCron;
  });

  it("rejects aws-tick when profile is netsons", async () => {
    process.env.KIVRO_CLOUD_PROFILE = "netsons";
    process.env.KIVRO_CRON_SECRET = "test-secret";
    resolveCloudComposition("netsons");
    const app = new Hono();
    app.route("/platform/cron", platformCronRoutes());
    const res = await app.request("/platform/cron/aws-tick", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-kivro-cron-secret": "test-secret",
      },
      body: "{}",
    });
    expect(res.status).toBe(403);
  });

  it.runIf(hasDb)("aws-tick returns ok for aws profile", async () => {
    process.env.KIVRO_CLOUD_PROFILE = "aws";
    process.env.KIVRO_CRON_SECRET = "test-secret";
    resolveCloudComposition("aws");
    const app = new Hono();
    app.route("/platform/cron", platformCronRoutes());
    const res = await app.request("/platform/cron/aws-tick", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-kivro-cron-secret": "test-secret",
      },
      body: JSON.stringify({ durableWorkLimit: 1, webhookLimit: 1 }),
    });
    expect(res.status).toBe(200);
    const body = (await res.json()) as { ok: boolean; durableWork: { claimed: number } };
    expect(body.ok).toBe(true);
    expect(body.durableWork).toBeTruthy();
  });
});
