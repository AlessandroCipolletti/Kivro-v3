import { describe, expect, it } from "vitest";
import { webhookEventForJobStatus } from "./job-events.js";

describe("webhookEventForJobStatus §328", () => {
  it("maps lifecycle statuses", () => {
    expect(webhookEventForJobStatus("RUNNING")).toBe("job.started");
    expect(webhookEventForJobStatus("COMPLETED")).toBe("job.completed");
    expect(webhookEventForJobStatus("CANCELLED")).toBe("job.cancelled");
    expect(webhookEventForJobStatus("FAILED_EXECUTION")).toBe("job.failed");
    expect(webhookEventForJobStatus("QUEUED")).toBe(null);
  });
});
