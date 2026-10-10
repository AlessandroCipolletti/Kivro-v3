"use client";

import { Alert } from "@/components/ui/Alert";
import { PageHeader } from "@/components/ui/PageHeader";
import { API_BASE } from "@/lib/kivro-api";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

type Step = {
  id: string;
  status: "complete" | "action_required" | "upcoming";
  title: string;
  detail: string;
};

export default function SellerOnboardingPage() {
  const [steps, setSteps] = useState<Step[]>([]);
  const [pairing, setPairing] = useState<{ code: string; expiresAt: string } | null>(null);
  const [nextAction, setNextAction] = useState<string | null>(null);
  const [firstPublishedAt, setFirstPublishedAt] = useState<string | null>(null);
  const [credentialRefs, setCredentialRefs] = useState<Array<{ refId: string; status: string }>>(
    [],
  );
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    const res = await fetch(`${API_BASE}/seller/onboarding`, { credentials: "include" });
    if (!res.ok) {
      setError("Sign in to continue seller onboarding.");
      return;
    }
    const body = (await res.json()) as {
      steps: Step[];
      nextAction?: string | null;
      firstPublishedAt?: string | null;
      credentialRefs?: Array<{ refId: string; status: string }>;
    };
    setSteps(body.steps);
    setNextAction(body.nextAction ?? null);
    setFirstPublishedAt(body.firstPublishedAt ?? null);
    setCredentialRefs(body.credentialRefs ?? []);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function createPairingCode() {
    setError(null);
    const res = await fetch(`${API_BASE}/worker-devices/pairing-codes`, {
      method: "POST",
      credentials: "include",
    });
    if (!res.ok) {
      setError("Could not create pairing code.");
      return;
    }
    setPairing((await res.json()) as { code: string; expiresAt: string });
  }

  return (
    <div className="page-shell">
      <PageHeader
        title="Seller onboarding"
        description="Pair your Worker, review permissions, and publish your first capability safely."
      />
      {error && <Alert tone="danger">{error}</Alert>}
      {nextAction && (
        <p className="detail-panel">
          Next recommended action: <code>{nextAction}</code>
        </p>
      )}
      {firstPublishedAt && (
        <p className="muted">First published: {new Date(firstPublishedAt).toLocaleString()}</p>
      )}
      {credentialRefs.length > 0 && (
        <ul className="detail-panel">
          {credentialRefs.map((ref) => (
            <li key={ref.refId} className="meta">
              Credential {ref.refId}: {ref.status}
            </li>
          ))}
        </ul>
      )}
      <ol className="form-stack">
        {steps.map((step) => (
          <li key={step.id} className="detail-panel">
            <strong>{step.title}</strong>
            <p>{step.detail}</p>
            <p>
              Status: <code>{step.status}</code>
            </p>
          </li>
        ))}
      </ol>
      <div className="detail-panel form-stack">
        <strong>Pair Worker</strong>
        <p>
          Run on your machine: <code>kivro-worker pair --code YOUR_CODE</code>, then{" "}
          <code>kivro-worker doctor</code> and <code>kivro-worker health</code>.
        </p>
        <button className="button" type="button" onClick={() => void createPairingCode()}>
          Generate pairing code
        </button>
        {pairing && (
          <p>
            Code <code>{pairing.code}</code> (expires {new Date(pairing.expiresAt).toLocaleString()})
          </p>
        )}
      </div>
      <p>
        <Link href="/seller/capabilities/new">Continue to capability wizard →</Link>
      </p>
      <p>
        <Link href="/seller/dashboard">Seller dashboard</Link>
      </p>
    </div>
  );
}
