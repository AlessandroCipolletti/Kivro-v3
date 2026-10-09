import { createHash } from "node:crypto";

/** §254 — sanitized research audit record (no full page bodies). */
export interface ResearchAuditEntry {
  jobId?: string;
  capabilityVersionId?: string;
  operation: "web.search" | "web.fetch" | "connector.invoke";
  queryHash?: string;
  host?: string;
  method?: string;
  contentType?: string;
  bytes?: number;
  status?: number;
  blockedReason?: string;
  timestamp: string;
}

export function hashSearchQuery(query: string): string {
  return createHash("sha256").update(query.trim().toLowerCase()).digest("hex").slice(0, 16);
}

export function buildAuditEntry(
  partial: Omit<ResearchAuditEntry, "timestamp">,
): ResearchAuditEntry {
  return { ...partial, timestamp: new Date().toISOString() };
}
