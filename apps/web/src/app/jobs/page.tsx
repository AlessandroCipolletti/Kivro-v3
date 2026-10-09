"use client";

import { EmptyState } from "@/components/ui/EmptyState";
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

export default function MyJobsPage() {
  const [jobs, setJobs] = useState<JobRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [bucket, setBucket] = useState("");

  useEffect(() => {
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
      {jobs == null && !error && <p className="meta">Loading…</p>}
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
