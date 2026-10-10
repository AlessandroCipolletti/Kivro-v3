import { describe, expect, it } from "vitest";
import { platformStorageTelemetry } from "./storage-telemetry.js";

describe("storage telemetry", () => {
  it("tracks bytes without charging the buyer", () => {
    expect(
      platformStorageTelemetry({ inputBytes: 1000, outputBytes: 500, retentionDays: 7 }),
    ).toEqual({
      inputBytes: 1000,
      outputBytes: 500,
      storageByteDays: 10500,
      egressBytes: 0,
      buyerChargeCents: 0,
    });
    expect(
      platformStorageTelemetry({
        inputBytes: 1000,
        outputBytes: 500,
        retentionDays: 7,
        egressBytes: 250,
      }).egressBytes,
    ).toBe(250);
  });
});
