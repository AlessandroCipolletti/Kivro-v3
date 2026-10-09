"use client";

import { Alert } from "@/components/ui/Alert";
import { API_BASE } from "@/lib/kivro-api";
import { useState } from "react";

const REASONS = [
  { value: "MISLEADING_CAPABILITY", label: "Misleading listing" },
  { value: "MALICIOUS_INPUT", label: "Malicious or unsafe behavior" },
  { value: "SPAM", label: "Spam" },
  { value: "IP_VIOLATION", label: "IP violation" },
  { value: "HARASSMENT", label: "Harassment" },
  { value: "OTHER", label: "Other" },
] as const;

export function AbuseReportForm(props: {
  targetType: "CAPABILITY" | "BUYER" | "SELLER";
  targetId: string;
  capabilityId?: string;
}) {
  const [reason, setReason] = useState<string>(REASONS[0].value);
  const [details, setDetails] = useState("");
  const [status, setStatus] = useState<"idle" | "ok" | "err">("idle");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("idle");
    const res = await fetch(`${API_BASE}/buyer/abuse/report`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        targetType: props.targetType,
        targetId: props.targetId,
        capabilityId: props.capabilityId,
        reason,
        details: details.trim() || undefined,
      }),
    });
    if (res.status === 401) {
      setStatus("err");
      return;
    }
    setStatus(res.ok ? "ok" : "err");
  }

  return (
    <form className="detail-panel form-stack" onSubmit={(e) => void submit(e)}>
      <strong>Report a problem</strong>
      <p className="meta">Flag abuse or policy issues. Reports are reviewed by platform ops.</p>
      {status === "ok" && <Alert tone="info">Report submitted. Thank you.</Alert>}
      {status === "err" && (
        <Alert tone="danger">Could not submit — sign in with a verified email and try again.</Alert>
      )}
      <div className="form-field">
        <label htmlFor="abuse-reason">Reason</label>
        <select
          id="abuse-reason"
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
        <label htmlFor="abuse-details">Details (optional)</label>
        <textarea
          id="abuse-details"
          rows={3}
          maxLength={2000}
          value={details}
          onChange={(e) => setDetails(e.target.value)}
        />
      </div>
      <button type="submit" className="button secondary">
        Submit report
      </button>
    </form>
  );
}
