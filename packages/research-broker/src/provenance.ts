import type { ResearchSource } from "@kivro/contracts";

/** §259 — optional research source list for buyer-visible outputs. */
export class ResearchProvenanceCollector {
  private readonly sources: ResearchSource[] = [];

  add(source: ResearchSource): void {
    this.sources.push(source);
  }

  list(): ResearchSource[] {
    return [...this.sources];
  }

  toJsonField(): { sources: ResearchSource[] } {
    return { sources: this.list() };
  }
}
