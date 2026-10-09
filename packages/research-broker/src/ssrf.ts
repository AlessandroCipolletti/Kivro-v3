import { isBlockedEgressHost, normalizeNetworkHost } from "@kivro/policy-engine";

export interface UrlValidationResult {
  ok: boolean;
  reason?: string;
  host?: string;
  port?: number;
}

/** §243 / §245 — URL validation before broker connects (hostname + blocked ranges). */
export function validateResearchUrl(urlString: string): UrlValidationResult {
  let parsed: URL;
  try {
    parsed = new URL(urlString);
  } catch {
    return { ok: false, reason: "invalid url" };
  }
  if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
    return { ok: false, reason: "protocol not allowed" };
  }
  if (parsed.username || parsed.password) {
    return { ok: false, reason: "credentials in url forbidden" };
  }
  const host = normalizeNetworkHost(parsed.hostname);
  if (isBlockedEgressHost(host)) {
    return { ok: false, reason: "blocked destination (private/metadata)" };
  }
  if (looksLikeEncodedPrivateIp(parsed.hostname)) {
    return { ok: false, reason: "blocked ip encoding" };
  }
  const port = parsed.port
    ? Number.parseInt(parsed.port, 10)
    : parsed.protocol === "https:"
      ? 443
      : 80;
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    return { ok: false, reason: "invalid port" };
  }
  if (port !== 80 && port !== 443) {
    return { ok: false, reason: "non-standard port not allowed for public research" };
  }
  return { ok: true, host, port };
}

function looksLikeEncodedPrivateIp(hostname: string): boolean {
  const trimmed = hostname.trim();
  if (/^0x[0-9a-f]+$/i.test(trimmed)) {
    return true;
  }
  if (/^\d+$/.test(trimmed) && trimmed.includes(".")) {
    return false;
  }
  if (/^\d+$/.test(trimmed)) {
    const asNum = Number.parseInt(trimmed, 10);
    if (asNum >= 0 && asNum <= 0xffffffff) {
      return true;
    }
  }
  return false;
}
