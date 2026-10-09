import { describe, expect, it } from "vitest";
import { hashToken } from "./crypto.js";
import { resendEmailVerification, verifyEmailToken } from "./email-auth.js";

describe("email-auth resend", () => {
  it("returns ACCEPTED for unknown email", async () => {
    const db = {
      user: { findUnique: async () => null },
    } as never;
    const result = await resendEmailVerification(db, "missing@example.com");
    expect(result.status).toBe("ACCEPTED");
  });
});

describe("verifyEmailToken", () => {
  it("rejects empty lookup", async () => {
    const db = {
      emailVerificationToken: { findUnique: async () => null },
    } as never;
    const result = await verifyEmailToken(db, "bad-token");
    expect(result).toEqual({ ok: false, code: "INVALID_OR_EXPIRED_TOKEN" });
  });

  it("hashes token for lookup", () => {
    expect(hashToken("abc")).toMatch(/^[a-f0-9]+$/);
  });
});
