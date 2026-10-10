"use client";

import { Alert } from "@/components/ui/Alert";
import { API_BASE } from "@/lib/kivro-api";
import { useState } from "react";

const REASONS = [
  { value: "WRONG_OUTPUT", label: "Wrong or incomplete output" },
  { value: "MISSING_FILES", label: "Missing files" },
  { value: "QUALITY_ISSUE", label: "Quality issue" },
  { value: "UNSAFE_BEHAVIOR", label: "Unsafe behavior" },
  { value: "OTHER", label: "Other" },
] as const;

export function JobDeliveryFeedback(props: {
  jobId: string;
  canAcknowledge: boolean;
  canReport: boolean;
  acknowledged: boolean;
}) {
  const [reason, setReason] = useState<string>(REASONS[0].value);
  const [details, setDetails] = useState("");
  const [status, setStatus] = useState<"idle" | "ack" | "report" | "err">("idle");

  async function acknowledge() {
    const res = await fetch(`${API_BASE}/buyer/jobs/${props.jobId}/acknowledge`, {
      method: "POST",
      credentials: "include",
    });
    setStatus(res.ok ? "ack" : "err");
  }

  async function report(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch(`${API_BASE}/buyer/jobs/${props.jobId}/problem-report`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reason, details: details.trim() || undefined }),
    });
    setStatus(res.ok ? "report" : "err");
  }

  if (!props.canAcknowledge && !props.canReport && !props.acknowledged) {
    return null;
  }

  return (
    <div className="detail-panel form-stack">
      <strong>Delivery feedback</strong>
      <p className="meta">
        Acknowledgement and reports are support evidence only — they do not automatically change
        payment or settlement.
      </p>
      {props.acknowledged && <Alert tone="info">You marked this result as looks good.</Alert>}
      {status === "ack" && <Alert tone="info">Thanks — marked as looks good.</Alert>}
      {status === "report" && <Alert tone="info">Problem report submitted for review.</Alert>}
      {status === "err" && <Alert tone="danger">Action failed — try again while signed in.</Alert>}
      {props.canAcknowledge && (
        <button type="button" className="button secondary" onClick={() => void acknowledge()}>
          Looks good
        </button>
      )}
      {props.canReport && (
        <form className="form-stack" onSubmit={(e) => void report(e)}>
          <div className="form-field">
            <label htmlFor="problem-reason">Report a problem</label>
            <select
              id="problem-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            >
              {REASONS.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>
          <div className="form-field">
            <label htmlFor="problem-details">Details (optional)</label>
            <textarea
              id="problem-details"
              rows={3}
              maxLength={2000}
              value={details}
              onChange={(e) => setDetails(e.target.value)}
            />
          </div>
          <button type="submit" className="button secondary">
            Submit problem report
          </button>
        </form>
      )}
    </div>
  );
}
