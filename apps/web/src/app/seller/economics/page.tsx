"use client";

import { Alert } from "@/components/ui/Alert";
import { PageHeader } from "@/components/ui/PageHeader";
import { API_BASE } from "@/lib/kivro-api";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

type Earnings = {
  pendingCents: number;
  paidCents: number;
  transferCount: number;
  disclaimer: string;
};

type Profit = {
  grossSalesCents: number;
  platformFeesCents: number;
  estimatedProviderCostCents: number;
  sellerNetCents: number;
  completedJobs: number;
};

function usd(cents: number) {
  return `$${(cents / 100).toFixed(2)}`;
}

export default function SellerEconomicsPage() {
  const [earnings, setEarnings] = useState<Earnings | null>(null);
  const [profit, setProfit] = useState<Profit | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    const [eRes, pRes] = await Promise.all([
      fetch(`${API_BASE}/seller/economics/earnings`, { credentials: "include" }),
      fetch(`${API_BASE}/seller/economics/profit`, { credentials: "include" }),
    ]);
    if (!eRes.ok || !pRes.ok) {
      setError("Sign in as a verified seller to view economics.");
      return;
    }
    setEarnings((await eRes.json()) as Earnings);
    setProfit((await pRes.json()) as Profit);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <PageHeader
        title="Economics"
        description="Settlement-backed earnings and profit analytics — never Worker-reported totals."
      />
      <nav className="mb-6 flex flex-wrap gap-3 text-sm">
        <Link href="/seller/operations">Operations</Link>
        <Link href="/seller/dashboard">Dashboard</Link>
      </nav>
      {error ? <Alert tone="danger">{error}</Alert> : null}
      {earnings ? (
        <section className="mb-8 rounded border border-border p-4">
          <h2 className="text-lg font-medium">Earnings (ledger)</h2>
          <dl className="mt-3 grid gap-2 sm:grid-cols-2">
            <div>
              <dt className="text-sm text-muted">Pending</dt>
              <dd className="text-xl font-semibold tabular-nums">{usd(earnings.pendingCents)}</dd>
            </div>
            <div>
              <dt className="text-sm text-muted">Paid</dt>
              <dd className="text-xl font-semibold tabular-nums">{usd(earnings.paidCents)}</dd>
            </div>
          </dl>
          <p className="mt-3 text-xs text-muted">{earnings.disclaimer}</p>
        </section>
      ) : null}
      {profit ? (
        <section className="rounded border border-border p-4">
          <h2 className="text-lg font-medium">Profit analytics ({profit.completedJobs} completed jobs)</h2>
          <dl className="mt-3 grid gap-2 sm:grid-cols-2">
            <div>
              <dt className="text-sm text-muted">Gross revenue</dt>
              <dd className="tabular-nums">{usd(profit.grossSalesCents)}</dd>
            </div>
            <div>
              <dt className="text-sm text-muted">Platform fees</dt>
              <dd className="tabular-nums">{usd(profit.platformFeesCents)}</dd>
            </div>
            <div>
              <dt className="text-sm text-muted">Est. provider cost</dt>
              <dd className="tabular-nums">{usd(profit.estimatedProviderCostCents)}</dd>
            </div>
            <div>
              <dt className="text-sm text-muted">Seller net (ledger)</dt>
              <dd className="font-medium tabular-nums">{usd(profit.sellerNetCents)}</dd>
            </div>
          </dl>
          <p className="mt-3 text-xs text-muted">
            Provider cost is estimated per job; earnings use authoritative settlement snapshots.
          </p>
        </section>
      ) : null}
    </main>
  );
}
