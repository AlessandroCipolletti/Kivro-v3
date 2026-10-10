"use client";

import { Alert } from "@/components/ui/Alert";
import { PageHeader } from "@/components/ui/PageHeader";
import { API_BASE } from "@/lib/kivro-api";
import { useCallback, useEffect, useState } from "react";

type Identity = {
  marketplaceDisplayName: string;
  legalNameForKyc: string | null;
};

export default function SellerIdentitySettingsPage() {
  const [identity, setIdentity] = useState<Identity | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [legalName, setLegalName] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const res = await fetch(`${API_BASE}/seller/profile/identity`, { credentials: "include" });
    if (!res.ok) {
      setError("Sign in as a seller to manage identity.");
      return;
    }
    const body = (await res.json()) as { private: Identity };
    setIdentity(body.private);
    setDisplayName(body.private.marketplaceDisplayName);
    setLegalName(body.private.legalNameForKyc ?? "");
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    const res = await fetch(`${API_BASE}/seller/profile/identity`, {
      method: "PATCH",
      credentials: "include",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        displayName,
        legalNameForKyc: legalName || null,
      }),
    });
    if (!res.ok) {
      setError("Save failed.");
      return;
    }
    setMessage("Saved. Legal name is never shown on public listings.");
    void load();
  }

  return (
    <div className="page-shell">
      <PageHeader
        title="Seller identity"
        description="Public marketplace display name vs private legal/KYC name."
      />
      {error && <Alert tone="danger">{error}</Alert>}
      {message && <Alert tone="info">{message}</Alert>}
      {identity && (
        <form className="detail-panel form-stack" onSubmit={(e) => void save(e)}>
          <div className="form-field">
            <label className="field-label" htmlFor="display-name">
              Marketplace display name (public)
            </label>
            <input
              id="display-name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
            />
          </div>
          <div className="form-field">
            <label className="field-label" htmlFor="legal-name">
              Legal name for KYC (private)
            </label>
            <input
              id="legal-name"
              value={legalName}
              onChange={(e) => setLegalName(e.target.value)}
            />
          </div>
          <button className="button" type="submit">
            Save
          </button>
        </form>
      )}
    </div>
  );
}
