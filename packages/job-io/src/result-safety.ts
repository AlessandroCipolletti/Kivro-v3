/** Master Spec §31 — safe buyer-facing result rendering (no HTML execution server-side). */

const MAX_TEXT_DISPLAY_CHARS = 200_000;

export function normalizeTextOutput(raw: unknown): string {
  if (raw == null) {
    return "";
  }
  if (typeof raw === "string") {
    return raw.normalize("NFKC").slice(0, MAX_TEXT_DISPLAY_CHARS);
  }
  if (typeof raw === "number" || typeof raw === "boolean") {
    return String(raw);
  }
  try {
    return JSON.stringify(raw, null, 2).slice(0, MAX_TEXT_DISPLAY_CHARS);
  } catch {
    return "[unserializable output]";
  }
}

/** Strip angle brackets so accidental HTML in job output cannot render as markup in UI. */
export function escapeForSafeTextDisplay(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export function safeExternalUrlForRender(href: string): string | null {
  try {
    const url = new URL(href);
    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return null;
    }
    return url.toString();
  } catch {
    return null;
  }
}

export function sanitizeDownloadFilename(name: string): string {
  const base = name.replace(/[\r\n"\\]/g, "_").replace(/\.\./g, "_").trim();
  return base.slice(0, 180) || "download.bin";
}
