"use client";

import { AbuseReportForm } from "@/components/AbuseReportForm";
import { JobDeliveryFeedback } from "@/components/JobDeliveryFeedback";
import { SemanticResultPanel } from "@/components/SemanticResultPanel";
import { Alert } from "@/components/ui/Alert";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { API_BASE } from "@/lib/kivro-api";
import { buyerJobStatusUi } from "@/lib/status-ui";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

type JobDetail = {
  id: string;
  capabilityId?: string;
  capabilityName: string;
  capabilitySlug: string;
  sellerDisplayName: string;
  sellerProfileId: string;
  buyerVisible: { label: string; detail?: string };
  status: string;
  canReview: boolean;
  review: { stars: number; body: string | null } | null;
  resultRetentionExpiresAt?: string | null;
  resultRetentionExpired?: boolean;
  timingEstimate?: {
    confidence: string;
    disclaimer: string;
    completeEarliestAt: string | null;
    completeLatestAt: string | null;
  };
  legalActions?: string[];
  progress?: Array<{ stageLabel: string; recordedAt: string }>;
  missedWindow?: { missed: boolean; headline?: string; detail?: string };
  result: {
    structuredOutput: unknown;
    hasAssets: boolean;
    assets?: Array<{ id: string; filename: string }>;
    retentionExpired?: boolean;
    downloadAllowed?: boolean;
    downloadAllAllowed?: boolean;
  } | null;
  inputSummary: string;
  inputSnapshot?: { fields: Array<{ key: string; label: string; displayValue: string }> };
  purchaseSnapshot?: {
    versionNumber: number;
    priceSnapshotCents: number;
    currency: string;
    immutableNote: string;
  };
  retentionUx?: { headline: string; downloadAllowed: boolean };
  semanticResult?: { fields: Array<{ key: string; label: string; presentation: string; displayText?: string; url?: string; assetRefs?: Array<{ id: string; filename: string }>; previewMode: "inline" | "download_only" }> } | null;
  resultAcknowledged?: boolean;
  canAcknowledgeResult?: boolean;
  canReportResultProblem?: boolean;
  canReuse?: boolean;
  priceSnapshotCents: number;
  currency: string;
  versionNumber?: number;
};

type TimelineEntry = { at: string; label: string; detail?: string };

type AuditSummary = { lines: string[] };

