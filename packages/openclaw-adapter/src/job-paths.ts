import path from "node:path";

/** Master Spec §60 — per-attempt job directory layout under a runtime root. */
export function jobAttemptPaths(
  runtimeRoot: string,
  jobId: string,
  attemptId: string,
): {
  root: string;
  input: string;
  work: string;
  output: string;
  metadata: string;
} {
  const rootDir = path.join(runtimeRoot, "jobs", jobId, attemptId);
  return {
    root: rootDir,
    input: path.join(rootDir, "input"),
    work: path.join(rootDir, "work"),
    output: path.join(rootDir, "output"),
    metadata: path.join(rootDir, "metadata"),
  };
}

/** §228 — after the job ends, local buyer input is removed. Output stays until upload. */
export function localBuyerInputDirToDelete(runtimeRoot: string, inputDir: string): string | null {
  const root = path.resolve(runtimeRoot);
  const target = path.resolve(inputDir);
  const rootPrefix = root.endsWith(path.sep) ? root : root + path.sep;
  if (target === root || !target.startsWith(rootPrefix)) {
    return null;
  }
  if (!target.includes(`${path.sep}input`)) {
    return null;
  }
  return target;
}

export function safeInputAssetPath(inputDir: string, assetId: string): string {
  const normalized = path.normalize(path.join(inputDir, assetId));
  if (!normalized.startsWith(path.normalize(inputDir + path.sep))) {
    throw new Error("Path escapes input directory");
  }
  return normalized;
}
