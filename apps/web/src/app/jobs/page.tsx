"use client";

import { EmptyState } from "@/components/ui/EmptyState";
import { LoadingState } from "@/components/ui/LoadingState";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { API_BASE } from "@/lib/kivro-api";
import { buyerJobStatusUi } from "@/lib/status-ui";
import Link from "next/link";
import { useEffect, useState } from "react";

type JobRow = {
  id: string;
  capabilityName: string;
  slug: string;
  status: string;
  buyerVisible: { label: string; detail?: string };
  createdAt: string;
};

const BUCKETS = [
  { key: "", label: "All" },
  { key: "running", label: "Running" },
  { key: "queued", label: "Queued" },
  { key: "completed", label: "Completed" },
  { key: "failed", label: "Failed" },
  { key: "cancelled", label: "Cancelled" },
] as const;

type DashboardSummary = {
  scheduled: number;
  queued: number;
  running: number;
  needsAttention: number;
  completedRecent: number;
};

export default function MyJobsPage() {
  const [jobs, setJobs] = useState<JobRow[] | null>(null);
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [bucket, setBucket] = useState("");

  useEffect(() => {
    fetch(`${API_BASE}/buyer/experience/dashboard`, { credentials: "include" })
      .then(async (res) => (res.ok ? ((await res.json()) as { summary: DashboardSummary }) : null))
      .then((data) => data && setSummary(data.summary))
      .catch(() => undefined);

    const qs = bucket ? `?bucket=${encodeURIComponent(bucket)}` : "";
    fetch(`${API_BASE}/buyer/jobs${qs}`, { credentials: "include" })
      .then(async (res) => {
        if (res.status === 401) {
          setError("sign_in");
          return null;
        }
        if (!res.ok) {
          throw new Error("fetch failed");
        }
        return (await res.json()) as { jobs: JobRow[] };
      })
      .then((data) => {
        if (data?.jobs) {
          setJobs(data.jobs);
        }
      })
      .catch(() => setError("load_failed"));
  }, [bucket]);

  if (error === "sign_in") {
    return (
      <>
        <h1>My jobs</h1>
        <p className="meta">
          <Link href="/login">Sign in</Link> to view your job history.
        </p>
      </>
    );
  }

  return (
    <>
      <PageHeader title="My jobs" description="Track queued, running, and completed capability runs." />
      {summary && (
        <p className="meta" style={{ marginBottom: "1rem" }}>
          {summary.running} running · {summary.queued} queued · {summary.scheduled} scheduled
          {summary.needsAttention > 0 ? ` · ${summary.needsAttention} need attention` : ""}
        </p>
      )}
      <div className="nav" style={{ flexWrap: "wrap", marginBottom: "1rem" }}>
        {BUCKETS.map((b) => (
          <button
            key={b.key || "all"}
            type="button"
            className={bucket === b.key ? "button" : "button secondary"}
            onClick={() => setBucket(b.key)}
          >
            {b.label}
          </button>
        ))}
      </div>
      {jobs == null && !error && <LoadingState label="Loading jobs…" />}
      {error === "load_failed" && <p className="meta">Could not load jobs.</p>}
      {jobs?.length === 0 && (
        <EmptyState
          title="No jobs in this view"
          description="Run a capability from Discover or Search to see it here."
          action={{ href: "/search", label: "Search capabilities" }}
        />
      )}
      <ul style={{ listStyle: "none", padding: 0, display: "grid", gap: "0.75rem" }}>
        {jobs?.map((job) => (
          <li key={job.id} className="detail-panel job-list-row">
            <div>
              <Link href={`/jobs/${job.id}`}>
                <strong>{job.capabilityName}</strong>
              </Link>
              <div className="meta">{new Date(job.createdAt).toLocaleString()}</div>
              {job.buyerVisible.detail && <div className="meta">{job.buyerVisible.detail}</div>}
            </div>
            <StatusBadge
              label={job.buyerVisible.label}
              variant={buyerJobStatusUi(job.buyerVisible.label, job.status)}
            />
          </li>
        ))}
      </ul>
    </>
  );
}
