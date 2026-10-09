"use client";

import { Alert } from "@/components/ui/Alert";
import { CopySecretOnce } from "@/components/ui/CopySecretOnce";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageHeader } from "@/components/ui/PageHeader";
import {
  createBuyerApiKey,
  fetchBuyerApiKeys,
  revokeBuyerApiKey,
  type BuyerApiKeyRow,
} from "@/lib/kivro-api";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

export default function ApiKeysSettingsPage() {
  const [keys, setKeys] = useState<BuyerApiKeyRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [newSecret, setNewSecret] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setError(null);
    const result = await fetchBuyerApiKeys();
    if ("error" in result) {
      setKeys(null);
      setError(result.error === "UNAUTHORIZED" ? "sign_in" : "load_failed");
      return;
    }
    setKeys(result.keys);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function onCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      return;
    }
    setBusy(true);
    setNewSecret(null);
    const result = await createBuyerApiKey({ name: name.trim() });
    setBusy(false);
    if ("error" in result) {
      setError(result.error);
      return;
    }
    setNewSecret(result.secret);
    setName("");
    await load();
  }

  async function onRevoke(id: string) {
    if (!window.confirm("Revoke this API key? Integrations using it will stop working.")) {
      return;
    }
    setBusy(true);
    const result = await revokeBuyerApiKey(id);
    setBusy(false);
    if ("error" in result) {
      setError("Revoke failed.");
      return;
    }
    await load();
  }

  if (error === "sign_in") {
    return (
      <EmptyState
        title="Sign in required"
        description="Verify your email, then return here to manage programmatic API keys."
        action={{ href: "/login", label: "Sign in" }}
      />
    );
  }

  return (
    <>
      <PageHeader
        title="API keys"
        description="Create keys for the REST v1 API. Secrets are shown once at creation."
      />
      {error && error !== "sign_in" && <Alert tone="danger">{error}</Alert>}
      {newSecret && (
        <Alert tone="warning">
          <CopySecretOnce secret={newSecret}>
            <strong>Copy this secret now.</strong> It will not be shown again.
          </CopySecretOnce>
        </Alert>
      )}
      <form className="detail-panel form-stack" onSubmit={(e) => void onCreate(e)}>
        <div className="form-field">
          <label className="field-label" htmlFor="key-name">
            Key name
          </label>
          <input
            id="key-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Production automation"
            required
          />
        </div>
        <div className="form-actions">
          <Button type="submit" disabled={busy}>
            Create API key
          </Button>
        </div>
      </form>
      {keys == null && !error && <p className="meta">Loading…</p>}
      {keys?.length === 0 && (
        <EmptyState
          title="No API keys"
          description="Create a key to call GET /v1/capabilities and POST jobs from your automation."
        />
      )}
      {keys && keys.length > 0 && (
        <ul style={{ listStyle: "none", padding: 0, display: "grid", gap: "0.75rem", marginTop: "1rem" }}>
          {keys.map((key) => (
            <li key={key.id} className="detail-panel">
              <strong>{key.name}</strong>
              <p className="meta font-mono">{key.prefix}…</p>
              <p className="meta">
                Scopes: {key.scopes.join(", ")} · Created {new Date(key.createdAt).toLocaleDateString()}
                {key.lastUsedAt && ` · Last used ${new Date(key.lastUsedAt).toLocaleString()}`}
              </p>
              <div className="form-actions">
                <Button variant="danger" disabled={busy} onClick={() => void onRevoke(key.id)}>
                  Revoke
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
      <p className="meta" style={{ marginTop: "1.5rem" }}>
        API reference:{" "}
        <a href={`${process.env.NEXT_PUBLIC_KIVRO_API_URL ?? "http://localhost:3001"}/v1/openapi.json`}>
          OpenAPI v1
        </a>
        {" · "}
        <Link href="/jobs">My jobs</Link>
      </p>
    </>
  );
}
