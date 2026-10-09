"use client";

import { API_BASE } from "@/lib/kivro-api";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

type Dashboard = {
  displayName: string;
  emergencyPause: { active: boolean; pausedAt: string | null; source: string | null };
  workers: Array<{
    id: string;
    name: string;
    healthLabel: string;
    workerVersion: string;
    lastSeenAt: string | null;
    warnings: Array<{ severity: string; title: string; blocking: boolean }>;
  }>;
  capabilities: Array<{ slug: string; name: string; scheduleMode: string; workerOnline: boolean }>;
  jobMetrics: {
    runningCount: number;
    queuedCount: number;
    failureRate: number | null;
    lastSuccessAt: string | null;
  };
  healthTimeline: Array<{ summary: string; severity: string; createdAt: string }>;
};

export default function SellerDashboardPage() {
  const [data, setData] = useState<Dashboard | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setError(null);
    const res = await fetch(`${API_BASE}/seller/dashboard/health`, { credentials: "include" });
    if (res.status === 401 || res.status === 403) {
      setError("Sign in with a seller account to view Worker health.");
      setData(null);
      return;
    }
    if (!res.ok) {
      setError("Could not load dashboard.");
      return;
    }
    setData((await res.json()) as Dashboard);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function toggleEmergencyPause() {
    if (!data) {
      return;
    }
    setBusy(true);
    const path = data.emergencyPause.active
      ? "/seller/emergency-pause/resume"
      : "/seller/emergency-pause";
    const res = await fetch(`${API_BASE}${path}`, {
      method: "POST",
      credentials: "include",
    });
    setBusy(false);
    if (!res.ok) {
      setError("Emergency pause action failed.");
      return;
    }
    await load();
  }

  return (
    <main className="page-shell">
      <header className="page-header">
        <div>
          <p className="eyebrow">Seller</p>
          <h1>Worker health</h1>
        </div>
        <Link href="/">Marketplace</Link>
      </header>

      {error && <p className="form-error">{error}</p>}

      {data && (
        <>
          <section className="detail-panel">
            <h2>{data.displayName}</h2>
            <p>
              Emergency pause:{" "}
              <strong>{data.emergencyPause.active ? "Active" : "Off"}</strong>
            </p>
            <button
              type="button"
              className={data.emergencyPause.active ? "btn-secondary" : "btn-danger"}
              disabled={busy}
              onClick={() => void toggleEmergencyPause()}
            >
              {data.emergencyPause.active ? "Resume new jobs" : "Pause all new jobs"}
            </button>
            <p className="muted">
              Running jobs continue. Local CLI: <code>kivro-worker pause --all</code>
            </p>
          </section>

          <section className="detail-panel">
            <h2>Workers</h2>
            {data.workers.length === 0 && <p>No paired Workers yet.</p>}
            <ul className="stack-list">
              {data.workers.map((w) => (
                <li key={w.id}>
                  <strong>{w.name}</strong> — {w.healthLabel} (v{w.workerVersion})
                  {w.warnings.length > 0 && (
                    <ul>
                      {w.warnings.map((warn, i) => (
                        <li key={i}>
                          [{warn.severity}] {warn.title}
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ul>
          </section>

          <section className="detail-panel">
            <h2>Job metrics (24h)</h2>
            <p>
              Running {data.jobMetrics.runningCount} · Queued {data.jobMetrics.queuedCount}
            </p>
            <p>
              Failure rate{" "}
              {data.jobMetrics.failureRate != null
                ? `${Math.round(data.jobMetrics.failureRate * 100)}%`
                : "—"}
            </p>
            <p className="muted">
              Last success: {data.jobMetrics.lastSuccessAt ?? "—"}
            </p>
          </section>

          <section className="detail-panel">
            <h2>Capabilities</h2>
            <ul className="stack-list">
              {data.capabilities.map((c) => (
                <li key={c.slug}>
                  {c.name} — schedule {c.scheduleMode}
                  {c.workerOnline ? " · worker online" : " · worker offline"}
                </li>
              ))}
            </ul>
          </section>

          <section className="detail-panel">
            <h2>Health timeline</h2>
            <ul className="stack-list">
              {data.healthTimeline.map((e, i) => (
                <li key={i}>
                  <span className="muted">{e.createdAt}</span> [{e.severity}] {e.summary}
                </li>
              ))}
            </ul>
          </section>

          <p className="muted">
            Running-job pause controls: seller API <code>/seller/jobs/control-ui</code>
          </p>
        </>
      )}
    </main>
  );
}
