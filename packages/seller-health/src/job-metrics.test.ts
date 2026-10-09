import { describe, expect, it } from "vitest";
import { computeJobMetrics } from "./job-metrics.js";

describe("job metrics §375", () => {
  it("computes failure rate from terminal jobs", () => {
    const now = new Date("2026-01-02T12:00:00Z");
    const metrics = computeJobMetrics(
      [
        {
          status: "COMPLETED",
          createdAt: new Date("2026-01-02T10:00:00Z"),
          startedAt: new Date("2026-01-02T10:01:00Z"),
          completedAt: new Date("2026-01-02T10:05:00Z"),
        },
        {
          status: "FAILED",
          createdAt: new Date("2026-01-02T11:00:00Z"),
          startedAt: new Date("2026-01-02T11:01:00Z"),
          completedAt: new Date("2026-01-02T11:02:00Z"),
        },
      ],
      24,
      now,
    );
    expect(metrics.completedCount).toBe(1);
    expect(metrics.failedCount).toBe(1);
    expect(metrics.failureRate).toBe(0.5);
  });
});
