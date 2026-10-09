import { StatusBadge } from "@/components/ui/StatusBadge";
import type { MarketplaceCapability } from "@/lib/kivro-api";
import { marketplaceAvailabilityUi } from "@/lib/status-ui";
import Link from "next/link";

function formatPrice(cents: number | null, currency: string): string {
  if (cents == null) {
    return "—";
  }
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency || "USD",
  }).format(cents / 100);
}

export function CapabilityCard({ capability }: { capability: MarketplaceCapability }) {
  const avail = marketplaceAvailabilityUi({
    status: capability.availabilityStatus,
    accepting: capability.accepting,
  });
  return (
    <article className="card">
      <div className="meta">by {capability.sellerDisplayName}</div>
      <h2>
        <Link href={`/capabilities/${capability.slug}`}>{capability.name}</Link>
      </h2>
      <p className="meta">{capability.description.slice(0, 160)}</p>
      <div className="meta">
        {capability.rating != null ? `★ ${capability.rating.toFixed(1)}` : "New"} ·{" "}
        {capability.jobCount.toLocaleString()} jobs
      </div>
      <div className="job-list-row" style={{ marginTop: "0.25rem" }}>
        <div>
          <strong>{formatPrice(capability.priceTierCents, capability.currency)}</strong>
          {capability.estimatedDuration != null && (
            <span className="meta"> · ~{Math.round(capability.estimatedDuration / 60)} min</span>
          )}
        </div>
        <StatusBadge label={avail.label} variant={avail.variant} dotLabel={avail.dotLabel} />
      </div>
    </article>
  );
}
