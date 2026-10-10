"use client";

import { Alert } from "@/components/ui/Alert";
import { PageHeader } from "@/components/ui/PageHeader";
import { API_BASE } from "@/lib/kivro-api";
import { useEffect, useState } from "react";

export default function NotificationSettingsPage() {
  const [emailTerminal, setEmailTerminal] = useState(true);
  const [emailScheduled, setEmailScheduled] = useState(true);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${API_BASE}/buyer/experience/notification-preferences`, { credentials: "include" })
      .then(async (res) => {
        if (!res.ok) {
          throw new Error("load");
        }
        const body = (await res.json()) as {
          preferences: { emailTerminalJobComplete: boolean; emailScheduledReminder: boolean };
        };
        setEmailTerminal(body.preferences.emailTerminalJobComplete);
        setEmailScheduled(body.preferences.emailScheduledReminder);
      })
      .catch(() => setError("Could not load preferences"));
  }, []);

  async function save() {
    setError(null);
    setSaved(false);
    const res = await fetch(`${API_BASE}/buyer/experience/notification-preferences`, {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        emailTerminalJobComplete: emailTerminal,
        emailScheduledReminder: emailScheduled,
      }),
    });
    if (!res.ok) {
      setError("Save failed");
      return;
    }
    setSaved(true);
  }

  return (
    <>
      <PageHeader
        title="Notifications"
        description="Control durable email notifications for job completion and scheduled reminders."
      />
      {error && <Alert tone="danger">{error}</Alert>}
      {saved && <Alert tone="info">Preferences saved.</Alert>}
      <div className="detail-panel form-stack">
        <label className="field-label">
          <input
            type="checkbox"
            checked={emailTerminal}
            onChange={(e) => setEmailTerminal(e.target.checked)}
          />{" "}
          Email when a job completes (links to your account, not permanent file URLs)
        </label>
        <label className="field-label">
          <input
            type="checkbox"
            checked={emailScheduled}
            onChange={(e) => setEmailScheduled(e.target.checked)}
          />{" "}
          Scheduled job reminders
        </label>
        <button type="button" className="button" onClick={() => void save()}>
          Save
        </button>
      </div>
    </>
  );
}
