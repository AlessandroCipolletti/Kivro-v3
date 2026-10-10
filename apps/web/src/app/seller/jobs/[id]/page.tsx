"use client";

import { Alert } from "@/components/ui/Alert";
import { PageHeader } from "@/components/ui/PageHeader";
import { API_BASE } from "@/lib/kivro-api";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

type ExecutionView = {
  jobId: string;
  status: string;
  capabilitySlug: string;
  excludedFromWorkerPayload: string[];
  workerBundle: Record<string, unknown>;
};

export default function SellerJobDetailPage() {
  const params = useParams<{ id: string }>();
  const [view, setView] = useState<ExecutionView | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    const res = await fetch(`${API_BASE}/seller/jobs/${params.id}/execution`, {
      credentials: "include",
    });
    if (res.status === 404) {
      setError("Job not found or not yours.");
      return;
    }
    if (!res.ok) {
      setError("Sign in as a verified seller.");
      return;
    }
    setView((await res.json()) as ExecutionView);
  }, [params.id]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <PageHeader
        title="Job execution view"
        description="Minimized Worker bundle — declared inputs only, no buyer email or payment data."
      />
      <Link href="/seller/dashboard" className="mb-6 inline-block text-sm">
        ← Dashboard
      </Link>
      {error ? <Alert tone="danger">{error}</Alert> : null}
      {view ? (
        <>
          <p className="text-sm text-muted">
            {view.capabilitySlug} · {view.status}
          </p>
          <p className="mt-2 text-xs text-muted">
            Excluded from Worker payload: {view.excludedFromWorkerPayload.join(", ")}
          </p>
          <pre className="mt-4 overflow-x-auto rounded border border-border bg-muted/30 p-3 text-xs">
            {JSON.stringify(view.workerBundle, null, 2)}
          </pre>
        </>
      ) : null}
    </main>
  );
}
