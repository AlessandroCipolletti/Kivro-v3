import { timingSafeEqual } from "node:crypto";
import type { FetchImpl } from "./safe-fetch.js";
import type { SearchResult } from "./search-provider.js";
import { validateResearchUrl } from "./ssrf.js";

function tokenMatches(presented: string | undefined, expected: string | undefined): boolean {
  if (!presented || !expected) {
    return false;
  }
  const left = Buffer.from(presented);
  const right = Buffer.from(expected);
  if (left.length !== right.length) {
    return false;
  }
  return timingSafeEqual(left, right);
}

export async function executePlatformResearchSearch(input: {
  presentedToken: string | undefined;
  expectedToken: string | undefined;
  query: string;
  upstreamUrl?: string;
  upstreamKey?: string;
  allowLocalFixture?: boolean;
  fetchImpl: FetchImpl;
}): Promise<{ status: 200 | 400 | 401 | 502 | 503; results: SearchResult[]; error?: string }> {
  if (!tokenMatches(input.presentedToken, input.expectedToken)) {
    return { status: 401, results: [], error: "UNAUTHORIZED" };
  }
  const query = input.query.trim();
  if (!query) {
    return { status: 400, results: [], error: "QUERY_REQUIRED" };
  }
  const upstream = input.upstreamUrl?.trim();
  if (upstream === "local") {
    if (!input.allowLocalFixture) {
      return { status: 503, results: [], error: "LOCAL_FIXTURE_FORBIDDEN" };
    }
    return { status: 200, results: localResearchFixture(query) };
  }
  if (!upstream) {
    return { status: 503, results: [], error: "SEARCH_UPSTREAM_UNCONFIGURED" };
  }
  const destination = validateResearchUrl(upstream);
  if (!destination.ok || !upstream.startsWith("https://")) {
    return { status: 503, results: [], error: destination.reason ?? "upstream rejected" };
  }
  const url = new URL(upstream);
  url.searchParams.set("q", query);
  const response = await input.fetchImpl(url.toString(), {
    method: "GET",
    headers: input.upstreamKey ? { authorization: `Bearer ${input.upstreamKey}` } : {},
  });
  if (!response.ok) {
    return { status: 502, results: [], error: "UPSTREAM_FAILED" };
  }
  const body = (await response.json()) as { results?: SearchResult[] };
  return { status: 200, results: body.results ?? [] };
}

function localResearchFixture(query: string): SearchResult[] {
  return [
    {
      title: `${query} overview`,
      url: "https://example.com/research/overview",
      snippet: "Local development fixture. No upstream was contacted.",
    },
  ];
}
