"use client";

import { Alert } from "@/components/ui/Alert";
import { PageHeader } from "@/components/ui/PageHeader";
import { API_BASE } from "@/lib/kivro-api";
import Link from "next/link";
import { useState } from "react";

export default function SellerCapacityPage() {
  const [maxJobs, setMaxJobs] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  async function save() {
    setError(null);
    setSaved(false);
    const res = await fetch(`${API_BASE}/seller/settings/capacity`, {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ maxConcurrentJobs: maxJobs }),
    });
    if (!res.ok) {
      setError("Could not save capacity (must be 1–10).");
      return;
    }
    setSaved(true);
  }

  return (
    <main className="mx-auto max-w-lg px-4 py-8">
      <PageHeader
        title="Concurrent job capacity"
        description="Limits how many jobs your Worker may run at once. Buyers see a clear at-capacity message instead of silent failure."
      />
      <Link href="/seller/operations" className="mb-6 inline-block text-sm">
        ← Operations
      </Link>
      {error ? <Alert tone="danger">{error}</Alert> : null}
      {saved ? <Alert tone="info">Saved.</Alert> : null}
      <label className="block text-sm">
        Max concurrent jobs
        <input
          type="number"
          min={1}
          max={10}
          className="mt-1 w-full rounded border border-border bg-background p-2"
          value={maxJobs}
          onChange={(e) => setMaxJobs(Number(e.target.value))}
        />
      </label>
      <button
        type="button"
        className="mt-4 rounded bg-foreground px-3 py-2 text-sm text-background"
        onClick={() => void save()}
      >
        Save
      </button>
    </main>
  );
}
