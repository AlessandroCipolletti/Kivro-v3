"use client";

import { API_BASE } from "@/lib/kivro-api";
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
      <>
        <h1>Saved capabilities</h1>
        <p className="meta">
          <Link href="/login">Sign in</Link> to view favorites.
        </p>
      </>
    );
  }

  return (
    <>
      <h1>Saved capabilities</h1>
      {rows == null && !error && <p className="meta">Loading…</p>}
      {error === "load_failed" && <p className="meta">Could not load favorites.</p>}
      {rows?.length === 0 && <p className="meta">No saved capabilities yet.</p>}
      <ul className="grid" style={{ listStyle: "none", padding: 0 }}>
        {rows?.map((f) => (
          <li key={f.slug} className="card">
            <Link href={`/capabilities/${f.slug}`}>
              <strong>{f.name}</strong>
            </Link>
            <p className="meta">
              {f.sellerDisplayName} · {f.priceLabel}
            </p>
            <p className="meta">
              {f.availability}
              {!f.accepting && " · not accepting now"}
            </p>
          </li>
        ))}
      </ul>
    </>
  );
}
