"use client";

import { API_BASE } from "@/lib/kivro-api";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

type JobDetail = {
  id: string;
  capabilityName: string;
  capabilitySlug: string;
  sellerDisplayName: string;
  sellerProfileId: string;
  buyerVisible: { label: string; detail?: string };
  status: string;
  canReview: boolean;
  review: { stars: number; body: string | null } | null;
  result: {
    structuredOutput: unknown;
    hasAssets: boolean;
    assets?: Array<{ id: string; filename: string }>;
  } | null;
  inputSummary: string;
  priceSnapshotCents: number;
  currency: string;
};

type TimelineEntry = { at: string; label: string; detail?: string };

export default function JobDetailPage() {
  const params = useParams<{ id: string }>();
  const [job, setJob] = useState<JobDetail | null>(null);
  const [timeline, setTimeline] = useState<TimelineEntry[]>([]);
  const [stars, setStars] = useState(5);
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${API_BASE}/buyer/jobs/${params.id}`, { credentials: "include" })
      .then(async (res) => {
        if (res.status === 401) {
          setError("sign_in");
          return null;
        }
        if (!res.ok) {
          throw new Error("failed");
        }
        return (await res.json()) as { job: JobDetail; timeline: TimelineEntry[] };
      })
      .then((data) => {
        if (data?.job) {
          setJob(data.job);
          setTimeline(data.timeline);
          if (data.job.review) {
            setStars(data.job.review.stars);
            setBody(data.job.review.body ?? "");
          }
        }
      })
      .catch(() => setError("load_failed"));
  }, [params.id]);

  async function submitReview(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch(`${API_BASE}/buyer/jobs/${params.id}/review`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stars, body: body || undefined }),
    });
    if (res.ok) {
      const detail = await fetch(`${API_BASE}/buyer/jobs/${params.id}`, {
        credentials: "include",
      });
      if (detail.ok) {
        const parsed = (await detail.json()) as { job: JobDetail };
        setJob(parsed.job);
      }
    }
  }

  if (error === "sign_in") {
    return (
      <>
        <h1>Job</h1>
        <p className="meta">
          <Link href="/login">Sign in</Link> to view this job.
        </p>
      </>
    );
  }

  if (!job && !error) {
    return <p className="meta">Loading…</p>;
  }
  if (!job) {
    return <p className="meta">Job not found.</p>;
  }

  return (
    <>
      <p className="meta">
        <Link href="/jobs">← My jobs</Link>
      </p>
      <h1>{job.capabilityName}</h1>
      <p className="meta">
        <Link href={`/sellers/${job.sellerProfileId}`}>{job.sellerDisplayName}</Link> ·{" "}
        {job.buyerVisible.label}
      </p>
      {job.buyerVisible.detail && <p className="meta">{job.buyerVisible.detail}</p>}
      {job.inputSummary && (
        <div className="detail-panel">
          <strong>Inputs</strong>
          <p className="meta">{job.inputSummary}</p>
        </div>
      )}
      {job.result && (
        <div className="detail-panel">
          <strong>Result</strong>
          {job.result.structuredOutput != null && (
            <pre style={{ overflow: "auto", fontSize: "0.85rem" }}>
              {JSON.stringify(job.result.structuredOutput, null, 2)}
            </pre>
          )}
          {job.result.assets?.map((asset) => (
            <p key={asset.id} style={{ marginTop: "0.5rem" }}>
              <button
                type="button"
                className="button secondary"
                onClick={() => {
                  void fetch(
                    `${API_BASE}/buyer/jobs/${params.id}/assets/${asset.id}/download`,
                    { credentials: "include" },
                  )
                    .then(async (res) => {
                      if (!res.ok) {
                        return;
                      }
                      const body = (await res.json()) as { downloadUrl?: string };
                      if (body.downloadUrl) {
                        window.open(body.downloadUrl, "_blank", "noopener,noreferrer");
                      }
                    })
                    .catch(() => undefined);
                }}
              >
                Download {asset.filename}
              </button>
            </p>
          ))}
        </div>
      )}
      <div className="detail-panel">
        <strong>Timeline</strong>
        <ul style={{ paddingLeft: "1.1rem" }}>
          {timeline.map((t) => (
            <li key={t.at + t.label} className="meta">
              {new Date(t.at).toLocaleString()} — {t.label}
              {t.detail ? ` (${t.detail})` : ""}
            </li>
          ))}
        </ul>
      </div>
      {(job.canReview || job.review) && (
        <form className="detail-panel form-stack" onSubmit={(e) => void submitReview(e)}>
          <strong>Review</strong>
          <div className="form-field">
            <label className="field-label" htmlFor="stars">
              Stars (1–5)
            </label>
            <input
              id="stars"
              type="number"
              min={1}
              max={5}
              value={stars}
              onChange={(e) => setStars(Number(e.target.value))}
              disabled={!job.canReview && Boolean(job.review)}
            />
          </div>
          <div className="form-field">
            <label className="field-label" htmlFor="review-body">
              Comment (optional)
            </label>
            <textarea
              id="review-body"
              rows={3}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              disabled={!job.canReview && Boolean(job.review)}
            />
          </div>
          {job.canReview && (
            <div className="form-actions">
              <button className="button" type="submit">
                Submit review
              </button>
            </div>
          )}
        </form>
      )}
      <p style={{ marginTop: "1rem" }}>
        <Link className="button secondary" href={`/capabilities/${job.capabilitySlug}/run`}>
          Run again
        </Link>
      </p>
    </>
  );
}
