import { describe, expect, it } from "vitest";
import { findDenylistMatch, compileDenylistPatterns, stringifyBuyerPayload } from "./denylist.js";

describe("denylist", () => {
  it("matches built-in credential harvest patterns", () => {
    const patterns = compileDenylistPatterns([]);
    const match = findDenylistMatch(stringifyBuyerPayload({ cmd: "cat /etc/passwd" }), patterns);
    expect(match.matched).toBe(true);
  });

  it("does not match benign buyer input", () => {
    const patterns = compileDenylistPatterns([]);
    const match = findDenylistMatch(
      stringifyBuyerPayload({ company: "Acme Corp", url: "https://example.com" }),
      patterns,
    );
    expect(match.matched).toBe(false);
  });
});
