import { describe, expect, it } from "vitest";
import { effectiveFileByteLimit } from "./field-constraints.js";

describe("effective file limit", () => {
  it("lets a seller tighten the platform ceiling and never raise it", () => {
    expect(effectiveFileByteLimit(500, 1000)).toBe(500);
    expect(effectiveFileByteLimit(5000, 1000)).toBe(1000);
    expect(effectiveFileByteLimit(undefined, 1000)).toBe(1000);
  });
});
