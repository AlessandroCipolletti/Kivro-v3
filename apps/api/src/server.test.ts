import { describe, expect, it } from "vitest";
import { createApp } from "./server.js";

describe("health endpoints", () => {
  it("returns live", async () => {
    const app = createApp();
    const live = await app.request("/health/live");
    expect(live.status).toBe(200);
  });

  it("returns ready or degraded", async () => {
    const app = createApp();
    const ready = await app.request("/health/ready");
    expect([200, 503]).toContain(ready.status);
  });
});
