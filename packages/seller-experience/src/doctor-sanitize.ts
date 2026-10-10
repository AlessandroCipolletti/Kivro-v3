const SECRET_PATTERNS = [
  /sk-[a-zA-Z0-9]{10,}/g,
  /Bearer\s+[a-zA-Z0-9._-]+/gi,
  /api[_-]?key["']?\s*[:=]\s*["']?[^\s"']+/gi,
  /privateKeyPem/gi,
  /-----BEGIN [A-Z ]+-----/g,
];

/** SELLERUX-031..032 — Doctor/support output must not leak secrets or buyer PII. */
export function sanitizeDoctorReport(raw: Record<string, unknown>): Record<string, unknown> {
  const json = JSON.stringify(raw);
  let redacted = json;
  for (const pattern of SECRET_PATTERNS) {
    redacted = redacted.replace(pattern, "[REDACTED]");
  }
  const parsed = JSON.parse(redacted) as Record<string, unknown>;
  delete parsed.privateKeyPem;
  if (parsed.device && typeof parsed.device === "object") {
    const device = { ...(parsed.device as Record<string, unknown>) };
    delete device.privateKeyPem;
    parsed.device = device;
  }
  return parsed;
}

export function buildDoctorChecklist(snapshot: {
  dockerOk: boolean;
  sandboxOk: boolean;
  openClawInstalled: boolean;
  openClawCompatible: boolean;
  credentialRefsConfigured?: number;
  credentialRefsStale?: number;
}): Array<{ id: string; ok: boolean; label: string }> {
  return [
    { id: "docker", ok: snapshot.dockerOk, label: "Docker available for sandbox" },
    { id: "sandbox", ok: snapshot.sandboxOk, label: "Sandbox self-test" },
    { id: "openclaw_installed", ok: snapshot.openClawInstalled, label: "OpenClaw detected" },
    { id: "openclaw_compatible", ok: snapshot.openClawCompatible, label: "OpenClaw version compatible" },
    {
      id: "credentials",
      ok: (snapshot.credentialRefsStale ?? 0) === 0,
      label: `Local credentials (${snapshot.credentialRefsConfigured ?? 0} refs)`,
    },
  ];
}
