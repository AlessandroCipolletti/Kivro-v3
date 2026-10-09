import type { InternetResearchPolicy } from "@kivro/contracts";
import type { PlatformResearchCeilings } from "@kivro/platform-policy";

export interface ResearchBudgetState {
  searchQueries: number;
  fetchedPages: number;
  downloadedBytes: number;
  totalNetworkBytes: number;
  startedAtMs: number;
  inFlight: number;
}

export function createResearchBudgetState(): ResearchBudgetState {
  return {
    searchQueries: 0,
    fetchedPages: 0,
    downloadedBytes: 0,
    totalNetworkBytes: 0,
    startedAtMs: Date.now(),
    inFlight: 0,
  };
}

function effectiveLimits(policy: InternetResearchPolicy, ceilings: PlatformResearchCeilings) {
  return {
    maxSearchQueries:
      Math.min(
        policy.search?.maxQueriesPerJob ?? ceilings.maxSearchQueriesPerJob,
        ceilings.maxSearchQueriesPerJob,
      ) || ceilings.maxSearchQueriesPerJob,
    maxPages: Math.min(
      policy.fetch?.maxPagesPerJob ?? ceilings.maxFetchedPagesPerJob,
      ceilings.maxFetchedPagesPerJob,
    ),
    maxDownloadBytes: Math.min(
      policy.fetch?.maxDownloadBytesPerJob ?? ceilings.maxDownloadBytesPerJob,
      ceilings.maxDownloadBytesPerJob,
    ),
    maxTotalBytes: Math.min(
      policy.budgets?.maxTotalNetworkBytesPerJob ?? ceilings.maxTotalNetworkBytesPerJob,
      ceilings.maxTotalNetworkBytesPerJob,
    ),
    maxDurationMs:
      Math.min(
        (policy.budgets?.maxResearchDurationSeconds ?? ceilings.maxResearchDurationSeconds) * 1000,
        ceilings.maxResearchDurationSeconds * 1000,
      ) || ceilings.maxResearchDurationSeconds * 1000,
    maxConcurrent: ceilings.maxConcurrentRequestsPerJob,
  };
}

export function checkSearchBudget(
  state: ResearchBudgetState,
  policy: InternetResearchPolicy,
  ceilings: PlatformResearchCeilings,
): { ok: boolean; reason?: string } {
  const limits = effectiveLimits(policy, ceilings);
  if (state.searchQueries >= limits.maxSearchQueries) {
    return { ok: false, reason: "search query budget exceeded" };
  }
  return checkSharedBudget(state, policy, ceilings);
}

export function checkFetchBudget(
  state: ResearchBudgetState,
  policy: InternetResearchPolicy,
  ceilings: PlatformResearchCeilings,
  responseBytes: number,
): { ok: boolean; reason?: string } {
  const limits = effectiveLimits(policy, ceilings);
  if (state.fetchedPages >= limits.maxPages) {
    return { ok: false, reason: "fetch page budget exceeded" };
  }
  if (state.downloadedBytes + responseBytes > limits.maxDownloadBytes) {
    return { ok: false, reason: "download byte budget exceeded" };
  }
  if (state.totalNetworkBytes + responseBytes > limits.maxTotalBytes) {
    return { ok: false, reason: "total network byte budget exceeded" };
  }
  return checkSharedBudget(state, policy, ceilings);
}

function checkSharedBudget(
  state: ResearchBudgetState,
  policy: InternetResearchPolicy,
  ceilings: PlatformResearchCeilings,
): { ok: boolean; reason?: string } {
  const limits = effectiveLimits(policy, ceilings);
  if (Date.now() - state.startedAtMs > limits.maxDurationMs) {
    return { ok: false, reason: "research duration budget exceeded" };
  }
  if (state.inFlight >= limits.maxConcurrent) {
    return { ok: false, reason: "research concurrency limit exceeded" };
  }
  return { ok: true };
}
