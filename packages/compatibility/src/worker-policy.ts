import { KIVRO_COMPATIBILITY_MATRIX } from "./matrix.js";

function versionTuple(v: string): number[] {
  const core = v.replace(/^v/i, "").split("-")[0] ?? "0";
  return core.split(".").map((p) => Number.parseInt(p, 10) || 0);
}

export function compareWorkerVersions(a: string, b: string): number {
  const ta = versionTuple(a);
  const tb = versionTuple(b);
  const len = Math.max(ta.length, tb.length);
  for (let i = 0; i < len; i += 1) {
    const da = ta[i] ?? 0;
    const db = tb[i] ?? 0;
    if (da !== db) {
      return da < db ? -1 : 1;
    }
  }
  return 0;
}

export function resolveWorkerVersionPolicy(
  env: NodeJS.ProcessEnv = process.env,
): {
  minSupportedWorkerVersion: string;
  latestSupportedWorkerVersion: string;
  revokedWorkerVersions: string[];
} {
  const base = KIVRO_COMPATIBILITY_MATRIX.workerRelease;
  const revokedFromEnv = env.KIVRO_REVOKED_WORKER_VERSIONS?.split(",")
    .map((v) => v.trim())
    .filter(Boolean);
  return {
    minSupportedWorkerVersion:
      env.KIVRO_MIN_SECURITY_WORKER_VERSION ?? base.minSupportedWorkerVersion,
    latestSupportedWorkerVersion:
      env.KIVRO_LATEST_SUPPORTED_WORKER_VERSION ?? base.latestSupportedWorkerVersion,
    revokedWorkerVersions:
      revokedFromEnv && revokedFromEnv.length > 0 ? revokedFromEnv : base.revokedWorkerVersions,
  };
}

export type WorkerVersionEvaluation =
  | { ok: true }
  | {
      ok: false;
      code: "WORKER_VERSION_REVOKED" | "WORKER_VERSION_BELOW_MINIMUM";
      message: string;
      blocking: boolean;
    };

export function evaluateWorkerVersion(
  workerVersion: string,
  env?: NodeJS.ProcessEnv,
): WorkerVersionEvaluation {
  const policy = resolveWorkerVersionPolicy(env);
  if (policy.revokedWorkerVersions.includes(workerVersion)) {
    return {
      ok: false,
      code: "WORKER_VERSION_REVOKED",
      message: `Worker version ${workerVersion} is revoked.`,
      blocking: true,
    };
  }
  if (compareWorkerVersions(workerVersion, policy.minSupportedWorkerVersion) < 0) {
    return {
      ok: false,
      code: "WORKER_VERSION_BELOW_MINIMUM",
      message: `Worker ${workerVersion} is below minimum ${policy.minSupportedWorkerVersion}.`,
      blocking: true,
    };
  }
  return { ok: true };
}
