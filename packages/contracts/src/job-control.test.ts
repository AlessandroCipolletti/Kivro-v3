import { describe, expect, it } from "vitest";
import { parseJobPauseAck, parseJobPauseRequest } from "./job-control.js";

describe("job control protocol", () => {
  it("parses pause request/ack", () => {
    const req = parseJobPauseRequest({
      type: "JOB_PAUSE_REQUEST",
      protocolVersion: 1,
      jobId: "550e8400-e29b-41d4-a716-446655440000",
      commandId: "550e8400-e29b-41d4-a716-446655440001",
      requestedAt: "2026-01-01T00:00:00.000Z",
      source: "WEB",
    });
    expect(req.type).toBe("JOB_PAUSE_REQUEST");
    const ack = parseJobPauseAck({
      type: "JOB_PAUSE_ACK",
      protocolVersion: 1,
      jobId: req.jobId,
      commandId: req.commandId,
      acknowledgedAt: "2026-01-01T00:00:01.000Z",
      localState: "PAUSED",
    });
    expect(ack.localState).toBe("PAUSED");
  });
});
