import { describe, expect, it } from "vitest";
import { shouldFailClosedOnSandboxInit } from "./invariants.js";

describe("failure invariants §36", () => {
  it("fails closed when sandbox is unavailable", () => {
    expect(shouldFailClosedOnSandboxInit(false)).toBe(true);
    expect(shouldFailClosedOnSandboxInit(true)).toBe(false);
  });
});
