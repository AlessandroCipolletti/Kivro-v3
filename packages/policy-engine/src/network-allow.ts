import type { NetworkAllowEntry } from "@kivro/contracts";
import { normalizeNetworkHost } from "./network-host.js";

export interface NormalizedNetworkAllow {
  host: string;
  ports: number[];
  purpose?: string;
}

const DEFAULT_PORTS = [443, 80] as const;

export function normalizeNetworkAllowList(allow: NetworkAllowEntry[]): NormalizedNetworkAllow[] {
  return allow.map((entry) => {
    if (typeof entry === "string") {
      return {
        host: normalizeNetworkHost(entry),
        ports: [...DEFAULT_PORTS],
      };
    }
    return {
      host: normalizeNetworkHost(entry.host),
      ports: [...new Set(entry.ports)].sort((a, b) => a - b),
      purpose: entry.purpose,
    };
  });
}

export function findNetworkAllowRule(
  allow: NetworkAllowEntry[],
  host: string,
): NormalizedNetworkAllow | undefined {
  const normalized = normalizeNetworkHost(host);
  return normalizeNetworkAllowList(allow).find((rule) => rule.host === normalized);
}
