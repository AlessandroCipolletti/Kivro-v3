/** §154 — marketplace taxonomy. Free-typed categories stay searchable; these are canonical. */
export const MARKETPLACE_CATEGORIES = [
  "Research",
  "Data & Analysis",
  "Documents",
  "Development",
  "Media",
  "Business",
  "Other",
] as const;

export type MarketplaceCategory = (typeof MARKETPLACE_CATEGORIES)[number];

export function isMarketplaceCategory(value: string): value is MarketplaceCategory {
  return (MARKETPLACE_CATEGORIES as readonly string[]).includes(value);
}

export function mergeMarketplaceCategories(live: string[]): string[] {
  return [...new Set([...MARKETPLACE_CATEGORIES, ...live.filter((c) => c.trim())])].sort();
}
