import { CapabilityCard } from "@/components/CapabilityCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { RecentlyUsed } from "@/components/RecentlyUsed";
import { fetchMarketplaceCapabilities } from "@/lib/kivro-api";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function DiscoverPage() {
  let capabilities: Awaited<ReturnType<typeof fetchMarketplaceCapabilities>>["capabilities"] = [];
  try {
    ({ capabilities } = await fetchMarketplaceCapabilities({ sort: "most_used" }));
  } catch {
    capabilities = [];
  }

  return (
    <>
      <section className="detail-hero">
        <h1>Discover capabilities</h1>
        <p className="meta">
          Paid, sandboxed jobs from OpenClaw sellers — browse, compare availability, and run when
          ready.
        </p>
        <Link className="button secondary" href="/search">
          Search marketplace
        </Link>
      </section>
      {capabilities.length === 0 ? (
        <EmptyState
          title="No published capabilities"
          description="When sellers publish from OpenClaw, they will appear here with live availability."
          action={{ href: "/search", label: "Search marketplace" }}
        />
      ) : (
        <div className="grid">
          {capabilities.map((cap) => (
            <CapabilityCard key={cap.id} capability={cap} />
          ))}
        </div>
      )}
      <RecentlyUsed />
    </>
  );
}
