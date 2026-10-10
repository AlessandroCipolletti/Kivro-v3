import { AbuseReportForm } from "@/components/AbuseReportForm";
import { FavoriteButton } from "@/components/FavoriteButton";
import { StatusBadge } from "@/components/ui/StatusBadge";
import Link from "next/link";
import { fetchAvailability, fetchCapabilityDetail, fetchCapabilityReviews } from "@/lib/kivro-api";
import { marketplaceAvailabilityUi } from "@/lib/status-ui";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

type Params = Promise<{ slug: string }>;

function formatPrice(cents: number | null | undefined, currency: string): string {
  if (cents == null) {
    return "—";
  }
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency || "USD",
  }).format(cents / 100);
}

export default async function CapabilityDetailPage({ params }: { params: Params }) {
  const { slug } = await params;
  const detail = await fetchCapabilityDetail(slug);
  if (!detail?.capability) {
    notFound();
  }
  const availability = await fetchAvailability(slug);
  const reviews = await fetchCapabilityReviews(slug);
  const cap = detail.capability;
  const seller = detail.seller;
  const accepting = availability?.accepting === true;
  const priceCents = cap.priceTierCents ?? cap.currentVersion?.priceSnapshotCents;
  const availUi = marketplaceAvailabilityUi({
    status: availability?.status,
    accepting: availability?.accepting,
  });
  const sellerReliability =
    detail && "sellerReliability" in detail && detail.sellerReliability &&
    typeof detail.sellerReliability === "object"
      ? (detail.sellerReliability as {
          windowDays: number;
          eligibleJobs: number;
          onTimeRate: number | null;
        })
      : null;

  return (
    <>
      <section className="detail-hero">
        <p className="meta">Capability</p>
        <h1>{cap.name}</h1>
        <p className="meta">{cap.description}</p>
      </section>
      <div className="detail-panel">
        <p>
          <strong>{formatPrice(priceCents, cap.currency)}</strong>
          {cap.estimatedDuration != null && (
            <span className="meta"> · ~{Math.round(cap.estimatedDuration / 60)} min typical</span>
          )}
        </p>
        <p style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "0.5rem" }}>
          <StatusBadge label={availUi.label} variant={availUi.variant} dotLabel={availUi.dotLabel} />
          {!accepting && availability?.nextAvailableAt && (
            <span className="meta">Available from {new Date(availability.nextAvailableAt).toLocaleString()}</span>
          )}
        </p>
        {seller && (
          <p className="meta">
            Seller{" "}
            <Link href={`/sellers/${seller.id}`}>{seller.displayName}</Link>
            {reviews && reviews.reviewCount > 0 && (
              <>
                {" "}
                · {reviews.rating?.toFixed(1)} ({reviews.reviewCount} reviews)
              </>
            )}
          </p>
        )}
        {detail.buyerTrust != null && typeof detail.buyerTrust === "object" && (
          <div className="detail-panel" style={{ marginTop: "1rem" }}>
            <strong>Trust & permissions</strong>
            {Object.entries(detail.buyerTrust as Record<string, string[]>).map(([section, items]) => (
              <div key={section} style={{ marginTop: "0.5rem" }}>
                <p className="meta" style={{ textTransform: "capitalize" }}>
                  {section}
                </p>
                <ul style={{ margin: 0, paddingLeft: "1.2rem" }}>
                  {items.map((line) => (
                    <li key={line} className="meta">
                      {line}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
        {detail.buyerForm?.fields?.length ? (
          <div className="detail-panel" style={{ marginTop: "1rem" }}>
            <strong>Required inputs</strong>
            <ul style={{ paddingLeft: "1.2rem" }}>
              {detail.buyerForm.fields.map((f) => (
                <li key={f.key} className="meta">
                  {f.label}
                  {f.required ? " (required)" : ""}
                </li>
              ))}
            </ul>
          </div>
        ) : null}
        {detail.publishedExamples && detail.publishedExamples.length > 0 && (
          <div className="detail-panel" style={{ marginTop: "1rem" }}>
            <strong>Examples</strong>
            {detail.publishedExamples.map((example) => (
              <div key={example.id} style={{ marginTop: "0.75rem" }}>
                <p>
                  {example.title}
                  <span className="meta"> · {example.source === "REAL_EXECUTION" ? "From a real run" : "Seller curated"}</span>
                </p>
                {example.description && <p className="meta">{example.description}</p>}
                <p className="meta">Input</p>
                <pre style={{ fontSize: "0.85rem", overflow: "auto" }}>
                  {JSON.stringify(example.inputValues, null, 2)}
                </pre>
                <p className="meta">Output</p>
                <pre style={{ fontSize: "0.85rem", overflow: "auto" }}>
                  {JSON.stringify(example.outputValues, null, 2)}
                </pre>
              </div>
            ))}
          </div>
        )}
        {detail.examples && detail.examples.length > 0 && (
          <div className="detail-panel" style={{ marginTop: "1rem" }}>
            <strong>Example inputs</strong>
            {detail.examples.map((ex, i) => (
              <pre key={i} style={{ fontSize: "0.85rem", overflow: "auto" }}>
                {JSON.stringify(ex.values, null, 2)}
              </pre>
            ))}
          </div>
        )}
        {detail.privacyDisclosure && (
          <div className="detail-panel" style={{ marginTop: "1rem" }}>
            <strong>Privacy & data</strong>
            <p className="meta">{detail.privacyDisclosure.executionModel}</p>
            <p className="meta">{detail.privacyDisclosure.dataHandling}</p>
            <p className="meta">{detail.privacyDisclosure.retention}</p>
            {"paymentAndProfile" in detail.privacyDisclosure &&
            detail.privacyDisclosure.paymentAndProfile ? (
              <p className="meta">{String(detail.privacyDisclosure.paymentAndProfile)}</p>
            ) : null}
            {"llmDisclosure" in detail.privacyDisclosure && detail.privacyDisclosure.llmDisclosure ? (
              <p className="meta">{String(detail.privacyDisclosure.llmDisclosure)}</p>
            ) : null}
            {"thirdPartyServices" in detail.privacyDisclosure &&
            Array.isArray(detail.privacyDisclosure.thirdPartyServices) ? (
              <div className="meta">
                <strong>External processors declared by seller</strong>
                <ul>
                  {detail.privacyDisclosure.thirdPartyServices.map((name: string) => (
                    <li key={name}>{name}</li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        )}
        {sellerReliability && sellerReliability.eligibleJobs != null && (
          <p className="meta" style={{ marginTop: "0.75rem" }}>
            Seller reliability (last {sellerReliability.windowDays} days):{" "}
            {sellerReliability.onTimeRate != null
              ? `${Math.round(sellerReliability.onTimeRate * 100)}% on-time (${sellerReliability.eligibleJobs} jobs sampled)`
              : "insufficient sample — timing not scored yet"}
          </p>
        )}
        {reviews && reviews.reviews.length > 0 && (
          <div className="detail-panel" style={{ marginTop: "1rem" }}>
            <strong>Recent reviews</strong>
            <ul style={{ listStyle: "none", padding: 0 }}>
              {reviews.reviews.slice(0, 5).map((r) => (
                <li key={r.id} style={{ marginTop: "0.65rem" }}>
                  {"★".repeat(r.stars)}
                  {r.body && <p className="meta">{r.body}</p>}
                </li>
              ))}
            </ul>
          </div>
        )}
        <p style={{ marginTop: "1.25rem", display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
          {availability?.purchaseAction === "RUN_NOW" || (!availability?.purchaseAction && accepting) ? (
            <Link className="button" href={`/capabilities/${slug}/run`}>
              {availability?.purchaseLabel ?? "Run now"}
            </Link>
          ) : availability?.purchaseAction === "JOIN_QUEUE" ? (
            <Link className="button" href={`/capabilities/${slug}/run`}>
              {availability.purchaseLabel ?? "Join queue"}
            </Link>
          ) : availability?.purchaseAction === "SCHEDULE_EARLIEST" ||
            (!availability?.purchaseAction && availability?.nextAvailableAt) ? (
            <Link className="button" href={`/capabilities/${slug}/run?schedule=earliest`}>
              {availability?.purchaseLabel ?? "Schedule for earliest availability"}
            </Link>
          ) : (
            <button className="button" type="button" disabled>
              {availability?.purchaseLabel ?? "Unavailable"}
            </button>
          )}
          <FavoriteButton capabilityId={cap.id} />
          <Link className="button secondary" href={`/agent?capability=${slug}`}>
            Ask Agent
          </Link>
        </p>
        {!accepting && (
          <p className="meta" style={{ marginTop: "0.75rem" }}>
            This capability is not accepting immediate jobs right now. You can schedule a future run
            via the API or return when the seller opens their window.
          </p>
        )}
        <div style={{ marginTop: "1.25rem" }}>
          <AbuseReportForm targetType="CAPABILITY" targetId={cap.id} capabilityId={cap.id} />
        </div>
      </div>
    </>
  );
}
