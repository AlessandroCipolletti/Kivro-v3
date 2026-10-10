import { describe, expect, it } from "vitest";
import { isOpenClawVersionSupported } from "./openclaw-range.js";

describe("OpenClaw adapter range", () => {
  it("accepts in-range version", () => {
    expect(isOpenClawVersionSupported("1.2.3")).toBe(true);
  });

  it("rejects out-of-range high version", () => {
    expect(isOpenClawVersionSupported("99.99.99")).toBe(false);
  });
});
