import { describe, expect, it } from "vitest";
import { buildCloudCredentialRefs } from "./credential-ref-metadata.js";

describe("credential ref metadata SELLERUX-010", () => {
  it("marks refs stale after threshold", () => {
    const now = new Date("2026-04-10T12:00:00Z");
    const refs = buildCloudCredentialRefs({
      now,
      staleAfterMs: 86_400_000,
      refs: [
        {
          refId: "openai",
          provider: "openai",
          lastVerifiedAt: "2026-04-08T12:00:00Z",
        },
      ],
    });
    expect(refs[0]?.status).toBe("STALE");
  });

  it("never includes secret values", () => {
    const refs = buildCloudCredentialRefs({
      refs: [{ refId: "x", provider: "p", lastVerifiedAt: new Date().toISOString() }],
    });
    expect(JSON.stringify(refs)).not.toMatch(/sk-/);
  });
});
