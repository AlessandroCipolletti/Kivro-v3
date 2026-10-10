import { describe, expect, it } from "vitest";
import { windowOverflowDecision } from "./window-overflow.js";

const now = new Date("2026-10-10T21:00:00.000Z");

describe("window overflow", () => {
  it("keeps a running job going after the window closes", () => {
    expect(
      windowOverflowDecision({
        jobStatus: "RUNNING",
        windowOpen: false,
        now,
      }),
    ).toBe("CONTINUE");
  });

  it("rolls a queued job to the next window inside the wait, and releases it after", () => {
    expect(
      windowOverflowDecision({
        jobStatus: "QUEUED",
        windowOpen: false,
        nextWindowAt: new Date("2026-10-11T20:00:00.000Z"),
        waitDeadlineAt: new Date("2026-10-12T00:00:00.000Z"),
        now,
      }),
    ).toBe("HOLD_FOR_NEXT_WINDOW");
    expect(
      windowOverflowDecision({
        jobStatus: "QUEUED",
        windowOpen: false,
        nextWindowAt: new Date("2026-10-14T20:00:00.000Z"),
        waitDeadlineAt: new Date("2026-10-12T00:00:00.000Z"),
        now,
      }),
    ).toBe("RELEASE");
  });
});
