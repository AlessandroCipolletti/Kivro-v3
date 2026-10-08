import { describe, expect, it } from "vitest";
import { parseInferenceDependency } from "./inference-dependency.js";

describe("parseInferenceDependency", () => {
  it("accepts remote provider", () => {
    const d = parseInferenceDependency({
      mode: "REMOTE_PROVIDER",
      provider: "anthropic",
      model: "claude",
      credentialRef: "marketplace-worker",
      billingOwner: "SELLER",
    });
    expect(d.mode).toBe("REMOTE_PROVIDER");
  });
});
