/** §255 — platform absolute research ceilings (seller limits may only tighten). */
export interface PlatformResearchCeilings {
  maxSearchQueriesPerJob: number;
  maxFetchedPagesPerJob: number;
  maxResponseBytes: number;
  maxDownloadBytesPerJob: number;
  maxTotalNetworkBytesPerJob: number;
  maxResearchDurationSeconds: number;
  maxRedirects: number;
  fetchTimeoutMs: number;
  maxConcurrentRequestsPerJob: number;
}

export const DEFAULT_PLATFORM_RESEARCH_CEILINGS: PlatformResearchCeilings = {
  maxSearchQueriesPerJob: 50,
  maxFetchedPagesPerJob: 100,
  maxResponseBytes: 10_000_000,
  maxDownloadBytesPerJob: 50_000_000,
  maxTotalNetworkBytesPerJob: 100_000_000,
  maxResearchDurationSeconds: 900,
  maxRedirects: 3,
  fetchTimeoutMs: 30_000,
  maxConcurrentRequestsPerJob: 4,
};
