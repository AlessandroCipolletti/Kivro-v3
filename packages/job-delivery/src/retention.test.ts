import { describe, expect, it } from "vitest";
import {
  computeResultRetentionExpiresAt,
  isResultRetentionExpired,
  jobResultRetentionDays,
} from "./retention.js";

describe("M29 result retention (ASYNC-015/016/018)", () => {
  it("uses env override for retention days", () => {
    expect(jobResultRetentionDays({ KIVRO_JOB_RESULT_RETENTION_DAYS: "30" })).toBe(30);
  });

  it("detects expiry", () => {
    expect(isResultRetentionExpired(new Date(Date.now() - 1000))).toBe(true);
    expect(isResultRetentionExpired(new Date(Date.now() + 86_400_000))).toBe(false);
  });

  it("computes expiresAt from completion time", () => {
    const completed = new Date("2026-01-01T00:00:00Z");
    const expires = computeResultRetentionExpiresAt(completed, { KIVRO_JOB_RESULT_RETENTION_DAYS: "7" });
    expect(expires.toISOString()).toBe("2026-01-08T00:00:00.000Z");
  });
});
