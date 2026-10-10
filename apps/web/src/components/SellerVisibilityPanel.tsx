"use client";

import { API_BASE } from "@/lib/kivro-api";
import { useCallback, useEffect, useState } from "react";

type SellerCapability = {
  id: string;
  name: string;
  slug: string;
  status: string;
  visibility: "DRAFT" | "PRIVATE" | "UNLISTED" | "PUBLIC";
};

const VISIBILITIES = ["DRAFT", "PRIVATE", "UNLISTED", "PUBLIC"] as const;

export function SellerVisibilityPanel() {
  const [rows, setRows] = useState<SellerCapability[]>([]);
  const [message, setMessage] = useState<string | null>(null);

  const load = useCallback(async () => {
    const res = await fetch(`${API_BASE}/seller/capabilities`, { credentials: "include" });
    if (!res.ok) {
      return;
    }
    const body = (await res.json()) as { capabilities: SellerCapability[] };
    setRows(body.capabilities ?? []);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function saveVisibility(id: string, visibility: string) {
    setMessage(null);
    const res = await fetch(`${API_BASE}/seller/capabilities/${id}/visibility`, {
      method: "POST",
      credentials: "include",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ visibility }),
    });
    if (!res.ok) {
      const body = (await res.json().catch(() => null)) as { error?: string } | null;
      setMessage(body?.error ?? "Could not update visibility.");
      return;
    }
    setMessage("Visibility updated. Existing jobs are unchanged.");
    await load();
  }

  if (rows.length === 0) {
    return null;
  }

  return (
    <section className="detail-panel">
      <h2>Visibility</h2>
      <p className="meta">
        Draft and private capabilities stay out of search. Unlisted capabilities work from a direct link. Public
        capabilities are listed.
      </p>
      {message && <p className="meta">{message}</p>}
      <ul style={{ listStyle: "none", padding: 0, display: "grid", gap: "0.75rem" }}>
        {rows.map((row) => (
          <li key={row.id} className="job-list-row">
            <div>
              <strong>{row.name}</strong>
              <span className="meta"> · {row.status}</span>
            </div>
            <label className="meta" htmlFor={`visibility-${row.id}`}>
              Listing
              <select
                id={`visibility-${row.id}`}
                value={row.visibility}
                onChange={(event) => void saveVisibility(row.id, event.target.value)}
              >
                {VISIBILITIES.map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            </label>
          </li>
        ))}
      </ul>
    </section>
  );
}
