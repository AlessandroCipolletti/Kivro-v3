import { describe, expect, it } from "vitest";
import { hashPassword, normalizeEmail, verifyPassword } from "./crypto.js";

describe("password hashing", () => {
  it("verifies correct password", async () => {
    const hash = await hashPassword("longpassword123");
    expect(await verifyPassword("longpassword123", hash)).toBe(true);
    expect(await verifyPassword("wrong", hash)).toBe(false);
  });
});

describe("normalizeEmail", () => {
  it("lowercases and trims", () => {
    expect(normalizeEmail("  User@Example.COM ")).toBe("user@example.com");
  });
});
