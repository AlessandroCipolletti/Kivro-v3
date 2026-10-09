import { describe, expect, it } from "vitest";
import { hashRequestBody } from "./idempotency.js";

describe("idempotency §325", () => {
  it("hashes request bodies deterministically", () => {
    expect(hashRequestBody({ a: 1 })).toBe(hashRequestBody({ a: 1 }));
    expect(hashRequestBody({ a: 1 })).not.toBe(hashRequestBody({ a: 2 }));
  });
});
