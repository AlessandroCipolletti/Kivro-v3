"use client";

import { Alert } from "@/components/ui/Alert";
import { PageHeader } from "@/components/ui/PageHeader";
import { API_BASE } from "@/lib/kivro-api";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

type Summary = {
  runningJobs: number;
  queuedJobs: number;
  capabilitiesPublished: number;
  capabilitiesPaused: number;
  recentFailures: number;
};

type Maintenance = {
  active: boolean;
  message: string | null;
  expectedReturnAt: string | null;
};

export default function SellerOperationsPage() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [maintenance, setMaintenance] = useState<Maintenance | null>(null);
  const [message, setMessage] = useState("");
  const [returnAt, setReturnAt] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setError(null);
    const [sumRes, maintRes] = await Promise.all([
      fetch(`${API_BASE}/seller/operations/summary`, { credentials: "include" }),
      fetch(`${API_BASE}/seller/maintenance`, { credentials: "include" }),
    ]);
    if (!sumRes.ok || !maintRes.ok) {
      setError("Sign in as a verified seller to view operations.");
      return;
    }
    setSummary((await sumRes.json()) as Summary);
    const m = (await maintRes.json()) as Maintenance;
    setMaintenance(m);
    setMessage(m.message ?? "");
    setReturnAt(m.expectedReturnAt?.slice(0, 16) ?? "");
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function saveMaintenance(active: boolean) {
    setBusy(true);
    setError(null);
    const res = await fetch(`${API_BASE}/seller/maintenance`, {
      method: "PUT",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        active,
        message: message.trim() || null,
        expectedReturnAt: returnAt ? new Date(returnAt).toISOString() : null,
      }),
    });
    setBusy(false);
    if (!res.ok) {
      setError("Could not update maintenance mode.");
      return;
    }
    setMaintenance((await res.json()) as Maintenance);
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <PageHeader
        title="Operations"
        description="Work in flight, capacity, and maintenance — authoritative cloud state, not Worker guesses."
      />
      <nav className="mb-6 flex flex-wrap gap-3 text-sm">
        <Link href="/seller/dashboard">Dashboard</Link>
        <Link href="/seller/economics">Economics</Link>
        <Link href="/seller/settings/capacity">Capacity</Link>
        <Link href="/seller/settings/notifications">Notifications</Link>
      </nav>
      {error ? <Alert tone="danger">{error}</Alert> : null}
      {summary ? (
        <ul className="mb-8 grid gap-3 sm:grid-cols-2">
          <li className="rounded border border-border p-4">
            <p className="text-sm text-muted">Running</p>
            <p className="text-2xl font-semibold tabular-nums">{summary.runningJobs}</p>
          </li>
          <li className="rounded border border-border p-4">
            <p className="text-sm text-muted">Queued</p>
            <p className="text-2xl font-semibold tabular-nums">{summary.queuedJobs}</p>
          </li>
          <li className="rounded border border-border p-4">
            <p className="text-sm text-muted">Published capabilities</p>
            <p className="text-2xl font-semibold tabular-nums">{summary.capabilitiesPublished}</p>
          </li>
          <li className="rounded border border-border p-4">
            <p className="text-sm text-muted">Failures (7d)</p>
            <p className="text-2xl font-semibold tabular-nums">{summary.recentFailures}</p>
          </li>
        </ul>
      ) : null}
      <section className="rounded border border-border p-4">
        <h2 className="text-lg font-medium">Maintenance mode</h2>
        <p className="mt-1 text-sm text-muted">
          Buyers see your message instead of an unexplained offline state.
        </p>
        <label className="mt-4 block text-sm">
          Message for buyers
          <textarea
            className="mt-1 w-full rounded border border-border bg-background p-2 text-sm"
            rows={3}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
        </label>
        <label className="mt-3 block text-sm">
          Expected return (local)
          <input
            type="datetime-local"
            className="mt-1 w-full rounded border border-border bg-background p-2 text-sm"
            value={returnAt}
            onChange={(e) => setReturnAt(e.target.value)}
          />
        </label>
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            disabled={busy}
            className="rounded bg-foreground px-3 py-2 text-sm text-background disabled:opacity-50"
            onClick={() => void saveMaintenance(true)}
          >
            Enable maintenance
          </button>
          <button
            type="button"
            disabled={busy}
            className="rounded border border-border px-3 py-2 text-sm"
            onClick={() => void saveMaintenance(false)}
          >
            Disable maintenance
          </button>
          {maintenance?.active ? (
            <span className="self-center text-sm text-amber-700">Maintenance is active</span>
          ) : null}
        </div>
      </section>
    </main>
  );
}
