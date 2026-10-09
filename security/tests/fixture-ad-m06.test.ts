import { describe, expect, it } from "vitest";
import { defaultPublicWebResearchPolicy } from "@kivro/contracts";
import { ManifestResourceBroker } from "@kivro/resource-broker";
import {
  ResearchBroker,
  ResearchProvenanceCollector,
  StaticWebSearchProvider,
} from "@kivro/research-broker";

/** §260 / §261 — public research + private resource brokers stay separate. */
describe("competitive video ad fixture", () => {
  const manifest = {
    manifestVersion: 1 as const,
    workerId: "550e8400-e29b-41d4-a716-446655440000",
    capabilityVersionId: "550e8400-e29b-41d4-a716-446655440001",
    runtime: { type: "openclaw" as const, supportedVersionRange: "1.x" },
    skills: [{ name: "video-ad-generator", contentHash: "sha256:" + "f".repeat(64) }],
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

  it("uses research broker for public web and resource broker for private db", async () => {
    const provenance = new ResearchProvenanceCollector();
    const broker = new ResearchBroker(
      new StaticWebSearchProvider([{ title: "Acme ads", url: "https://acme.example/ads" }]),
      () =>
        Promise.resolve(
          new Response("<html><script>evil()</script><p>Brand facts</p></html>", {
            headers: { "content-type": "text/html" },
          }),
        ),
      () => Promise.resolve(["93.184.216.34"]),
    );
    const search = await broker.webSearch({ manifest, provenance }, { query: "Acme competitors" });
    const fetch = await broker.webFetch({ manifest, provenance }, { url: "https://acme.example/ads" });
    const resource = new ManifestResourceBroker().authorize({
      manifest,
      resourceId: "company-db",
      operation: "read",
    });
    expect(search.allowed).toBe(true);
    expect(fetch.allowed).toBe(true);
    expect(fetch.data?.page?.text).toContain("Brand facts");
    expect(fetch.data?.page?.text).not.toContain("evil");
    expect(resource.allowed).toBe(true);
    expect(provenance.list().length).toBe(1);
  });
});
