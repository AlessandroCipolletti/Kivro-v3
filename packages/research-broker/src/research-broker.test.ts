import { describe, expect, it } from "vitest";
import { defaultPublicWebResearchPolicy } from "@kivro/contracts";
import { ResearchBroker } from "./research-broker.js";
import { StaticWebSearchProvider } from "./search-provider.js";
import type { FetchImpl } from "./safe-fetch.js";

const manifest = {
  manifestVersion: 1 as const,
  workerId: "550e8400-e29b-41d4-a716-446655440000",
  capabilityVersionId: "550e8400-e29b-41d4-a716-446655440001",
  runtime: { type: "openclaw" as const, supportedVersionRange: "1.x" },
  skills: [{ name: "company-research", contentHash: "sha256:" + "c".repeat(64) }],
  tools: { allow: ["exec"], deny: ["browser"] },
  resources: [],
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

describe("ResearchBroker", () => {
  it("allows search under PUBLIC_WEB_RESEARCH", async () => {
    const broker = new ResearchBroker(
      new StaticWebSearchProvider([{ title: "Acme Corp", url: "https://acme.example" }]),
      notUsedFetch,
    );
    const audit: [] = [];
    const result = await broker.webSearch(
      { manifest, auditLog: audit },
      { query: "Acme", maxResults: 5 },
    );
    expect(result.allowed).toBe(true);
    expect(result.data?.length).toBe(1);
    expect(audit).toHaveLength(1);
  });

  it("blocks SSRF targets on fetch", async () => {
    const broker = new ResearchBroker(new StaticWebSearchProvider(), notUsedFetch);
    const result = await broker.webFetch({ manifest }, { url: "http://127.0.0.1/admin" });
    expect(result.allowed).toBe(false);
    expect(result.reason).toMatch(/blocked/i);
  });

  it("fetches readable text with bounded mock response", async () => {
    const fetchImpl: FetchImpl = () =>
      Promise.resolve(
        new Response("public facts", {
          status: 200,
          headers: { "content-type": "text/plain" },
        }),
      );
    const broker = new ResearchBroker(new StaticWebSearchProvider(), fetchImpl);
    const result = await broker.webFetch({ manifest }, { url: "https://example.com/page" });
    expect(result.allowed).toBe(true);
    expect(result.data?.bodyText).toBe("public facts");
    expect(result.data?.source.url).toContain("example.com");
  });
});

const notUsedFetch: FetchImpl = () => Promise.reject(new Error("fetch should not be called"));
