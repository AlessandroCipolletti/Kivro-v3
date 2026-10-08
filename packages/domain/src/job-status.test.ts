import { describe, expect, it } from "vitest";
import { assertJobTransition, InvalidJobTransitionError, isTerminalJobStatus } from "./job-status.js";

describe("job lifecycle", () => {
  it("allows happy path", () => {
    assertJobTransition("CREATED", "PAYMENT_RESERVED");
    assertJobTransition("PAYMENT_RESERVED", "QUEUED");
    assertJobTransition("RUNNING", "UPLOADING_RESULT");
    assertJobTransition("UPLOADING_RESULT", "COMPLETED");
  });

  it("rejects illegal jumps", () => {
    expect(() => assertJobTransition("CREATED", "COMPLETED")).toThrow(InvalidJobTransitionError);
  });

  it("identifies terminal states", () => {
    expect(isTerminalJobStatus("COMPLETED")).toBe(true);
    expect(isTerminalJobStatus("RUNNING")).toBe(false);
  });
});
