"use client";

import { API_BASE } from "@/lib/kivro-api";
import Link from "next/link";
import { useEffect, useState } from "react";

type RecentRow = { slug: string; name: string; lastUsedAt: string };

export function RecentlyUsed() {
  const [rows, setRows] = useState<RecentRow[]>([]);

  useEffect(() => {
    fetch(`${API_BASE}/buyer/recent-capabilities`, { credentials: "include" })
      .then(async (res) => {
        if (!res.ok) {
          return null;
        }
        return (await res.json()) as { recent: RecentRow[] };
      })
      .then((data) => {
        if (data?.recent) {
          setRows(data.recent.slice(0, 6));
        }
      })
      .catch(() => undefined);
  }, []);

  if (rows.length === 0) {
    return null;
  }

  return (
    <section style={{ marginTop: "2rem" }}>
      <h2 style={{ fontSize: "1.15rem" }}>Recently used</h2>
      <ul className="grid" style={{ listStyle: "none", padding: 0 }}>
        {rows.map((r) => (
          <li key={r.slug} className="card">
            <Link href={`/capabilities/${r.slug}`}>
              <strong>{r.name}</strong>
            </Link>
            <p className="meta">Last run {new Date(r.lastUsedAt).toLocaleDateString()}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
