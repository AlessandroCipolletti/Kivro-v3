import type { PlatformResearchCeilings } from "@kivro/platform-policy";
import { type DnsResolver, validateResearchDestination } from "./dns-resolve.js";

export interface SafeFetchRequest {
  url: string;
  method?: "GET" | "HEAD";
  allowedContentTypes?: string[];
  maxResponseBytes: number;
  ceilings: PlatformResearchCeilings;
}

export interface SafeFetchResult {
  ok: boolean;
  reason?: string;
  status?: number;
  contentType?: string;
  bytes?: number;
  bodyText?: string;
  bodyBytes?: Uint8Array;
  finalUrl?: string;
}

export type FetchImpl = (
  input: string,
  init?: { method?: string; signal?: AbortSignal; redirect?: "follow" | "error" | "manual" },
) => Promise<Response>;

/** §242 / §250 — bounded GET/HEAD fetch at broker connection boundary (§268). */
export async function safeResearchFetch(
  request: SafeFetchRequest,
  fetchImpl: FetchImpl,
  dnsResolver?: DnsResolver,
): Promise<SafeFetchResult> {
  const method = (request.method ?? "GET").toUpperCase();
  if (method !== "GET" && method !== "HEAD") {
    return { ok: false, reason: "method not allowed for public research" };
  }

  let currentUrl = request.url;
  let redirects = 0;

  while (true) {
    const validated = await validateResearchDestination(currentUrl, dnsResolver);
    if (!validated.ok) {
      return { ok: false, reason: validated.reason };
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), request.ceilings.fetchTimeoutMs);
    let response: Response;
    try {
      response = await fetchImpl(currentUrl, {
        method,
        signal: controller.signal,
        redirect: "manual",
      });
    } catch (err) {
      clearTimeout(timeout);
      const message = err instanceof Error ? err.message : "fetch failed";
      return { ok: false, reason: message };
    }
    clearTimeout(timeout);

    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get("location");
      if (!location) {
        return { ok: false, reason: "redirect without location" };
      }
      redirects += 1;
      if (redirects > request.ceilings.maxRedirects) {
        return { ok: false, reason: "too many redirects" };
      }
      currentUrl = new URL(location, currentUrl).toString();
      continue;
    }

    const contentType = (response.headers.get("content-type") ?? "application/octet-stream")
      .split(";")[0]
      ?.trim()
      .toLowerCase();
    if (
      request.allowedContentTypes &&
      request.allowedContentTypes.length > 0 &&
      contentType &&
      !request.allowedContentTypes.some((t) => contentType.startsWith(t.toLowerCase()))
    ) {
      return { ok: false, reason: "content-type not allowed", status: response.status, contentType };
    }

    if (method === "HEAD") {
      return {
        ok: true,
        status: response.status,
        contentType,
        bytes: 0,
        finalUrl: currentUrl,
      };
    }

    const buffer = await response.arrayBuffer();
    if (buffer.byteLength > request.maxResponseBytes) {
      return { ok: false, reason: "response too large", status: response.status, contentType };
    }
    const merged = new Uint8Array(buffer);
    const bodyText = new TextDecoder("utf-8", { fatal: false }).decode(merged);
    const total = merged.byteLength;
    return {
      ok: true,
      status: response.status,
      contentType,
      bytes: total,
      bodyText,
      bodyBytes: merged,
      finalUrl: currentUrl,
    };
  }
}
