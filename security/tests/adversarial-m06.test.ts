import { describe, expect, it } from "vitest";
import { defaultPublicWebResearchPolicy } from "@kivro/contracts";
import {
  ResearchBroker,
  StaticWebSearchProvider,
  isAllowedResearchMethod,
  planConnectorInvocation,
} from "@kivro/research-broker";

const manifest = {
  manifestVersion: 1 as const,
  workerId: "550e8400-e29b-41d4-a716-446655440000",
  capabilityVersionId: "550e8400-e29b-41d4-a716-446655440001",
  runtime: { type: "openclaw" as const, supportedVersionRange: "1.x" },
  skills: [{ name: "demo", contentHash: "sha256:" + "d".repeat(64) }],
  tools: { allow: ["exec"], deny: ["browser"] },
  resources: [{ id: "company-db", type: "database", permissions: ["read"] }],
  network: { default: "deny" as const, allow: [] },
  limits: {
    timeoutSeconds: 120,
    memoryMb: 1024,
    cpu: 1,
    maxPids: 128,
    maxInputBytes: 1024,
    maxOutputBytes: 1024,
  },
  internet: defaultPublicWebResearchPolicy(),
};

describe("M06 adversarial research controls", () => {
  it("rejects buyer-supplied metadata URLs", async () => {
    const broker = new ResearchBroker(new StaticWebSearchProvider(), async () => new Response(""));
    const r = await broker.webFetch({ manifest }, { url: "http://169.254.169.254/" });
    expect(r.allowed).toBe(false);
  });
  it("rejects POST for PUBLIC_WEB_RESEARCH", () => {
    expect(isAllowedResearchMethod("PUBLIC_WEB_RESEARCH", "POST")).toBe(false);
    expect(isAllowedResearchMethod("PUBLIC_WEB_RESEARCH", "GET")).toBe(true);
  });
  it("requires declared connector for side-effecting APIs", () => {
    const planned = planConnectorInvocation(
      [
        {
          id: "public-feed",
          host: "api.ads.example",
          method: "GET",
          pathTemplate: "/feed",
          sideEffect: "READ_ONLY",
          credentialScope: "SELLER",
        },
      ],
      { connectorId: "public-feed", payload: { company: "Acme" } },
    );
    expect(planned.allowed).toBe(true);
    expect(planned.internalMethod).toBe("GET");
  });
});
