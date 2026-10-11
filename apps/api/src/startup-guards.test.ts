import { describe, expect, it } from "vitest";
import { assertSafeProductionEnvironment } from "./startup-guards.js";

describe("startup guards DEV-LOCAL-019", () => {
  it("throws when dev shortcuts enabled in production", () => {
    const prev = process.env.NODE_ENV;
    const prevPay = process.env.KIVRO_DEV_PAYMENT_SHORTCUTS;
    process.env.NODE_ENV = "production";
    process.env.KIVRO_DEV_PAYMENT_SHORTCUTS = "true";
    expect(() => assertSafeProductionEnvironment()).toThrow(/UNSAFE_PRODUCTION_ENV/);
    process.env.NODE_ENV = prev;
    process.env.KIVRO_DEV_PAYMENT_SHORTCUTS = prevPay;
  });

  it("rejects the local research fixture in production", () => {
    const prev = process.env.NODE_ENV;
    const prevUpstream = process.env.KIVRO_PLATFORM_SEARCH_UPSTREAM;
    process.env.NODE_ENV = "production";
    process.env.KIVRO_PLATFORM_SEARCH_UPSTREAM = "local";
    expect(() => assertSafeProductionEnvironment()).toThrow(/KIVRO_PLATFORM_SEARCH_UPSTREAM/);
    process.env.NODE_ENV = prev;
    if (prevUpstream === undefined) {
      delete process.env.KIVRO_PLATFORM_SEARCH_UPSTREAM;
    } else {
      process.env.KIVRO_PLATFORM_SEARCH_UPSTREAM = prevUpstream;
    }
  });
  it("allows development env", () => {
    const prev = process.env.NODE_ENV;
    process.env.NODE_ENV = "development";
    expect(() => assertSafeProductionEnvironment()).not.toThrow();
    process.env.NODE_ENV = prev;
  });
});
