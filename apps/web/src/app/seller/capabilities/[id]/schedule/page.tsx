"use client";

import { Alert } from "@/components/ui/Alert";
import { PageHeader } from "@/components/ui/PageHeader";
import { API_BASE } from "@/lib/kivro-api";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

export default function CapabilitySchedulePage() {
  const params = useParams<{ id: string }>();
  const capabilityId = params.id;
  const [timezone, setTimezone] = useState("UTC");
  const [mode, setMode] = useState<"ALWAYS" | "CUSTOM">("ALWAYS");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const res = await fetch(`${API_BASE}/seller/capabilities/${capabilityId}/schedule`, {
      credentials: "include",
    });
    if (!res.ok) {
      setError("Could not load schedule.");
      return;
    }
    const body = (await res.json()) as { schedule: { mode: "ALWAYS" | "CUSTOM"; timezone: string } };
    setMode(body.schedule.mode);
    setTimezone(body.schedule.timezone);
  }, [capabilityId]);

  useEffect(() => {
    void load();
  }, [load]);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    const res = await fetch(`${API_BASE}/seller/capabilities/${capabilityId}/schedule`, {
      method: "PUT",
      credentials: "include",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ mode, timezone, windows: [] }),
    });
    if (!res.ok) {
      setError("Save failed.");
      return;
    }
    setMessage("Schedule updated.");
  }

  return (
    <div className="page-shell">
      <PageHeader title="Availability schedule" description="SELLERUX-012 — buyer-visible availability windows." />
      {error && <Alert tone="danger">{error}</Alert>}
      {message && <Alert tone="info">{message}</Alert>}
      <form className="detail-panel form-stack" onSubmit={(e) => void save(e)}>
        <div className="form-field">
          <label className="field-label" htmlFor="mode">
            Mode
          </label>
          <select id="mode" value={mode} onChange={(e) => setMode(e.target.value as "ALWAYS" | "CUSTOM")}>
            <option value="ALWAYS">Always (when not paused)</option>
            <option value="CUSTOM">Custom windows</option>
          </select>
        </div>
        <div className="form-field">
          <label className="field-label" htmlFor="tz">
            Timezone
          </label>
          <input id="tz" value={timezone} onChange={(e) => setTimezone(e.target.value)} />
        </div>
        <button className="button" type="submit">
          Save schedule
        </button>
      </form>
      <p>
        <Link href="/seller/dashboard">Dashboard</Link>
      </p>
    </div>
  );
}
