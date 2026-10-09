import type { InternetResearchPolicy } from "@kivro/contracts";
import { DEFAULT_PLATFORM_RESEARCH_CEILINGS, type PlatformResearchCeilings } from "@kivro/platform-policy";

/** §246 / §255 — seller limits may only tighten; platform ceilings are absolute maxima. */
export function clampInternetResearchPolicy(
  policy: InternetResearchPolicy,
  ceilings: PlatformResearchCeilings = DEFAULT_PLATFORM_RESEARCH_CEILINGS,
): InternetResearchPolicy {
  const searchMax = Math.min(
    policy.search?.maxQueriesPerJob ?? ceilings.maxSearchQueriesPerJob,
    ceilings.maxSearchQueriesPerJob,
  );
  const pagesMax = Math.min(
    policy.fetch?.maxPagesPerJob ?? ceilings.maxFetchedPagesPerJob,
    ceilings.maxFetchedPagesPerJob,
  );
  const responseMax = Math.min(
    policy.fetch?.maxResponseBytes ?? ceilings.maxResponseBytes,
    ceilings.maxResponseBytes,
  );
  const downloadMax = Math.min(
    policy.fetch?.maxDownloadBytesPerJob ?? ceilings.maxDownloadBytesPerJob,
    ceilings.maxDownloadBytesPerJob,
  );
  const totalMax = Math.min(
    policy.budgets?.maxTotalNetworkBytesPerJob ?? ceilings.maxTotalNetworkBytesPerJob,
    ceilings.maxTotalNetworkBytesPerJob,
  );
  const durationMax = Math.min(
    policy.budgets?.maxResearchDurationSeconds ?? ceilings.maxResearchDurationSeconds,
    ceilings.maxResearchDurationSeconds,
  );

  return {
    ...policy,
    search: policy.search
      ? { ...policy.search, maxQueriesPerJob: searchMax }
      : policy.search,
    fetch: policy.fetch
      ? {
          ...policy.fetch,
          maxPagesPerJob: pagesMax,
          maxResponseBytes: responseMax,
          maxDownloadBytesPerJob: downloadMax,
        }
      : policy.fetch,
    budgets: {
      ...policy.budgets,
      maxTotalNetworkBytesPerJob: totalMax,
      maxResearchDurationSeconds: durationMax,
    },
  };
}

export function validateInternetResearchPolicy(policy: InternetResearchPolicy): {
  ok: boolean;
  issues: string[];
} {
  const issues: string[] = [];
  if (policy.mode === "DECLARED_API_ACCESS" && policy.domainPolicy === "ANY_PUBLIC_DOMAIN") {
    issues.push("DECLARED_API_ACCESS requires ONLY_DECLARED_DOMAINS");
  }
  if (
    policy.domainPolicy === "ONLY_DECLARED_DOMAINS" &&
    (!policy.declaredDomains || policy.declaredDomains.length === 0)
  ) {
    issues.push("declaredDomains required for ONLY_DECLARED_DOMAINS");
  }
  if (policy.mode === "PUBLIC_WEB_RESEARCH" && policy.search?.enabled === false && policy.fetch?.enabled === false) {
    issues.push("PUBLIC_WEB_RESEARCH requires search or fetch enabled");
  }
  return { ok: issues.length === 0, issues };
}
