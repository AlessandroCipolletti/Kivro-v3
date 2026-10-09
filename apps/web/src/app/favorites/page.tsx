"use client";

import { EmptyState } from "@/components/ui/EmptyState";
import { LoadingState } from "@/components/ui/LoadingState";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { API_BASE } from "@/lib/kivro-api";
import { marketplaceAvailabilityUi } from "@/lib/status-ui";
import Link from "next/link";
import { useEffect, useState } from "react";

type FavoriteRow = {
  slug: string;
  name: string;
  sellerDisplayName: string;
  priceLabel: string;
  availability: string;
  accepting: boolean;
};

export default function FavoritesPage() {
  const [rows, setRows] = useState<FavoriteRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${API_BASE}/buyer/favorites`, { credentials: "include" })
      .then(async (res) => {
        if (res.status === 401) {
          setError("sign_in");
          return null;
        }
        if (!res.ok) {
          throw new Error("failed");
        }
        return (await res.json()) as { favorites: FavoriteRow[] };
      })
      .then((data) => {
        if (data?.favorites) {
          setRows(data.favorites);
        }
      })
      .catch(() => setError("load_failed"));
  }, []);

  if (error === "sign_in") {
    return (
      <EmptyState
        title="Sign in required"
        description="Save capabilities from their detail page to compare them here."
        action={{ href: "/login", label: "Sign in" }}
      />
    );
  }

  return (
    <>
      <PageHeader
        title="Saved capabilities"
        description="Quick access to capabilities you marked as favorites."
      />
      {rows == null && !error && <LoadingState label="Loading saved capabilities…" />}
      {error === "load_failed" && (
        <EmptyState title="Could not load" description="Try again in a moment." />
      )}
      {rows?.length === 0 && (
        <EmptyState
          title="No saved capabilities"
          description="Open a capability and use Save to pin it here."
          action={{ href: "/search", label: "Browse marketplace" }}
        />
      )}
      <ul className="grid" style={{ listStyle: "none", padding: 0 }}>
        {rows?.map((f) => {
          const avail = marketplaceAvailabilityUi({
            status: f.accepting ? "ONLINE" : "OFFLINE",
            accepting: f.accepting,
          });
          return (
            <li key={f.slug} className="card">
              <Link href={`/capabilities/${f.slug}`}>
                <strong>{f.name}</strong>
              </Link>
              <p className="meta">
                {f.sellerDisplayName} · {f.priceLabel}
              </p>
              <StatusBadge label={avail.label} variant={avail.variant} />
            </li>
          );
        })}
      </ul>
    </>
  );
}
