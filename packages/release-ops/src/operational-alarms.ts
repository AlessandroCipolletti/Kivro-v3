/** HARD-028 — operational alarm catalog (no seller secrets). */

export type OperationalAlarm = {
  id: string;
  signal: string;
  severity: "critical" | "warning" | "info";
  description: string;
};

export type OperationalAlarmsManifest = {
  milestone: string;
  alarms: OperationalAlarm[];
};

export function parseOperationalAlarmsManifest(raw: unknown): OperationalAlarmsManifest {
  if (!raw || typeof raw !== "object") {
    throw new Error("OPERATIONAL_ALARMS_INVALID");
  }
  const doc = raw as OperationalAlarmsManifest;
  if (!Array.isArray(doc.alarms) || doc.alarms.length === 0) {
    throw new Error("OPERATIONAL_ALARMS_EMPTY");
  }
  return doc;
}

const REQUIRED_ALARM_IDS = [
  "release-parity-regression",
  "durable-work-backlog-age",
  "worker-version-skew",
  "payment-reconciliation-anomaly",
] as const;

export function assertRequiredOperationalAlarms(manifest: OperationalAlarmsManifest): {
  ok: true;
} | {
  ok: false;
  missing: string[];
} {
  const ids = new Set(manifest.alarms.map((a) => a.id));
  const missing = REQUIRED_ALARM_IDS.filter((id) => !ids.has(id));
  if (missing.length > 0) {
    return { ok: false, missing: [...missing] };
  }
  return { ok: true };
}
