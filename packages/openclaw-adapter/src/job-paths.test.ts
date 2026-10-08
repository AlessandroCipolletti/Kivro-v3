import { describe, expect, it } from "vitest";
import { jobAttemptPaths, safeInputAssetPath } from "./job-paths.js";

describe("jobAttemptPaths", () => {
  it("builds canonical layout", () => {
    const p = jobAttemptPaths("/runtime", "job-1", "attempt-1");
    expect(p.input).toContain("input");
    expect(p.output).toContain("output");
  });
});

describe("safeInputAssetPath", () => {
  it("rejects traversal", () => {
    expect(() => safeInputAssetPath("/tmp/in", "../etc/passwd")).toThrow();
  });
});
