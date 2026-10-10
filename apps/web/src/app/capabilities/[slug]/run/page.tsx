"use client";

import { BuyerInputForm, type BuyerFormField } from "@/components/BuyerInputForm";
import { MarketplaceTermsGate } from "@/components/MarketplaceTermsGate";
import { Alert } from "@/components/ui/Alert";
import { LoadingState } from "@/components/ui/LoadingState";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { API_BASE } from "@/lib/kivro-api";
import { approximateStartLabel, formatBuyerLocalTime, marketplaceAvailabilityUi } from "@/lib/status-ui";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function RunCapabilityPage() {
  const params = useParams<{ slug: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const fromJobId = searchParams.get("fromJob");
  const reuseMode = searchParams.get("mode") === "duplicate_edit" ? "duplicate_edit" : "run_again";
  const [reuseNote, setReuseNote] = useState<string | null>(null);
  const [prefillInputs, setPrefillInputs] = useState<Record<string, unknown> | null>(null);
  const [prefillAssets, setPrefillAssets] = useState<Record<string, unknown> | null>(null);
  const [fields, setFields] = useState<BuyerFormField[] | null>(null);
  const [capabilityId, setCapabilityId] = useState<string | null>(null);
  const [priceLabel, setPriceLabel] = useState<string | null>(null);
  const [accepting, setAccepting] = useState(true);
  const [nextAvailableAt, setNextAvailableAt] = useState<string | null>(null);
  const [purchaseLabel, setPurchaseLabel] = useState<string | null>(null);
  const [paymentNotice, setPaymentNotice] = useState<string | null>(null);
  const [scheduledRunAt, setScheduledRunAt] = useState("");
  const [hardDeadline, setHardDeadline] = useState("");
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
          availability?: {
            accepting: boolean;
            nextAvailableAt: string | null;
            purchaseLabel?: string;
            scheduleQuote?: { paymentNotice: string; earliestExecutionLabel: string } | null;
          };
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
        setPurchaseLabel(detail.availability?.purchaseLabel ?? null);
        setPaymentNotice(detail.availability?.scheduleQuote?.paymentNotice ?? null);
        const nextAt = detail.availability?.nextAvailableAt ?? null;
        setNextAvailableAt(nextAt);
        if (searchParams.get("schedule") === "earliest" && nextAt) {
          const when = new Date(nextAt);
          if (!Number.isNaN(when.getTime())) {
            const pad = (n: number) => String(n).padStart(2, "0");
            setScheduledRunAt(
              `${when.getFullYear()}-${pad(when.getMonth() + 1)}-${pad(when.getDate())}T${pad(when.getHours())}:${pad(when.getMinutes())}`,
            );
          }
        }
        if (detail.buyerForm?.fields?.length) {
          setFields(detail.buyerForm.fields);
        } else {
          setUseJson(true);
        }
      })
      .catch(() => setError("Could not load capability form"));
  }, [params.slug, searchParams]);

  useEffect(() => {
    if (!fromJobId) {
      return;
    }
    fetch(`${API_BASE}/buyer/jobs/${fromJobId}/reuse?mode=${reuseMode}`, {
      credentials: "include",
    })
      .then(async (res) => {
        if (!res.ok) {
          return null;
        }
        return (await res.json()) as {
          reuse: {
            disclaimer: string;
            prefilledInputs: Record<string, unknown>;
            prefilledAssets: Record<string, unknown>;
            requiresAssetReplacement: boolean;
            current: { priceChanged: boolean; versionChanged: boolean; priceSnapshotCents: number; currency: string };
          };
        };
      })
      .then((data) => {
        if (!data?.reuse) {
          return;
        }
        setPrefillInputs(data.reuse.prefilledInputs);
        setPrefillAssets(data.reuse.prefilledAssets);
        setInputsJson(JSON.stringify(data.reuse.prefilledInputs, null, 2));
        const parts = [data.reuse.disclaimer];
        if (data.reuse.requiresAssetReplacement) {
          parts.push("Some previous upload files expired or are unavailable — re-upload files before paying.");
        }
        if (data.reuse.current.versionChanged || data.reuse.current.priceChanged) {
          parts.push(
            `Current listing: ${new Intl.NumberFormat("en-US", {
              style: "currency",
              currency: data.reuse.current.currency,
            }).format(data.reuse.current.priceSnapshotCents / 100)} (new quote required at submit).`,
          );
        }
        setReuseNote(parts.join(" "));
      })
      .catch(() => undefined);
  }, [fromJobId, reuseMode]);

  async function submitInputs(inputs: Record<string, unknown>) {
    if (!capabilityId) {
      return;
    }
    setError(null);
    setLoading(true);
    const assetsPayload =
      prefillAssets && Object.keys(prefillAssets).length > 0 ? prefillAssets : undefined;
    try {
      const quoteRes = await fetch(`${API_BASE}/buyer/experience/quote`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          capabilityId,
          inputs,
          assets: assetsPayload,
          scheduledRunAt: !accepting && scheduledRunAt ? new Date(scheduledRunAt).toISOString() : undefined,
          hardDeliveryDeadlineAt: hardDeadline ? new Date(hardDeadline).toISOString() : undefined,
        }),
      });
      const quoteBody = (await quoteRes.json()) as { error?: string; quoteId?: string };
      if (!quoteRes.ok || !quoteBody.quoteId) {
        setError(quoteBody.error ?? "Quote failed");
        return;
      }
      const preflight = (quoteBody as { preflight?: { accepting?: boolean; reasons?: string[] } })
        .preflight;
      if (preflight && preflight.accepting === false) {
        setError(preflight.reasons?.join(", ") ?? "Preflight blocked this purchase");
        return;
      }
      const payload: Record<string, unknown> = {
        capabilityId,
        inputs,
        assets: assetsPayload,
        paymentMode: "credits",
        executionQuoteId: quoteBody.quoteId,
      };
      if (!accepting && scheduledRunAt) {
        payload.scheduledRunAt = new Date(scheduledRunAt).toISOString();
      }
      if (hardDeadline) {
        payload.hardDeliveryDeadlineAt = new Date(hardDeadline).toISOString();
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
        title={purchaseLabel ?? (accepting ? "Run now" : "Schedule for earliest availability")}
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
          <Alert tone="info">
            This service is not running right now. You can reserve it for its next availability.
            {nextAvailableAt
              ? ` Eligible to start from ${
                  formatBuyerLocalTime(
                    nextAvailableAt,
                    Intl.DateTimeFormat().resolvedOptions().timeZone,
                  ) ?? "the next published window"
                }. Your local time. ${approximateStartLabel(new Date(), new Date(nextAvailableAt))}.`
              : ""}{" "}
            {paymentNotice ??
              "Your payment will be secured now. The job will execute when the capability becomes available."}{" "}
            Credits stay reserved and are released if the job never starts. The time after start is an
            estimate, not a guaranteed minute.
          </Alert>
          <div className="form-field">
            <label className="field-label" htmlFor="deadline">
              Hard delivery deadline (optional)
            </label>
            <input
              id="deadline"
              type="datetime-local"
              value={hardDeadline}
              onChange={(e) => setHardDeadline(e.target.value)}
            />
            <p className="meta">Kivro checks feasibility; estimates are not guaranteed SLAs.</p>
          </div>
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
      {reuseNote && <Alert tone="info">{reuseNote}</Alert>}
      {error && <Alert tone="danger">{error}</Alert>}
      {fields && !useJson && (
        <div className="detail-panel">
          <BuyerInputForm
            key={fromJobId ? `reuse-${fromJobId}-${reuseMode}` : "fresh"}
            fields={fields}
            loading={loading}
            initialValues={prefillInputs ?? undefined}
            onSubmit={submitInputs}
          />
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
              {loading ? "Submitting…" : (purchaseLabel ?? (accepting ? "Run now" : "Schedule for earliest availability"))}
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
