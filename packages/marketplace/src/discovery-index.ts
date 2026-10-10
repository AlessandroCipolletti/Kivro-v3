/** §155 — PostgreSQL plus optional reranking. No separate search cluster. */
export const DISCOVERY_INDEX_BACKEND = "postgresql" as const;

const PRIVATE_MARKERS = [/sk-[a-z0-9]/i, /api[_-]?key/i, /begin private key/i, /192\.168\./];

export type DiscoveryIndexEntry = {
  name: string;
  description: string;
  category: string;
  tags: string[];
  accepts: string[];
  outputs: string[];
  examples: string[];
  strengths: string[];
  limitations: string[];
};

/** Public fields only. Private instructions and secrets are not indexed. */
export function semanticDiscoveryIndexEntry(input: {
  name: string;
  description: string;
  category: string;
  tags?: string[];
  accepts?: string[];
  outputs?: string[];
  examples?: string[];
  strengths?: string[];
  limitations?: string[];
  privateInstructions?: string;
  secret?: string;
}): DiscoveryIndexEntry {
  const entry: DiscoveryIndexEntry = {
    name: input.name,
    description: input.description,
    category: input.category,
    tags: input.tags ?? [],
    accepts: input.accepts ?? [],
    outputs: input.outputs ?? [],
    examples: (input.examples ?? []).slice(0, 3),
    strengths: input.strengths ?? [],
    limitations: input.limitations ?? [],
  };
  const serialized = JSON.stringify(entry);
  if (PRIVATE_MARKERS.some((marker) => marker.test(serialized))) {
    return { ...entry, description: "", strengths: [], limitations: [] };
  }
  return entry;
}
