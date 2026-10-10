import { CapabilityCard } from "@/components/CapabilityCard";
import type { MarketplaceCapability } from "@/lib/kivro-api";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageHeader } from "@/components/ui/PageHeader";
import { fetchMarketplaceCapabilities } from "@/lib/kivro-api";

export const dynamic = "force-dynamic";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function SearchPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const q = typeof params.q === "string" ? params.q : "";
  const category = typeof params.category === "string" ? params.category : "";
  const sort = typeof params.sort === "string" ? params.sort : "relevance";
  const onlineOnly = params.onlineOnly === "true" ? "true" : "";
  const availability =
    params.availability === "now" ||
    params.availability === "today" ||
    params.availability === "schedulable"
      ? params.availability
      : onlineOnly === "true"
        ? "now"
        : "any";
  const minRating = typeof params.minRating === "string" ? params.minRating : "";
  const minPriceCents = typeof params.minPrice === "string" ? params.minPrice : "";
  const maxPriceCents = typeof params.maxPrice === "string" ? params.maxPrice : "";

  const { capabilities, groups, meta } = await fetchMarketplaceCapabilities({
    q,
    category,
    sort,
    onlineOnly: availability === "now" ? "true" : "",
    availability: availability === "any" ? "" : availability,
    minRating,
    minPriceCents: minPriceCents ? String(Math.round(Number(minPriceCents) * 100)) : "",
    maxPriceCents: maxPriceCents ? String(Math.round(Number(maxPriceCents) * 100)) : "",
  });

  return (
    <>
      <PageHeader
        title="Search"
        description="Filter by category, price, rating, and online availability."
      />
      <form className="filter-panel" action="/search" method="get">
        <div className="filter-grid">
          <div className="form-field filter-search">
            <label className="field-label" htmlFor="search-q">
              Search
            </label>
            <input
              id="search-q"
              name="q"
              type="search"
              placeholder="Name, description, seller…"
              defaultValue={q}
            />
          </div>
          <div className="form-field">
            <label className="field-label" htmlFor="search-category">
              Category
            </label>
            <select id="search-category" name="category" defaultValue={category}>
              <option value="">All categories</option>
              {meta.categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
          <div className="form-field">
            <label className="field-label" htmlFor="search-sort">
              Sort
            </label>
            <select id="search-sort" name="sort" defaultValue={sort}>
              <option value="relevance">Relevance</option>
              <option value="rating">Rating</option>
              <option value="most_used">Most used</option>
              <option value="price_asc">Price ↑</option>
              <option value="price_desc">Price ↓</option>
              <option value="fastest">Fastest</option>
            </select>
          </div>
          <div className="form-field">
            <label className="field-label" htmlFor="search-min-rating">
              Min rating
            </label>
            <input
              id="search-min-rating"
              name="minRating"
              type="number"
              step="0.1"
              min="0"
              max="5"
              placeholder="e.g. 4.5"
              defaultValue={minRating}
            />
          </div>
          <div className="form-field">
            <label className="field-label" htmlFor="search-min-price">
              Min price ($)
            </label>
            <input
              id="search-min-price"
              name="minPrice"
              type="number"
              step="0.01"
              min="0"
              placeholder="0"
              defaultValue={minPriceCents}
            />
          </div>
          <div className="form-field">
            <label className="field-label" htmlFor="search-max-price">
              Max price ($)
            </label>
            <input
              id="search-max-price"
              name="maxPrice"
              type="number"
              step="0.01"
              min="0"
              placeholder="Any"
              defaultValue={maxPriceCents}
            />
          </div>
          <div className="form-field">
            <label className="field-label" htmlFor="search-availability">
              Availability
            </label>
            <select id="search-availability" name="availability" defaultValue={availability}>
              <option value="any">Any</option>
              <option value="now">Available now</option>
              <option value="today">Available today</option>
              <option value="schedulable">Schedulable</option>
            </select>
          </div>
          <div className="filter-actions">
            <button className="button" type="submit">
              Apply filters
            </button>
          </div>
        </div>
      </form>
      <p className="meta">{capabilities.length} results</p>
      {capabilities.length === 0 ? (
        <EmptyState
          title="No matching capabilities"
          description="Try a broader search term or remove filters."
          action={{ href: "/search", label: "Clear filters" }}
        />
      ) : (
        <SearchGroups capabilities={capabilities} groups={groups} showComparison={availability === "any"} />
      )}
    </>
  );
}

function SearchGroups({
  capabilities,
  groups,
  showComparison,
}: {
  capabilities: MarketplaceCapability[];
  groups?: { availableNow: string[]; availableLater: string[] };
  showComparison: boolean;
}) {
  const now = new Set(groups?.availableNow ?? []);
  const later = new Set(groups?.availableLater ?? []);
  const availableNow = capabilities.filter((cap) => now.has(cap.id));
  const availableLater = capabilities.filter((cap) => later.has(cap.id));
  if (!showComparison || (availableNow.length === 0 && availableLater.length === 0)) {
    return (
      <div className="grid">
        {capabilities.map((cap) => (
          <CapabilityCard key={cap.id} capability={cap} />
        ))}
      </div>
    );
  }
  const rest = capabilities.filter((cap) => !now.has(cap.id) && !later.has(cap.id));
  return (
    <>
      {availableNow.length > 0 && (
        <section>
          <h2 className="text-lg font-medium">Available now</h2>
          <div className="grid">
            {availableNow.map((cap) => (
              <CapabilityCard key={cap.id} capability={cap} />
            ))}
          </div>
        </section>
      )}
      {availableLater.length > 0 && (
        <section style={{ marginTop: "1.5rem" }}>
          <h2 className="text-lg font-medium">Available later</h2>
          <div className="grid">
            {availableLater.map((cap) => (
              <CapabilityCard key={cap.id} capability={cap} />
            ))}
          </div>
        </section>
      )}
      {rest.length > 0 && (
        <section style={{ marginTop: "1.5rem" }}>
          <h2 className="text-lg font-medium">Not currently schedulable</h2>
          <div className="grid">
            {rest.map((cap) => (
              <CapabilityCard key={cap.id} capability={cap} />
            ))}
          </div>
        </section>
      )}
    </>
  );
}
