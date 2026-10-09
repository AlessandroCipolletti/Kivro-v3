import type { InternetResearchPolicy } from "@kivro/contracts";
import { normalizeNetworkHost } from "@kivro/policy-engine";

export function isDomainAllowedForResearch(policy: InternetResearchPolicy, host: string): boolean {
  const normalized = normalizeNetworkHost(host);
  if (policy.domainPolicy === "ANY_PUBLIC_DOMAIN") {
    return true;
  }
  const allowed = policy.declaredDomains ?? [];
  return allowed.some((d) => normalizeNetworkHost(d) === normalized);
}
