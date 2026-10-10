"use client";

import { Alert } from "@/components/ui/Alert";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { API_BASE } from "@/lib/kivro-api";
import { marketplaceAvailabilityUi, sellerHealthUi } from "@/lib/status-ui";
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
    credentialRefs?: Array<{ refId: string; provider: string; status: string }>;
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
    <>
      <PageHeader
        title="Seller dashboard"
        description="Worker health, pause controls, and capability acceptance at a glance."
        actions={
          <Link className="button secondary" href="/">
            Marketplace
          </Link>
        }
      />
      <p className="page-shell">
        <Link href="/seller/onboarding">Seller onboarding</Link>
        {" · "}
        <Link href="/seller/capabilities/new">New capability wizard</Link>
        {" · "}
        <Link href="/seller/settings/identity">Identity settings</Link>
      </p>

      {error && <Alert tone="danger">{error}</Alert>}

      {data && (
        <>
          {data.platformSecurityPause.active && (
            <Alert tone="danger">
              <strong>Platform security pause.</strong> New jobs are blocked until:{" "}
              {data.platformSecurityPause.reason ?? "SECURITY"}. Resume stays disabled until
              telemetry recovers.
            </Alert>
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
              className={
                data.emergencyPause.active ? "button secondary" : "button button--danger"
              }
              disabled={busy || data.platformSecurityPause.active}
              onClick={() => void toggleEmergencyPause()}
            >
              {data.emergencyPause.active ? "Resume new jobs" : "Pause all new jobs"}
            </button>
          </section>

          <section className="detail-panel">
            <h2>Workers</h2>
            {data.workers.length === 0 && (
              <EmptyState
                title="No paired Workers"
                description="Pair kivro-worker from your machine to accept marketplace jobs."
              />
            )}
            <ul style={{ listStyle: "none", padding: 0, display: "grid", gap: "0.75rem" }}>
              {data.workers.map((w) => (
                <li key={w.id}>
                  <div className="job-list-row">
                    <strong>{w.name}</strong>
                    <StatusBadge
                      label={w.healthLabel}
                      variant={sellerHealthUi(w.healthLabel)}
                    />
                  </div>
                  <span className="meta">
                    v{w.workerVersion}
                  {data.workerVersionPolicy && (
                    <span className="meta">
                      {" "}
                      · min {data.workerVersionPolicy.minimumSecurityVersion} · latest{" "}
                      {data.workerVersionPolicy.latestSupportedVersion}
                    </span>
                  )}
                  </span>
                  <div className="meta">
                    Docker {w.dockerOk ? "OK" : "—"} · Sandbox {w.sandboxOk ? "OK" : "—"}
                  </div>
                  {w.warnings.length > 0 && (
                    <ul style={{ margin: "0.5rem 0 0", paddingLeft: "1.1rem" }}>
                      {w.warnings.map((warn, i) => (
                        <li key={i} className="meta">
                          {warn.title}
                          {warn.blocking ? " (blocks dispatch)" : ""}
                        </li>
                      ))}
                    </ul>
                  )}
                  {w.credentialRefs && w.credentialRefs.length > 0 && (
                    <ul style={{ margin: "0.5rem 0 0", paddingLeft: "1.1rem" }}>
                      {w.credentialRefs.map((cred) => (
                        <li key={cred.refId} className="meta">
                          Credential {cred.refId} ({cred.provider}): {cred.status}
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
            <ul style={{ listStyle: "none", padding: 0, display: "grid", gap: "0.75rem" }}>
              {data.capabilities.map((c) => (
                <li key={c.id}>
                  <div className="job-list-row">
                    <div>
                      <strong>{c.name}</strong>
                      {c.detail && <span className="meta"> · {c.detail}</span>}
                    </div>
                    <StatusBadge
                      label={c.accepting ? "Accepting jobs" : "Paused"}
                      variant={
                        marketplaceAvailabilityUi({
                          status: c.accepting ? "ONLINE" : "PAUSED",
                          accepting: c.accepting,
                        }).variant
                      }
                    />
                  </div>
                  <div style={{ marginTop: "0.5rem" }}>
                    <button
                      type="button"
                      className="button secondary"
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
            <ul style={{ listStyle: "none", padding: 0, display: "grid", gap: "0.5rem" }}>
              {data.healthTimeline.map((e) => (
                <li key={`${e.createdAt}-${e.summary}`} className="meta">
                  {new Date(e.createdAt).toLocaleString()} — {e.summary}
                </li>
              ))}
            </ul>
          </section>
        </>
      )}
    </>
  );
}
