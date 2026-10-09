"use client";

import { API_BASE } from "@/lib/kivro-api";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

type CapabilityRow = {
  id: string;
  slug: string;
  name: string;
  healthLabel: string;
  detail: string | null;
  accepting: boolean;
  globalPauseBlocksResume: boolean;
};

type Dashboard = {
  displayName: string;
  runningJobsCount: number;
  emergencyPause: { active: boolean; pausedAt: string | null; source: string | null };
  platformSecurityPause: { active: boolean; reason: string | null; pausedAt: string | null };
  workerVersionPolicy: { minimumSecurityVersion: string; latestSupportedVersion: string };
  workers: Array<{
    id: string;
    name: string;
    healthLabel: string;
    workerVersion: string;
    dockerOk: boolean | null;
    sandboxOk: boolean | null;
    warnings: Array<{ severity: string; title: string; blocking: boolean }>;
  }>;
  capabilities: CapabilityRow[];
  jobMetrics: {
    runningCount: number;
    queuedCount: number;
    failureRate: number | null;
    lastSuccessAt: string | null;
  };
  healthTimeline: Array<{ summary: string; severity: string; createdAt: string; eventType: string }>;
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
    if (data.platformSecurityPause.active) {
      setError("Platform security pause is active — fix the reported issue before changing pause state.");
      return;
    }
    if (
      !data.emergencyPause.active &&
      !window.confirm("Pause all new marketplace jobs?\n\nRunning jobs will continue.")
    ) {
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
    if (res.status === 409) {
      const body = (await res.json().catch(() => ({}))) as { warnings?: string[] };
      setError(
        body.warnings?.length
          ? `Resume blocked: ${body.warnings.join("; ")}`
          : "Resume blocked by security policy.",
      );
      return;
    }
    if (!res.ok) {
      setError("Emergency pause action failed.");
      return;
    }
    await load();
  }

  async function toggleCapabilityPause(cap: CapabilityRow) {
    if (data?.emergencyPause.active) {
      setError("Remove global emergency pause before resuming individual capabilities.");
      return;
    }
    setBusy(true);
    const pause = cap.accepting;
    const path = pause
      ? `/seller/capabilities/${cap.id}/schedule/pause`
      : `/seller/capabilities/${cap.id}/schedule/resume`;
    const res = await fetch(`${API_BASE}${path}`, { method: "POST", credentials: "include" });
    setBusy(false);
    if (!res.ok) {
      setError("Capability pause action failed.");
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
          {data.platformSecurityPause.active && (
            <section className="detail-panel form-error">
              <h2>Platform security pause</h2>
              <p>
                Kivro blocked new jobs until this is resolved:{" "}
                <strong>{data.platformSecurityPause.reason ?? "SECURITY"}</strong>
              </p>
              <p className="muted">Resume and emergency unpause are disabled until health recovers.</p>
            </section>
          )}

          <section className="detail-panel">
            <h2>{data.displayName}</h2>
            <p>
              Emergency pause:{" "}
              <strong>{data.emergencyPause.active ? "Active" : "Off"}</strong>
              {data.emergencyPause.source && (
                <span className="muted"> ({data.emergencyPause.source})</span>
              )}
            </p>
            <p className="muted">
              {data.runningJobsCount} job(s) currently running — emergency pause stops{" "}
              <em>new</em> jobs only (§388).
            </p>
            <button
              type="button"
              className={data.emergencyPause.active ? "btn-secondary" : "btn-danger"}
              disabled={busy || data.platformSecurityPause.active}
              onClick={() => void toggleEmergencyPause()}
            >
              {data.emergencyPause.active ? "Resume new jobs" : "Pause all new jobs"}
            </button>
          </section>

          <section className="detail-panel">
            <h2>Workers</h2>
            {data.workers.length === 0 && <p>No paired Workers yet.</p>}
            <ul className="stack-list">
              {data.workers.map((w) => (
                <li key={w.id}>
                  <strong>{w.name}</strong> — {w.healthLabel} (v{w.workerVersion}
                  {data.workerVersionPolicy && (
                    <span className="muted">
                      {" "}
                      · min {data.workerVersionPolicy.minimumSecurityVersion} · latest{" "}
                      {data.workerVersionPolicy.latestSupportedVersion}
                    </span>
                  )}
                  )
                  <div className="muted">
                    Docker {w.dockerOk ? "OK" : "—"} · Sandbox {w.sandboxOk ? "OK" : "—"}
                  </div>
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
            <h2>Capabilities</h2>
            <ul className="stack-list">
              {data.capabilities.map((c) => (
                <li key={c.id}>
                  <strong>{c.name}</strong> — {c.healthLabel}
                  {c.detail && <span className="muted"> · {c.detail}</span>}
                  <div>
                    <button
                      type="button"
                      className="btn-secondary"
                      disabled={busy || (c.globalPauseBlocksResume && !c.accepting)}
                      onClick={() => void toggleCapabilityPause(c)}
                    >
                      {c.accepting ? "Pause capability" : "Resume capability"}
                    </button>
                  </div>
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
            <p className="muted">Last success: {data.jobMetrics.lastSuccessAt ?? "—"}</p>
          </section>

          <section className="detail-panel">
            <h2>Health timeline</h2>
            <ul className="stack-list">
              {data.healthTimeline.map((e) => (
                <li key={`${e.createdAt}-${e.summary}`}>
                  <span className="muted">{e.createdAt}</span> [{e.eventType}/{e.severity}]{" "}
                  {e.summary}
                </li>
              ))}
            </ul>
          </section>
        </>
      )}
    </main>
  );
}
