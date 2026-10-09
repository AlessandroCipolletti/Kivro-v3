import { describe, expect, it } from "vitest";
import {
  assertJobTransition,
  InvalidJobTransitionError,
  isPauseControlStatus,
  isPausableExecutionStatus,
  isTerminalJobStatus,
} from "./job-status.js";

describe("job lifecycle", () => {
  it("allows happy path", () => {
    assertJobTransition("CREATED", "PAYMENT_RESERVED");
    assertJobTransition("PAYMENT_RESERVED", "QUEUED");
    assertJobTransition("PAYMENT_RESERVED", "SCHEDULED");
    assertJobTransition("SCHEDULED", "QUEUED");
    assertJobTransition("RUNNING", "UPLOADING_RESULT");
    assertJobTransition("UPLOADING_RESULT", "COMPLETED");
  });

  it("allows pause control path §445", () => {
    assertJobTransition("RUNNING", "PAUSE_REQUESTED");
    assertJobTransition("PAUSE_REQUESTED", "PAUSED");
    assertJobTransition("PAUSED", "RESUME_REQUESTED");
    assertJobTransition("RESUME_REQUESTED", "RUNNING");
  });

  it("rejects illegal jumps", () => {
    expect(() => assertJobTransition("CREATED", "COMPLETED")).toThrow(InvalidJobTransitionError);
    expect(() => assertJobTransition("PAUSED", "COMPLETED")).toThrow(InvalidJobTransitionError);
  });

  it("identifies terminal states", () => {
    expect(isTerminalJobStatus("COMPLETED")).toBe(true);
    expect(isTerminalJobStatus("RUNNING")).toBe(false);
    expect(isPauseControlStatus("PAUSED")).toBe(true);
    expect(isPausableExecutionStatus("UPLOADING_RESULT")).toBe(true);
  });
});
