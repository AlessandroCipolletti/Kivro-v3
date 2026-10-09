import { describe, expect, it } from "vitest";
import { buildWebhookSignatureHeader, verifyWebhookSignature } from "./signing.js";

describe("webhook signing §331", () => {
  it("verifies valid signature", () => {
    const body = '{"type":"job.completed"}';
    const timestamp = "1700000000";
    const secret = "whsec_test";
    const header = buildWebhookSignatureHeader({ secret, timestamp, body });
    expect(
      verifyWebhookSignature({
        secret,
        timestamp,
        body,
        signatureHeader: header,
        now: new Date(1700000000 * 1000),
      }),
    ).toBe(true);
  });
});
