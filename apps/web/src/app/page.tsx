import { CapabilityCard } from "@/components/CapabilityCard";
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
        <p className="meta">No published capabilities yet. Check back after sellers publish.</p>
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
