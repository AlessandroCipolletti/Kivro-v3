/** §334 — SSRF-safe webhook URL registration. */

export function validateWebhookUrl(raw: string): { ok: true; url: URL } | { error: string } {
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return { error: "INVALID_URL" };
  }
  if (url.protocol !== "https:" && url.protocol !== "http:") {
    return { error: "UNSUPPORTED_PROTOCOL" };
  }
  if (process.env.NODE_ENV === "production" && url.protocol !== "https:") {
    return { error: "HTTPS_REQUIRED" };
  }
  const host = url.hostname.toLowerCase();
  if (
    host === "localhost" ||
    host === "127.0.0.1" ||
    host === "::1" ||
    host.endsWith(".local") ||
    host.startsWith("10.") ||
    host.startsWith("192.168.") ||
    host.startsWith("169.254.") ||
    /^172\.(1[6-9]|2\d|3[0-1])\./.test(host)
  ) {
    return { error: "SSRF_BLOCKED_HOST" };
  }
  return { ok: true, url };
}
