import { describe, expect, it } from "vitest";
import { describeResultRetentionUx } from "./retention-ux.js";

describe("describeResultRetentionUx (BUYERUX-032)", () => {
  it("disables download when retention expired", () => {
    const past = new Date(Date.now() - 86_400_000);
    const ux = describeResultRetentionUx({ resultRetentionExpiresAt: past, now: new Date() });
    expect(ux.expired).toBe(true);
    expect(ux.downloadAllowed).toBe(false);
  });
});
