"use client";

import { BuyerInputForm, type BuyerFormField } from "@/components/BuyerInputForm";
import { MarketplaceTermsGate } from "@/components/MarketplaceTermsGate";
import { Alert } from "@/components/ui/Alert";
import { LoadingState } from "@/components/ui/LoadingState";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { API_BASE } from "@/lib/kivro-api";
import { marketplaceAvailabilityUi } from "@/lib/status-ui";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function RunCapabilityPage() {
  const params = useParams<{ slug: string }>();
  const router = useRouter();
  const [fields, setFields] = useState<BuyerFormField[] | null>(null);
  const [capabilityId, setCapabilityId] = useState<string | null>(null);
  const [priceLabel, setPriceLabel] = useState<string | null>(null);
  const [accepting, setAccepting] = useState(true);
  const [nextAvailableAt, setNextAvailableAt] = useState<string | null>(null);
  const [scheduledRunAt, setScheduledRunAt] = useState("");
  const [useJson, setUseJson] = useState(false);
  const [inputsJson, setInputsJson] = useState("{}");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [termsRequired, setTermsRequired] = useState(false);

  useEffect(() => {
    fetch(`${API_BASE}/auth/me`, { credentials: "include" })
      .then(async (res) => {
        if (!res.ok) {
          return null;
        }
        return (await res.json()) as { marketplaceTermsAcceptedAt?: string | null };
      })
      .then((me) => {
        setTermsRequired(!me?.marketplaceTermsAcceptedAt);
      })
      .catch(() => undefined);

    fetch(`${API_BASE}/capabilities/${params.slug}`)
      .then(async (res) => {
        if (!res.ok) {
          throw new Error("not found");
        }
        return (await res.json()) as {
          capability: { id: string; priceTierCents: number | null; currency: string };
          buyerForm?: { fields: BuyerFormField[] };
          availability?: { accepting: boolean; nextAvailableAt: string | null };
        };
      })
      .then((detail) => {
        setCapabilityId(detail.capability.id);
        const cents = detail.capability.priceTierCents;
        if (cents != null) {
          setPriceLabel(
            new Intl.NumberFormat("en-US", {
              style: "currency",
              currency: detail.capability.currency || "USD",
            }).format(cents / 100),
          );
        }
        setAccepting(detail.availability?.accepting !== false);
        setNextAvailableAt(detail.availability?.nextAvailableAt ?? null);
        if (detail.buyerForm?.fields?.length) {
          setFields(detail.buyerForm.fields);
        } else {
          setUseJson(true);
        }
      })
      .catch(() => setError("Could not load capability form"));
  }, [params.slug]);

  async function submitInputs(inputs: Record<string, unknown>) {
    if (!capabilityId) {
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const payload: Record<string, unknown> = { capabilityId, inputs, paymentMode: "credits" };
      if (!accepting && scheduledRunAt) {
        payload.scheduledRunAt = new Date(scheduledRunAt).toISOString();
      }
      const res = await fetch(`${API_BASE}/buyer/jobs`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const body = (await res.json()) as { error?: string; jobId?: string };
      if (!res.ok) {
        if (body.error === "MARKETPLACE_TERMS_REQUIRED") {
          setTermsRequired(true);
          setError(null);
          return;
        }
        setError(body.error ?? "Submit failed");
        return;
      }
      router.push(body.jobId ? `/jobs/${body.jobId}` : "/jobs");
    } finally {
      setLoading(false);
    }
  }

  async function submitJson(e: React.FormEvent) {
    e.preventDefault();
    let inputs: Record<string, unknown> = {};
    try {
      inputs = JSON.parse(inputsJson) as Record<string, unknown>;
    } catch {
      setError("Inputs must be valid JSON");
      return;
    }
    await submitInputs(inputs);
  }

  const availUi = marketplaceAvailabilityUi({
    status: accepting ? "ONLINE" : "OFFLINE",
    accepting,
  });

  if (!capabilityId && !error) {
    return <LoadingState label="Loading checkout…" />;
  }

  return (
    <>
      <PageHeader
        title="Run job"
        description={
          <>
            Signed in with verified email and credits required.
            {priceLabel && (
              <>
                {" "}
                Price at submit: <strong>{priceLabel}</strong>
              </>
            )}
          </>
        }
        actions={<StatusBadge label={availUi.label} variant={availUi.variant} />}
      />
      {termsRequired && (
        <MarketplaceTermsGate
          onAccepted={() => {
            setTermsRequired(false);
          }}
        />
      )}
      {!accepting && (
        <div className="detail-panel form-stack">
          <Alert tone="warning">
            Not accepting immediate runs
            {nextAvailableAt ? ` until ${new Date(nextAvailableAt).toLocaleString()}` : ""}. Schedule
            below or return later.
          </Alert>
          <div className="form-field">
            <label className="field-label" htmlFor="schedule">
              Schedule run
            </label>
            <input
              id="schedule"
              type="datetime-local"
              value={scheduledRunAt}
              onChange={(e) => setScheduledRunAt(e.target.value)}
            />
          </div>
        </div>
      )}
      {error && <Alert tone="danger">{error}</Alert>}
      {fields && !useJson && (
        <div className="detail-panel">
          <BuyerInputForm fields={fields} loading={loading} onSubmit={submitInputs} />
          <p className="meta" style={{ marginTop: "1rem" }}>
            <button className="button secondary" type="button" onClick={() => setUseJson(true)}>
              Use JSON instead
            </button>
          </p>
        </div>
      )}
      {(useJson || !fields) && (
        <form
          className="detail-panel form-stack"
          onSubmit={(e) => {
            void submitJson(e);
          }}
        >
          <div className="form-field">
            <label className="field-label" htmlFor="inputs">
              Inputs (JSON)
            </label>
            <textarea
              id="inputs"
              rows={8}
              className="input-mono"
              value={inputsJson}
              onChange={(e) => setInputsJson(e.target.value)}
            />
          </div>
          <div className="form-actions">
            <button className="button" type="submit" disabled={loading}>
              {loading ? "Submitting…" : "Submit with credits"}
            </button>
            {fields && (
              <button className="button secondary" type="button" onClick={() => setUseJson(false)}>
                Use form
              </button>
            )}
            <Link className="button secondary" href={`/capabilities/${params.slug}`}>
              Back
            </Link>
          </div>
        </form>
      )}
    </>
  );
}
