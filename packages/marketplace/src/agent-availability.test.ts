import { describe, expect, it } from "vitest";
import {
  noImmediateServiceMessage,
  preferImmediateCandidate,
  queueWaitFitsImmediatePolicy,
  toAgentAvailability,
} from "./agent-availability.js";

describe("agent availability", () => {
  it("publishes structured timing and not a prose guess", () => {
    const doc = toAgentAvailability({
      id: "cap_123",
      priceTierCents: 999,
      availabilityStatus: "SCHEDULED_OFFLINE",
      accepting: false,
      nextAvailableAt: "2026-10-10T20:00:00.000Z",
    });
    expect(doc.availability.acceptingImmediateJobs).toBe(false);
    expect(doc.availability.nextEligibleAt).toBe("2026-10-10T20:00:00.000Z");
    expect(JSON.stringify(doc)).not.toContain("description");
  });

  it("accepts a five-minute queue and rejects an eight-hour wait", () => {
    expect(queueWaitFitsImmediatePolicy(5 * 60)).toBe(true);
    expect(queueWaitFitsImmediatePolicy(8 * 60 * 60)).toBe(false);
    expect(queueWaitFitsImmediatePolicy(null)).toBe(false);
  });

  it("picks the service that can run now over a higher-rated later one", () => {
    const chosen = preferImmediateCandidate([
      { name: "later", rating: 5, availabilityStatus: "SCHEDULED_OFFLINE", accepting: false },
      { name: "now", rating: 4.9, availabilityStatus: "ONLINE", accepting: true },
    ]);
    expect(chosen?.name).toBe("now");
  });

  it("offers a future option without scheduling it", () => {
    const message = noImmediateServiceMessage({
      name: "Renderer",
      nextAvailableAt: "2026-10-10T20:00:00.000Z",
      priceCents: 1999,
    });
    expect(message).toContain("couldn't find");
    expect(message).toContain("$19.99");
    expect(message.toLowerCase()).not.toContain("scheduled your");
  });
});