export default function JobDetailPage() {
  const params = useParams<{ id: string }>();
  const [job, setJob] = useState<JobDetail | null>(null);
  const [timeline, setTimeline] = useState<TimelineEntry[]>([]);
  const [stars, setStars] = useState(5);
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [auditSummary, setAuditSummary] = useState<AuditSummary | null>(null);
  const [bundleError, setBundleError] = useState<string | null>(null);

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
        return (await res.json()) as {
          job: JobDetail;
          timeline: TimelineEntry[];
          auditSummary?: AuditSummary;
        };
      })
      .then((data) => {
        if (data?.job) {
          setJob(data.job);
          setTimeline(data.timeline);
          setAuditSummary(data.auditSummary ?? null);
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

  async function downloadAsset(assetId: string) {
    const res = await fetch(`${API_BASE}/buyer/jobs/${params.id}/assets/${assetId}/download`, {
      credentials: "include",
    });
    if (!res.ok) {
      return;
    }
    const body = (await res.json()) as { downloadUrl?: string };
    if (body.downloadUrl) {
      window.open(body.downloadUrl, "_blank", "noopener,noreferrer");
    }
  }

  return (
    <>
      <p className="meta">
        <Link href="/jobs">← My jobs</Link>
      </p>
      <PageHeader
        title={job.capabilityName}
        description={
          <>
            <Link href={`/sellers/${job.sellerProfileId}`}>{job.sellerDisplayName}</Link>
          </>
        }
        actions={
          <StatusBadge
            label={job.buyerVisible.label}
            variant={buyerJobStatusUi(job.buyerVisible.label, job.status)}
          />
        }
      />
      {job.buyerVisible.detail && <p className="meta">{job.buyerVisible.detail}</p>}
      {job.timingEstimate && (
        <p className="meta">
          Timing confidence: {job.timingEstimate.confidence}. {job.timingEstimate.disclaimer}
        </p>
      )}
      {job.missedWindow?.missed && (
        <div className="detail-panel">
          <strong>{job.missedWindow.headline}</strong>
          <p className="meta">{job.missedWindow.detail}</p>
        </div>
      )}
      {job.legalActions?.includes("cancel") && (
        <p style={{ marginTop: "0.75rem" }}>
          <button
            type="button"
            className="button secondary"
            onClick={() => {
              void fetch(`${API_BASE}/buyer/jobs/${params.id}/cancel`, {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ reason: "BUYER_CANCELLED" }),
              }).then(() => window.location.reload());
            }}
          >
            Cancel before start
          </button>
        </p>
      )}
      {job.progress && job.progress.length > 0 && (
        <div className="detail-panel">
          <strong>Progress</strong>
          <ul className="meta">
            {job.progress.map((p) => (
              <li key={`${p.recordedAt}-${p.stageLabel}`}>
                {p.stageLabel} — {new Date(p.recordedAt).toLocaleString()}
              </li>
            ))}
          </ul>
        </div>
      )}
      {job.purchaseSnapshot && (
        <div className="detail-panel">
          <strong>Purchase snapshot</strong>
          <p className="meta">
            Version {job.purchaseSnapshot.versionNumber} —{" "}
            {new Intl.NumberFormat("en-US", {
              style: "currency",
              currency: job.purchaseSnapshot.currency,
            }).format(job.purchaseSnapshot.priceSnapshotCents / 100)}
          </p>
          <p className="meta">{job.purchaseSnapshot.immutableNote}</p>
        </div>
      )}
      {job.inputSnapshot && job.inputSnapshot.fields.length > 0 && (
        <div className="detail-panel">
          <strong>Submitted inputs (historical)</strong>
          <ul className="meta">
            {job.inputSnapshot.fields.map((f) => (
              <li key={f.key}>
                {f.label}: {f.displayValue}
              </li>
            ))}
          </ul>
        </div>
      )}
      {job.retentionUx && <p className="meta">{job.retentionUx.headline}</p>}
      {job.result && (
        <div className="detail-panel">
          <strong>Result</strong>
          {job.result.retentionExpired && (
            <p className="meta">Downloads expired — contact support if you need a copy.</p>
          )}
          {job.semanticResult?.fields?.length ? (
            <SemanticResultPanel
              fields={job.semanticResult.fields}
              jobId={params.id}
              downloadAllowed={Boolean(job.result.downloadAllowed)}
              onDownloadAsset={(id) => void downloadAsset(id)}
            />
          ) : (
            job.result.structuredOutput != null && (
              <pre className="pre-block font-mono">
                {typeof job.result.structuredOutput === "string"
                  ? job.result.structuredOutput
                  : JSON.stringify(job.result.structuredOutput, null, 2)}
              </pre>
            )
          )}
          {bundleError && (
            <Alert tone="warning">
              {bundleError} Individual file downloads remain available below.
            </Alert>
          )}
          {job.result.downloadAllAllowed && (
            <p style={{ marginTop: "0.75rem" }}>
              <button
                type="button"
                className="button secondary"
                onClick={() => {
                  setBundleError(null);
                  void fetch(`${API_BASE}/buyer/jobs/${params.id}/assets/download-all`, {
                    credentials: "include",
                  })
                    .then(async (res) => {
                      if (!res.ok) {
                        const body = (await res.json().catch(() => ({}))) as { error?: string };
                        setBundleError(body.error ?? "Bundle download failed");
                        return;
                      }
                      const blob = await res.blob();
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement("a");
                      a.href = url;
                      a.download = `job-${params.id.slice(0, 8)}-deliverables.zip`;
                      a.click();
                      URL.revokeObjectURL(url);
                    })
                    .catch(() => undefined);
                }}
              >
                Download all files
              </button>
            </p>
          )}
        </div>
      )}
      <JobDeliveryFeedback
        jobId={params.id}
        canAcknowledge={Boolean(job.canAcknowledgeResult)}
        canReport={Boolean(job.canReportResultProblem)}
        acknowledged={Boolean(job.resultAcknowledged)}
      />
      {auditSummary && auditSummary.lines.length > 0 && (
        <div className="detail-panel">
          <strong>Audit summary</strong>
          <pre className="pre-block font-mono" style={{ whiteSpace: "pre-wrap" }}>
            {auditSummary.lines.join("\n")}
          </pre>
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
      {job.capabilityId && !job.canReportResultProblem && (
        <AbuseReportForm
          targetType="CAPABILITY"
          targetId={job.capabilityId}
          capabilityId={job.capabilityId}
        />
      )}
      {job.canReuse && (
        <p style={{ marginTop: "1rem", display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          <Link
            className="button secondary"
            href={`/capabilities/${job.capabilitySlug}/run?fromJob=${params.id}&mode=run_again`}
          >
            Run again
          </Link>
          <Link
            className="button secondary"
            href={`/capabilities/${job.capabilitySlug}/run?fromJob=${params.id}&mode=duplicate_edit`}
          >
            Duplicate &amp; edit
          </Link>
        </p>
      )}
    </>
  );
}
