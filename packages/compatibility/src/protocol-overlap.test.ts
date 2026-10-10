import { describe, expect, it } from "vitest";
import { protocolVersionsCompatibleDuringOverlap } from "./schema-rollout.js";
import { KIVRO_COMPATIBILITY_MATRIX } from "./matrix.js";

describe("compatible protocol overlap during dual control planes", () => {
  it("M25-GOLD-007 active and draining windows overlap on current matrix", () => {
    const min = KIVRO_COMPATIBILITY_MATRIX.workerProtocolMin;
    const max = KIVRO_COMPATIBILITY_MATRIX.workerProtocolMax;
    expect(
      protocolVersionsCompatibleDuringOverlap({
        activeMin: min,
        activeMax: max,
        drainingMin: min,
        drainingMax: max,
      }),
    ).toBe(true);
  });

  it("rejects disjoint protocol windows", () => {
    expect(
      protocolVersionsCompatibleDuringOverlap({
        activeMin: 2,
        activeMax: 2,
        drainingMin: 1,
        drainingMax: 1,
      }),
    ).toBe(false);
  });
});
