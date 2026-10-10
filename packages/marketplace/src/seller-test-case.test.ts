import { describe, expect, it } from "vitest";
import { validateSellerTestCase, MAX_SELLER_TEST_CASES } from "./seller-test-case.js";

describe("validateSellerTestCase", () => {
  it("accepts a named object input and rejects empty or non-object input", () => {
    expect(validateSellerTestCase({ name: "happy path", inputValues: { q: "a" } })).toBe("ok");
    expect(validateSellerTestCase({ name: "  ", inputValues: { q: "a" } })).toBe("INVALID_TEST_CASE");
    expect(validateSellerTestCase({ name: "x", inputValues: [] })).toBe("INVALID_TEST_CASE");
    expect(MAX_SELLER_TEST_CASES).toBe(10);
  });
});
