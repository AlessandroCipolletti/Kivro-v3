import Link from "next/link";
import type { MarketplaceCapability } from "@/lib/kivro-api";

function formatPrice(cents: number | null, currency: string): string {
  if (cents == null) {
    return "—";
  }
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency || "USD",
  }).format(cents / 100);
}

function availabilityLabel(status?: string): string {
  switch (status) {
    case "ONLINE":
      return "Online";
    case "BUSY":
      return "Busy";
    case "SCHEDULED_OFFLINE":
      return "Scheduled offline";
    case "OFFLINE":
      return "Offline";
    case "PAUSED":
      return "Paused";
    default:
      return "Unknown";
  }
}

export function CapabilityCard({ capability }: { capability: MarketplaceCapability }) {
  const offline = capability.availabilityStatus !== "ONLINE" || !capability.accepting;
  return (
    <article className="card">
      <div className="meta">by {capability.sellerDisplayName}</div>
      <h2>
        <Link href={`/capabilities/${capability.slug}`}>{capability.name}</Link>
      </h2>
      <p className="meta">{capability.description.slice(0, 140)}</p>
      <div className="meta">
        {capability.rating != null ? `★ ${capability.rating.toFixed(1)}` : "New"} ·{" "}
        {capability.jobCount.toLocaleString()} jobs
      </div>
      <div>
        <strong>{formatPrice(capability.priceTierCents, capability.currency)}</strong>
        {capability.estimatedDuration != null && (
          <span className="meta"> · ~{Math.round(capability.estimatedDuration / 60)} min</span>
        )}
      </div>
      <span className={`badge ${offline ? "offline" : ""}`}>
        {availabilityLabel(capability.availabilityStatus)}
      </span>
    </article>
  );
}
