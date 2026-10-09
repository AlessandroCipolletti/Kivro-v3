export type JobMetricsWindow = {
  windowHours: number;
  runningCount: number;
  queuedCount: number;
  lastSuccessAt: string | null;
  lastFailureAt: string | null;
  averageRuntimeSeconds: number | null;
  failureRate: number | null;
  completedCount: number;
  failedCount: number;
};

const TERMINAL_SUCCESS = new Set(["COMPLETED"]);
const TERMINAL_FAILURE = new Set(["FAILED", "SECURITY_FAILED"]);

export function computeJobMetrics(
  jobs: Array<{
    status: string;
    createdAt: Date;
    completedAt: Date | null;
    startedAt: Date | null;
  }>,
  windowHours = 24,
  now = new Date(),
): JobMetricsWindow {
  const since = now.getTime() - windowHours * 60 * 60 * 1000;
  const inWindow = jobs.filter((j) => j.createdAt.getTime() >= since);

  const runningCount = jobs.filter((j) =>
    ["RUNNING", "STARTING", "ACCEPTED", "DISPATCHED", "UPLOADING_RESULT"].includes(j.status),
  ).length;
  const queuedCount = jobs.filter((j) => ["QUEUED", "SCHEDULED"].includes(j.status)).length;

  let lastSuccessAt: string | null = null;
  let lastFailureAt: string | null = null;
  const runtimes: number[] = [];
  let completedCount = 0;
  let failedCount = 0;

  for (const job of inWindow) {
    if (TERMINAL_SUCCESS.has(job.status) && job.completedAt) {
      completedCount += 1;
      const iso = job.completedAt.toISOString();
      if (!lastSuccessAt || iso > lastSuccessAt) {
        lastSuccessAt = iso;
      }
      if (job.startedAt) {
        runtimes.push((job.completedAt.getTime() - job.startedAt.getTime()) / 1000);
      }
    }
    if (TERMINAL_FAILURE.has(job.status) && job.completedAt) {
      failedCount += 1;
      const iso = job.completedAt.toISOString();
      if (!lastFailureAt || iso > lastFailureAt) {
        lastFailureAt = iso;
      }
    }
  }

  const attempts = completedCount + failedCount;
  const failureRate = attempts > 0 ? failedCount / attempts : null;
  const averageRuntimeSeconds =
    runtimes.length > 0 ? runtimes.reduce((a, b) => a + b, 0) / runtimes.length : null;

  return {
    windowHours,
    runningCount,
    queuedCount,
    lastSuccessAt,
    lastFailureAt,
    averageRuntimeSeconds,
    failureRate,
    completedCount,
    failedCount,
  };
}
