import { describe, expect, it } from "vitest";
import { ManifestProviderBroker } from "./manifest-provider-broker.js";

describe("ManifestProviderBroker", () => {
  it("allows declared provider/model", () => {
    const broker = new ManifestProviderBroker();
    const decision = broker.authorize({
      inference: {
        mode: "REMOTE_PROVIDER",
        provider: "anthropic",
        model: "claude-sonnet",
        credentialRef: "vault:anthropic",
        billingOwner: "SELLER",
      },
      provider: "anthropic",
      model: "claude-sonnet",
    });
    expect(decision.allowed).toBe(true);
  });
  it("denies undeclared provider", () => {
    const broker = new ManifestProviderBroker();
    expect(
      broker.authorize({
        inference: {
          mode: "REMOTE_PROVIDER",
          provider: "anthropic",
          model: "claude-sonnet",
          credentialRef: "vault:anthropic",
          billingOwner: "SELLER",
        },
        provider: "openai",
        model: "gpt-4",
      }).allowed,
    ).toBe(false);
  });
});
