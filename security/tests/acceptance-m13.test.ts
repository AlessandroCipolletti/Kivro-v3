import { describe, expect, it } from "vitest";
import { hashRequestBody } from "@kivro/buyer-api";
import {
  DEFAULT_BUYER_API_SCOPES,
  scopesAllow,
  parseScopes,
} from "@kivro/buyer-api";
import { buildWebhookSignatureHeader, verifyWebhookSignature } from "@kivro/buyer-webhooks";
import { validateWebhookUrl } from "@kivro/buyer-webhooks";

describe("M13 acceptance — API scopes §334", () => {
  it("defaults to read/create job scopes", () => {
    expect(parseScopes(undefined)).toEqual([...DEFAULT_BUYER_API_SCOPES]);
  });

  it("enforces required scope", () => {
    expect(scopesAllow(["jobs:read"], "jobs:create")).toBe(false);
    expect(scopesAllow(["jobs:create", "jobs:read"], "jobs:create")).toBe(true);
  });
});

describe("M13 acceptance — idempotency §336", () => {
  it("hashes request bodies deterministically", () => {
    const a = hashRequestBody({ inputs: { x: 1 } });
    const b = hashRequestBody({ inputs: { x: 1 } });
    const c = hashRequestBody({ inputs: { x: 2 } });
    expect(a).toBe(b);
    expect(a).not.toBe(c);
  });
});

describe("M13 acceptance — webhook SSRF guard §343", () => {
  it("rejects private and metadata URLs", () => {
    expect("ok" in validateWebhookUrl("http://127.0.0.1/hook")).toBe(false);
    expect("ok" in validateWebhookUrl("http://169.254.169.254/")).toBe(false);
    expect("ok" in validateWebhookUrl("https://example.com/webhooks/kivro")).toBe(true);
  });
});

describe("M13 acceptance — webhook signing §344", () => {
  it("round-trips HMAC signature", () => {
    const secret = "whsec_test";
    const body = JSON.stringify({ type: "job.completed" });
    const timestamp = "1700000000";
    const header = buildWebhookSignatureHeader({ secret, timestamp, body });
    expect(
      verifyWebhookSignature({ secret, timestamp, body, signatureHeader: header, now: new Date(1700000000 * 1000) }),
    ).toBe(true);
  });
});
