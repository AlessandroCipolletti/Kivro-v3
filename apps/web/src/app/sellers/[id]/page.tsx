import Link from "next/link";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

const API_BASE =
  process.env.KIVRO_API_URL ??
  process.env.NEXT_PUBLIC_KIVRO_API_URL ??
  "http://localhost:3001";

type Params = Promise<{ id: string }>;

export default async function SellerProfilePage({ params }: { params: Params }) {
  const { id } = await params;
  type SellerPayload = {
    seller: { displayName: string; verificationStatus: string; capabilityCount: number };
    capabilities: Array<{ slug: string; name: string; description: string; rating: number | null }>;
  };
  let data: SellerPayload | null = null;
  try {
    const res = await fetch(`${API_BASE}/marketplace/sellers/${encodeURIComponent(id)}`, {
      cache: "no-store",
    });
    if (res.ok) {
      data = (await res.json()) as SellerPayload;
    }
  } catch {
    data = null;
  }
  if (!data?.seller) {
    notFound();
  }

  return (
    <>
      <section className="detail-hero">
        <p className="meta">Seller</p>
        <h1>{data.seller.displayName}</h1>
        <p className="meta">
          {data.seller.verificationStatus.replaceAll("_", " ").toLowerCase()} ·{" "}
          {data.seller.capabilityCount} published capabilities
        </p>
      </section>
      <h2 style={{ fontSize: "1.15rem", marginTop: "1.5rem" }}>Capabilities</h2>
      <ul className="grid" style={{ listStyle: "none", padding: 0 }}>
        {data.capabilities.map((cap) => (
          <li key={cap.slug} className="card">
            <Link href={`/capabilities/${cap.slug}`}>
              <strong>{cap.name}</strong>
            </Link>
            <p className="meta">{cap.description}</p>
            {cap.rating != null && (
              <p className="meta">Rating {cap.rating.toFixed(1)}</p>
            )}
          </li>
        ))}
      </ul>
    </>
  );
}
