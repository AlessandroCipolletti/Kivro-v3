import { isBlockedEgressHost } from "@kivro/policy-engine";
import { validateResearchUrl, type UrlValidationResult } from "./ssrf.js";

export type DnsResolver = (host: string) => Promise<string[]>;

function isLiteralIpHost(host: string): boolean {
  return /^\d{1,3}(\.\d{1,3}){3}$/.test(host) || host.includes(":");
}

/** §243 / §268 — DNS resolution must not point at private/metadata space. */
export async function validateResearchDestination(
  urlString: string,
  resolver?: DnsResolver,
): Promise<UrlValidationResult> {
  const basic = validateResearchUrl(urlString);
  if (!basic.ok || !basic.host) {
    return basic;
  }
  if (isLiteralIpHost(basic.host)) {
    return basic;
  }
  let addresses: string[];
  try {
    addresses = await resolveHostAddresses(basic.host, resolver);
  } catch {
    return { ok: false, reason: "dns lookup failed" };
  }
  for (const addr of addresses) {
    if (isBlockedEgressHost(addr)) {
      return { ok: false, reason: "dns resolves to blocked address" };
    }
  }
  return basic;
}

export async function resolveHostAddresses(host: string, resolver?: DnsResolver): Promise<string[]> {
  if (resolver) {
    return resolver(host);
  }
  const { lookup } = await import("node:dns/promises");
  const records = await lookup(host, { all: true });
  return records.map((r) => r.address);
}
