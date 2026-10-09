import { describe, expect, it } from "vitest";
import {
  isFakePaymentAdapterEnabled,
  resolveFakePaymentOutcome,
} from "./fake-payment-adapter.js";

describe("fake payment adapter §564", () => {
  it("is disabled outside dev fake mode", () => {
    const prevNode = process.env.NODE_ENV;
    const prevFake = process.env.KIVRO_FAKE_PAYMENT_ADAPTER;
    const prevDev = process.env.KIVRO_DEV_PAYMENT_SHORTCUTS;
    process.env.NODE_ENV = "development";
    process.env.KIVRO_DEV_PAYMENT_SHORTCUTS = "false";
    process.env.KIVRO_FAKE_PAYMENT_ADAPTER = "true";
    expect(isFakePaymentAdapterEnabled()).toBe(false);
    process.env.NODE_ENV = prevNode;
    process.env.KIVRO_FAKE_PAYMENT_ADAPTER = prevFake;
    process.env.KIVRO_DEV_PAYMENT_SHORTCUTS = prevDev;
  });

  it("resolves scripted success when enabled", () => {
    const prevNode = process.env.NODE_ENV;
    const prevFake = process.env.KIVRO_FAKE_PAYMENT_ADAPTER;
    const prevDev = process.env.KIVRO_DEV_PAYMENT_SHORTCUTS;
    const prevMode = process.env.KIVRO_FAKE_PAYMENT_MODE;
    process.env.NODE_ENV = "development";
    process.env.KIVRO_DEV_PAYMENT_SHORTCUTS = "true";
    process.env.KIVRO_FAKE_PAYMENT_ADAPTER = "true";
    process.env.KIVRO_FAKE_PAYMENT_MODE = "success";
    expect(resolveFakePaymentOutcome()).toBe("success");
    process.env.NODE_ENV = prevNode;
    process.env.KIVRO_FAKE_PAYMENT_ADAPTER = prevFake;
    process.env.KIVRO_DEV_PAYMENT_SHORTCUTS = prevDev;
    process.env.KIVRO_FAKE_PAYMENT_MODE = prevMode;
  });
});
