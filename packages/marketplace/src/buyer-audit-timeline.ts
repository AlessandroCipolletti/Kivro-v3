/** §29 — merge state transitions with sanitized audit events for buyer job view. */

export type BuyerTimelineEntry = {
  at: string;
  label: string;
  detail?: string;
};

export function buildBuyerJobTimeline(input: {
  transitions: Array<{ createdAt: Date; toStatus: string; reason: string | null }>;
  auditEvents: Array<{ createdAt: Date; type: string; sanitizedPayload: unknown }>;
}): BuyerTimelineEntry[] {
  const entries: BuyerTimelineEntry[] = [];

  for (const t of input.transitions) {
    entries.push({
      at: t.createdAt.toISOString(),
      label: t.toStatus.replaceAll("_", " ").toLowerCase(),
      detail: t.reason ?? undefined,
    });
  }

  for (const ev of input.auditEvents) {
    const label = ev.type.replaceAll("_", " ").toLowerCase();
    const detail = summarizeAuditPayload(ev.sanitizedPayload);
    entries.push({
      at: ev.createdAt.toISOString(),
      label,
      detail,
    });
  }

  entries.sort((a, b) => a.at.localeCompare(b.at));
  return dedupeAdjacent(entries);
}

function summarizeAuditPayload(payload: unknown): string | undefined {
  if (!payload || typeof payload !== "object") {
    return undefined;
  }
  const o = payload as Record<string, unknown>;
  const parts: string[] = [];
  for (const key of ["message", "reason", "stage", "summary"]) {
    if (typeof o[key] === "string" && o[key]) {
      parts.push(String(o[key]));
    }
  }
  return parts.length ? parts.join(" · ").slice(0, 240) : undefined;
}

function dedupeAdjacent(entries: BuyerTimelineEntry[]): BuyerTimelineEntry[] {
  const out: BuyerTimelineEntry[] = [];
  for (const e of entries) {
    const prev = out[out.length - 1];
    if (prev && prev.label === e.label && prev.at === e.at) {
      continue;
    }
    out.push(e);
  }
  return out;
}
