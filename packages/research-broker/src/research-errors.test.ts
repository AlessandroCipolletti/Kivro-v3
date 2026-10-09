import { describe, expect, it } from "vitest";
import { ResearchBroker, StaticWebSearchProvider } from "./index.js";
import { defaultPublicWebResearchPolicy } from "@kivro/contracts";

describe("typed research policy errors §273", () => {
  it("returns DESTINATION_BLOCKED for SSRF url", async () => {
    const manifest = {
      manifestVersion: 1 as const,
      workerId: "550e8400-e29b-41d4-a716-446655440000",
      capabilityVersionId: "550e8400-e29b-41d4-a716-446655440001",
      runtime: { type: "openclaw" as const, supportedVersionRange: "1.x" },
      skills: [],
      tools: { allow: [], deny: ["browser"] },
      resources: [],
      network: { default: "deny" as const, allow: [] },
      limits: {
        timeoutSeconds: 120,
        memoryMb: 1024,
        cpu: 1,
        maxPids: 128,
        maxInputBytes: 0,
        maxOutputBytes: 0,
      },
      internet: defaultPublicWebResearchPolicy(),
    };
    const broker = new ResearchBroker(new StaticWebSearchProvider(), () =>
      Promise.resolve(new Response("")),
    );
    const result = await broker.webFetch({ manifest }, { url: "http://127.0.0.1/" });
    expect(result.allowed).toBe(false);
    expect(result.error?.code).toBe("DESTINATION_BLOCKED");
  });
});
