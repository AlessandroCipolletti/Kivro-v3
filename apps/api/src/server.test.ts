import { describe, expect, it } from "vitest";
import { createApp } from "./server.js";

describe("health endpoints", () => {
  it("returns live and ready", async () => {
    const app = createApp();
    const live = await app.request("/health/live");
    expect(live.status).toBe(200);
    const ready = await app.request("/health/ready");
    expect(ready.status).toBe(200);
  });
});
