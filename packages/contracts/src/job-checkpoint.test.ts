import { describe, expect, it } from "vitest";
import { parseJobCheckpointRecord } from "./job-checkpoint.js";

describe("job checkpoint §435", () => {
  it("parses checkpoint records", () => {
    const cp = parseJobCheckpointRecord({
      type: "JOB_CHECKPOINT",
      protocolVersion: 1,
      jobId: "550e8400-e29b-41d4-a716-446655440000",
      attemptNumber: 1,
      stageLabel: "Research complete",
      checkpointKey: "research",
      recordedAt: "2026-01-01T00:00:00.000Z",
    });
    expect(cp.stageLabel).toBe("Research complete");
  });
});
