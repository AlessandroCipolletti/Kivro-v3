import { describe, expect, it } from "vitest";
import { allAvailabilityLayersPass, describeAvailabilityLayers } from "./availability-layers.js";

describe("availability layers", () => {
  it("requires every layer before a paid job is accepted", () => {
    const open = describeAvailabilityLayers({ visibleToBuyer: true, reasons: [] });
    expect(allAvailabilityLayersPass(open)).toBe(true);
    const paused = describeAvailabilityLayers({ visibleToBuyer: true, reasons: ["EMERGENCY_PAUSE"] });
    expect(paused.find((layer) => layer.layer === "OPERATOR_CONTROL")?.passed).toBe(false);
    expect(allAvailabilityLayersPass(paused)).toBe(false);
  });
});
