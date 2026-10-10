import { describe, expect, it } from "vitest";
import { agentInteractionMode, partitionHumanListings } from "./human-availability.js";

describe("human and agent availability modes", () => {
  it("keeps a later service visible beside one that can run now", () => {
    const groups = partitionHumanListings([
      { name: "now", availabilityStatus: "ONLINE", accepting: true },
      { name: "later", availabilityStatus: "SCHEDULED_OFFLINE", nextAvailableAt: "2026-10-10T20:00:00.000Z" },
      { name: "offline", availabilityStatus: "OFFLINE", nextAvailableAt: null },
    ]);
    expect(groups.availableNow.map((row) => row.name)).toEqual(["now"]);
    expect(groups.availableLater.map((row) => row.name)).toEqual(["later"]);
    expect(groups.unavailable.map((row) => row.name)).toEqual(["offline"]);
  });

  it("treats a recommendation differently from an execution request", () => {
    expect(agentInteractionMode("Which service is best for research?")).toBe("RECOMMENDATION");
    expect(agentInteractionMode("Do this research for me")).toBe("EXECUTION");
    expect(agentInteractionMode("Which service is best? Buy it for me")).toBe("EXECUTION");
  });
});
