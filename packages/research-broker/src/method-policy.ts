/** §248 / §249 — side-effect classification for network operations. */
export type NetworkSideEffect = "READ_ONLY" | "SIDE_EFFECTING" | "UNKNOWN";

const READ_METHODS = new Set(["GET", "HEAD"]);

export function classifyHttpMethod(method: string): NetworkSideEffect {
  const upper = method.toUpperCase();
  if (READ_METHODS.has(upper)) {
    return "READ_ONLY";
  }
  if (["POST", "PUT", "PATCH", "DELETE", "CONNECT"].includes(upper)) {
    return "SIDE_EFFECTING";
  }
  return "UNKNOWN";
}

export function isAllowedResearchMethod(mode: string, method: string): boolean {
  const effect = classifyHttpMethod(method);
  if (mode === "PUBLIC_WEB_RESEARCH") {
    return effect === "READ_ONLY";
  }
  if (mode === "DECLARED_API_ACCESS") {
    return effect !== "UNKNOWN";
  }
  return false;
}
