import type { SearchResult, WebSearchProvider } from "./search-provider.js";

/** §256 / §270 — platform-owned search credential (never exposed to OpenClaw). */
export class PlatformWebSearchProvider implements WebSearchProvider {
  constructor(private readonly apiKey: string | undefined) {}

  search(request: { query: string; maxResults: number }): Promise<SearchResult[]> {
    if (!this.apiKey) {
      return Promise.resolve([]);
    }
    // MVP: provider abstraction wired; live vendor HTTP can be enabled when credentials exist.
    void request;
    return Promise.resolve([]);
  }
}

export function createPlatformWebSearchProvider(): PlatformWebSearchProvider {
  return new PlatformWebSearchProvider(process.env.KIVRO_PLATFORM_SEARCH_API_KEY);
}
