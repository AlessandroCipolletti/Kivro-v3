"use client";

import { Alert } from "@/components/ui/Alert";
import { PageHeader } from "@/components/ui/PageHeader";
import { API_BASE } from "@/lib/kivro-api";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

type Prefs = {
  jobCompleted: boolean;
  healthAlert: boolean;
  payout: boolean;
};

export default function SellerNotificationsPage() {
  const [prefs, setPrefs] = useState<Prefs | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const load = useCallback(async () => {
    setError(null);
    const res = await fetch(`${API_BASE}/seller/notifications`, { credentials: "include" });
    if (!res.ok) {
      setError("Sign in as a verified seller.");
      return;
    }
    const body = (await res.json()) as { preferences: Prefs };
    setPrefs(body.preferences);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function save(next: Prefs) {
    setSaved(false);
    setError(null);
    const res = await fetch(`${API_BASE}/seller/notifications`, {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(next),
    });
    if (!res.ok) {
      setError("Could not save preferences.");
      return;
    }
    const body = (await res.json()) as { preferences: Prefs };
    setPrefs(body.preferences);
    setSaved(true);
  }

  if (!prefs) {
    return (
      <main className="mx-auto max-w-lg px-4 py-8">
        <PageHeader title="Seller notifications" description="Email alerts for jobs, health, and payouts." />
        {error ? <Alert tone="danger">{error}</Alert> : null}
      </main>
    );
  }

  const row = (key: keyof Prefs, label: string, detail: string) => (
    <label key={key} className="flex gap-3 rounded border border-border p-3">
      <input
        type="checkbox"
        checked={prefs[key]}
        onChange={(e) => {
          const next = { ...prefs, [key]: e.target.checked };
          setPrefs(next);
          void save(next);
        }}
      />
      <span>
        <span className="font-medium">{label}</span>
        <span className="mt-0.5 block text-sm text-muted">{detail}</span>
      </span>
    </label>
  );

  return (
    <main className="mx-auto max-w-lg px-4 py-8">
      <PageHeader title="Seller notifications" description="Control which operational emails you receive." />
      <Link href="/seller/operations" className="mb-6 inline-block text-sm">
        ← Operations
      </Link>
      {error ? <Alert tone="danger">{error}</Alert> : null}
      {saved ? <Alert tone="info">Saved.</Alert> : null}
      <div className="grid gap-3">
        {row("jobCompleted", "Job completed", "When a buyer job reaches a terminal success state.")}
        {row("healthAlert", "Health alerts", "When Worker health blocks new purchases.")}
        {row("payout", "Payout events", "When transfers move to paid/settled.")}
      </div>
    </main>
  );
}
