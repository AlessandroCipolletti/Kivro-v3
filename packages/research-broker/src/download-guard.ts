import { sniffMime } from "@kivro/job-io";

const BLOCKED_RESEARCH_MIMES = new Set([
  "application/x-msdownload",
  "application/x-executable",
  "application/vnd.microsoft.portable-executable",
]);

/** §250 / §251 — block executable/suspicious research downloads. */
export function assertSafeResearchContent(
  bytes: Uint8Array,
  contentType: string | undefined,
): { ok: boolean; reason?: string } {
  const sniffed = sniffMime(bytes.slice(0, 512));
  const mime = (sniffed ?? contentType ?? "").toLowerCase();
  if (BLOCKED_RESEARCH_MIMES.has(mime)) {
    return { ok: false, reason: "executable content not allowed via research broker" };
  }
  if (sniffed === "application/x-msdownload") {
    return { ok: false, reason: "executable signature detected" };
  }
  return { ok: true };
}
