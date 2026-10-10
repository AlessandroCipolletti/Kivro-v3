"use client";

import { Alert } from "@/components/ui/Alert";
import { PageHeader } from "@/components/ui/PageHeader";
import { API_BASE } from "@/lib/kivro-api";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

type Guide = {
  title: string;
  steps: Array<{ id: string; title: string; detail: string; href?: string }>;
};

export default function FirstPublicationGuidePage() {
  const params = useParams<{ id: string }>();
  const [guide, setGuide] = useState<Guide | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const res = await fetch(`${API_BASE}/seller/capabilities/${params.id}/first-publication-guide`, {
      credentials: "include",
    });
    if (!res.ok) {
      setError("Could not load first-publication guide.");
      return;
    }
    setGuide((await res.json()) as Guide);
  }, [params.id]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className="page-shell">
      <PageHeader title="After first publication" description="SELLERUX-039 onboarding steps." />
      {error && <Alert tone="danger">{error}</Alert>}
      {guide && (
        <ol className="form-stack">
          {guide.steps.map((step) => (
            <li key={step.id} className="detail-panel">
              <strong>{step.title}</strong>
              <p>{step.detail}</p>
              {step.href && (
                <Link className="button secondary" href={step.href}>
                  Open
                </Link>
              )}
            </li>
          ))}
        </ol>
      )}
      <p>
        <Link href="/seller/dashboard">Seller dashboard</Link>
      </p>
    </div>
  );
}
