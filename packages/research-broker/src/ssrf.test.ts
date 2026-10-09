import { describe, expect, it } from "vitest";
import { validateResearchUrl } from "./ssrf.js";

describe("validateResearchUrl", () => {
  it("blocks localhost and metadata", () => {
    expect(validateResearchUrl("http://127.0.0.1/").ok).toBe(false);
    expect(validateResearchUrl("http://169.254.169.254/latest/meta-data").ok).toBe(false);
    expect(validateResearchUrl("http://192.168.0.1/").ok).toBe(false);
  });
  it("blocks credentials in url", () => {
    expect(validateResearchUrl("https://user:pass@example.com").ok).toBe(false);
  });
  it("allows public https", () => {
    expect(validateResearchUrl("https://example.com/product").ok).toBe(true);
  });
});
