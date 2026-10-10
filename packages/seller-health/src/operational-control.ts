/** §395 — the seller can answer operational questions, including an immediate stop. */
export function sellerOperationalAnswers(input: {
  workerHealthy: boolean;
  workerVersion: string | null;
  openClawCompatible: boolean;
  isolationWorking: boolean;
  executingNow: number;
  queued: number;
  recentFailureCount: number;
  securityWarnings: string[];
  cloudReachable: boolean;
}): {
  workerHealthy: boolean;
  workerVersion: string | null;
  openClawCompatible: boolean;
  isolationWorking: boolean;
  executingNow: number;
  queued: number;
  recentFailureCount: number;
  securityWarnings: string[];
  canStopAcceptingImmediately: true;
  stopPaths: ["LOCAL", "WEB_DASHBOARD"];
} {
  return {
    workerHealthy: input.workerHealthy,
    workerVersion: input.workerVersion,
    openClawCompatible: input.openClawCompatible,
    isolationWorking: input.isolationWorking,
    executingNow: input.executingNow,
    queued: input.queued,
    recentFailureCount: input.recentFailureCount,
    securityWarnings: input.securityWarnings,
    canStopAcceptingImmediately: true,
    stopPaths: ["LOCAL", "WEB_DASHBOARD"],
  };
}
