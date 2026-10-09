import { describe, expect, it } from "vitest";
import { validateWebhookUrl } from "./url-validation.js";

describe("webhook SSRF §334", () => {
  it("blocks localhost", () => {
    const r = validateWebhookUrl("http://127.0.0.1/hook");
    expect("error" in r && r.error).toBe("SSRF_BLOCKED_HOST");
  });

  it("allows public https", () => {
    const r = validateWebhookUrl("https://example.com/hook");
    expect("ok" in r && r.ok).toBe(true);
  });
});
