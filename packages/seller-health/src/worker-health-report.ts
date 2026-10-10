/** Sanitized Worker heartbeat payload (Master Spec §373–§379). */

export type WorkerCredentialRefHeartbeat = {
  refId: string;
  provider: string;
  lastVerifiedAt: string | null;
};

export type WorkerHealthReport = {
  workerVersion: string;
  openClawVersion?: string | null;
  dockerOk: boolean;
  sandboxOk: boolean;
  openClawInstalled: boolean;
  openClawCompatible: boolean;
  globalPauseActive: boolean;
  cloudConnectionOk?: boolean;
  credentialRefs?: WorkerCredentialRefHeartbeat[];
  reportedAt: string;
};

export function parseWorkerHealthReport(raw: unknown): WorkerHealthReport | null {
  if (!raw || typeof raw !== "object") {
    return null;
  }
  const o = raw as Record<string, unknown>;
  if (typeof o.workerVersion !== "string" || typeof o.reportedAt !== "string") {
    return null;
  }
  return {
    workerVersion: o.workerVersion,
    openClawVersion: typeof o.openClawVersion === "string" ? o.openClawVersion : null,
    dockerOk: o.dockerOk === true,
    sandboxOk: o.sandboxOk === true,
    openClawInstalled: o.openClawInstalled === true,
    openClawCompatible: o.openClawCompatible === true,
    globalPauseActive: o.globalPauseActive === true,
    cloudConnectionOk: o.cloudConnectionOk === true ? true : o.cloudConnectionOk === false ? false : undefined,
    reportedAt: o.reportedAt,
    credentialRefs: Array.isArray(o.credentialRefs)
      ? o.credentialRefs
          .filter((r): r is Record<string, unknown> => Boolean(r) && typeof r === "object")
          .map((r) => ({
            refId: String(r.refId ?? ""),
            provider: String(r.provider ?? ""),
            lastVerifiedAt:
              typeof r.lastVerifiedAt === "string" ? r.lastVerifiedAt : null,
          }))
          .filter((r) => r.refId.length > 0)
      : undefined,
  };
}

export function buildWorkerHealthReport(input: Omit<WorkerHealthReport, "reportedAt">): WorkerHealthReport {
  return { ...input, reportedAt: new Date().toISOString() };
}
