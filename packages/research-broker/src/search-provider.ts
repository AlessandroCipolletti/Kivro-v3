/** §241 — pluggable search backend (MVP: one provider behind interface). */
export interface SearchResult {
  title: string;
  url: string;
  snippet?: string;
}

export interface WebSearchProvider {
  search(request: {
    query: string;
    maxResults: number;
    locale?: string;
    freshness?: string;
  }): Promise<SearchResult[]>;
}

/** Deterministic provider for tests and offline verify gates. */
export class StaticWebSearchProvider implements WebSearchProvider {
  constructor(private readonly results: SearchResult[] = []) {}

  search(request: { query: string; maxResults: number }): Promise<SearchResult[]> {
    const q = request.query.toLowerCase();
    const filtered = this.results.filter(
      (r) => r.title.toLowerCase().includes(q) || r.url.toLowerCase().includes(q),
    );
    return Promise.resolve(filtered.slice(0, request.maxResults));
  }
}
