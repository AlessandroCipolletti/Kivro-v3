"use client";

import { Alert } from "@/components/ui/Alert";
import { API_BASE } from "@/lib/kivro-api";
import Link from "next/link";
import { useState } from "react";

export function MarketplaceTermsGate(props: { onAccepted?: () => void }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  async function accept() {
    setLoading(true);
    setError(false);
    const res = await fetch(`${API_BASE}/auth/accept-marketplace-terms`, {
      method: "POST",
      credentials: "include",
    });
    setLoading(false);
    if (!res.ok) {
      setError(true);
      return;
    }
    props.onAccepted?.();
  }

  return (
    <div className="detail-panel form-stack">
      <strong>Marketplace terms</strong>
      <p className="meta">
        Paid jobs require accepting our{" "}
        <Link href="/legal/terms">Terms</Link>,{" "}
        <Link href="/legal/privacy">Privacy</Link>, and{" "}
        <Link href="/legal/aup">Acceptable use</Link> (alpha drafts).
      </p>
      {error && <Alert tone="danger">Could not record acceptance. Sign in and retry.</Alert>}
      <button type="button" className="button" disabled={loading} onClick={() => void accept()}>
        {loading ? "Saving…" : "I accept — continue"}
      </button>
    </div>
  );
}
