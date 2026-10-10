import { describe, expect, it } from "vitest";
import {
  candidateRespectsHardConstraints,
  scheduledCapabilityDisclosure,
  timingConflictWhenConstraintsLeaveOnlyLater,
} from "./scheduled-disclosure.js";

describe("scheduled disclosure and hard constraints", () => {
  it("says a future service is not available now and gives the runtime after eligibility", () => {
    const text = scheduledCapabilityDisclosure({ nextEligibleAt: "20:00", durationMinutes: 20 });
    expect(text).toContain("not available now");
    expect(text).toContain("20:00");
    expect(text).toContain("~20 minutes");
  });

  it("rejects an available service that breaks a hard constraint", () => {
    expect(
      candidateRespectsHardConstraints({ buyerForbidsInternet: true, capabilityUsesInternet: true }),
    ).toBe("REJECT_CONSTRAINT");
    expect(
      candidateRespectsHardConstraints({ buyerForbidsInternet: true, capabilityUsesInternet: false }),
    ).toBe("ACCEPT");
    expect(
      timingConflictWhenConstraintsLeaveOnlyLater({ validImmediateCount: 0, validLaterCount: 1 }),
    ).toContain("cannot run now");
  });
});
