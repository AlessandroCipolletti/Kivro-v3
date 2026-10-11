import { describe, expect, it } from "vitest";
import { executePlatformResearchSearch } from "./platform-research-search.js";

describe("platform research search", () => {
  it("rejects a missing token and a private upstream", async () => {
    const denied = await executePlatformResearchSearch({
      presentedToken: undefined,
      expectedToken: "broker-token",
      query: "acme",
      upstreamUrl: "https://search.example/search",
      fetchImpl: async () => new Response("{}", { status: 200 }),
    });
    expect(denied.status).toBe(401);

    const local = await executePlatformResearchSearch({
      presentedToken: "broker-token",
      expectedToken: "broker-token",
      query: "acme",
      upstreamUrl: "https://127.0.0.1/search",
      fetchImpl: async () => {
        throw new Error("fetch should not run");
      },
    });
    expect(local.status).toBe(503);
  });

  it("searches the configured https upstream and does not return the key", async () => {
    let seenKey = "";
    const result = await executePlatformResearchSearch({
      presentedToken: "broker-token",
      expectedToken: "broker-token",
      query: "acme",
      upstreamUrl: "https://search.example/search",
      upstreamKey: "search-key",
      fetchImpl: async (url, init) => {
        expect(String(url)).toBe("https://search.example/search?q=acme");
        seenKey = new Headers(init?.headers).get("authorization") ?? "";
        return new Response(JSON.stringify({ results: [{ title: "Acme", url: "https://acme.example" }] }), {
          status: 200,
        });
      },
    });
    expect(result.status).toBe(200);
    expect(result.results[0]?.title).toBe("Acme");
    expect(JSON.stringify(result)).not.toContain("search-key");
    expect(seenKey).toBe("Bearer search-key");
  });

  it("serves a local fixture only when that mode is allowed", async () => {
    const allowed = await executePlatformResearchSearch({
      presentedToken: "broker-token",
      expectedToken: "broker-token",
      query: "acme",
      upstreamUrl: "local",
      allowLocalFixture: true,
      fetchImpl: async () => {
        throw new Error("fetch should not run");
      },
    });
    expect(allowed.status).toBe(200);
    expect(allowed.results[0]?.url).toBe("https://example.com/research/overview");

    const forbidden = await executePlatformResearchSearch({
      presentedToken: "broker-token",
      expectedToken: "broker-token",
      query: "acme",
      upstreamUrl: "local",
      allowLocalFixture: false,
      fetchImpl: async () => new Response("{}", { status: 200 }),
    });
    expect(forbidden.status).toBe(503);
    expect(forbidden.error).toBe("LOCAL_FIXTURE_FORBIDDEN");
  });
});
