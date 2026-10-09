import path from "node:path";

/** §19 — job paths must stay under the attempt workspace root. */
export function assertPathWithinJobRoot(jobRoot: string, targetPath: string): void {
  const root = path.resolve(jobRoot);
  const target = path.resolve(targetPath);
  if (!target.startsWith(root + path.sep) && target !== root) {
    throw new Error("PATH_ESCAPE_JOB_ROOT");
  }
}

export function isForbiddenHostPath(accessPath: string): boolean {
  const normalized = accessPath.replace(/\\/g, "/").toLowerCase();
  return (
    normalized.includes("/.ssh/") ||
    normalized.endsWith("/.ssh") ||
    normalized.includes("/.openclaw/") ||
    normalized.includes("/openclaw.json")
  );
}
