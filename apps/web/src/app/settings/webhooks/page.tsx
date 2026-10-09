"use client";

import { Alert } from "@/components/ui/Alert";
import { CopySecretOnce } from "@/components/ui/CopySecretOnce";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatusBadge } from "@/components/ui/StatusBadge";
import {
  createBuyerWebhook,
  disableBuyerWebhook,
  fetchBuyerWebhooks,
  fetchWebhookDeliveries,
  type WebhookEndpointRow,
} from "@/lib/kivro-api";
import { useCallback, useEffect, useState } from "react";

const DEFAULT_EVENTS = ["job.completed", "job.failed", "job.started", "job.cancelled"];

export default function WebhooksSettingsPage() {
  const [endpoints, setEndpoints] = useState<WebhookEndpointRow[] | null>(null);
  const [url, setUrl] = useState("");
  const [newSecret, setNewSecret] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [deliveriesFor, setDeliveriesFor] = useState<string | null>(null);
  const [deliveries, setDeliveries] = useState<
    Array<{ id: string; eventType: string; success: boolean; statusCode: number | null; createdAt: string }>
  >([]);

  const load = useCallback(async () => {
    setError(null);
    const result = await fetchBuyerWebhooks();
    if ("error" in result) {
      setEndpoints(null);
      setError(result.error === "UNAUTHORIZED" ? "sign_in" : "load_failed");
      return;
    }
    setEndpoints(result.endpoints);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function onCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!url.trim()) {
      return;
    }
    setBusy(true);
    setNewSecret(null);
    const result = await createBuyerWebhook({ url: url.trim(), events: DEFAULT_EVENTS });
    setBusy(false);
    if ("error" in result) {
      setError(result.error);
      return;
    }
    setNewSecret(result.secret);
    setUrl("");
    await load();
  }

  async function onShowDeliveries(id: string) {
    if (deliveriesFor === id) {
      setDeliveriesFor(null);
      return;
    }
    setDeliveriesFor(id);
    const result = await fetchWebhookDeliveries(id);
    if ("error" in result) {
      setError("Could not load delivery log.");
      return;
    }
    setDeliveries(result.deliveries);
  }

  async function onDisable(id: string) {
    if (!window.confirm("Disable this webhook endpoint?")) {
      return;
    }
    setBusy(true);
    const result = await disableBuyerWebhook(id);
    setBusy(false);
    if ("error" in result) {
      setError("Could not disable endpoint.");
      return;
    }
    await load();
  }

  if (error === "sign_in") {
    return (
      <EmptyState
        title="Sign in required"
        description="Verify your email to register HTTPS webhook endpoints for job events."
        action={{ href: "/login", label: "Sign in" }}
      />
    );
  }

  return (
    <>
      <PageHeader
        title="Webhooks"
        description="Receive signed POST requests when jobs start, complete, fail, or cancel."
      />
      {error && error !== "sign_in" && <Alert tone="danger">{error}</Alert>}
      {newSecret && (
        <Alert tone="warning">
          <CopySecretOnce secret={newSecret}>
            <strong>Webhook signing secret</strong> — store it to verify{" "}
            <code className="font-mono">Marketplace-Signature</code>.
          </CopySecretOnce>
        </Alert>
      )}
      <form className="detail-panel form-stack" onSubmit={(e) => void onCreate(e)}>
        <div className="form-field">
          <label className="field-label" htmlFor="webhook-url">
            HTTPS URL
          </label>
          <input
            id="webhook-url"
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com/kivro/webhook"
            required
          />
          <p className="field-hint">Events: {DEFAULT_EVENTS.join(", ")}</p>
        </div>
        <div className="form-actions">
          <Button type="submit" disabled={busy}>
            Add endpoint
          </Button>
        </div>
      </form>
      {endpoints == null && !error && <p className="meta">Loading…</p>}
      {endpoints?.length === 0 && (
        <EmptyState
          title="No webhook endpoints"
          description="Add a URL to continue automation when long-running jobs finish without polling."
        />
      )}
      {endpoints && endpoints.length > 0 && (
        <ul style={{ listStyle: "none", padding: 0, display: "grid", gap: "0.75rem", marginTop: "1rem" }}>
          {endpoints.map((ep) => (
            <li key={ep.id} className="detail-panel">
              <div className="job-list-row">
                <div>
                  <p className="font-mono" style={{ margin: "0 0 0.35rem", wordBreak: "break-all" }}>
                    {ep.url}
                  </p>
                  <p className="meta">
                    {ep.events.join(", ")} · Failures {ep.failureCount}
                  </p>
                </div>
                <StatusBadge
                  label={ep.enabled ? "Active" : "Disabled"}
                  variant={ep.enabled ? "success" : "neutral"}
                />
              </div>
              <div className="form-actions" style={{ marginTop: "0.75rem" }}>
                <Button variant="secondary" disabled={busy} onClick={() => void onShowDeliveries(ep.id)}>
                  {deliveriesFor === ep.id ? "Hide deliveries" : "Recent deliveries"}
                </Button>
                {ep.enabled && (
                  <Button variant="danger" disabled={busy} onClick={() => void onDisable(ep.id)}>
                    Disable
                  </Button>
                )}
              </div>
              {deliveriesFor === ep.id && (
                <ul style={{ margin: "0.75rem 0 0", paddingLeft: "1.1rem" }}>
                  {deliveries.length === 0 && <li className="meta">No delivery attempts yet.</li>}
                  {deliveries.map((d) => (
                    <li key={d.id} className="meta">
                      {new Date(d.createdAt).toLocaleString()} — {d.eventType}{" "}
                      {d.success ? "OK" : `failed (${d.statusCode ?? "—"})`}
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
