let globalDispatchEnabled = process.env.KIVRO_GLOBAL_DISPATCH_ENABLED !== "false";

/** §78 / §19 invariant 16 — global job dispatch kill switch. */
export function isGlobalDispatchEnabled(): boolean {
  return globalDispatchEnabled;
}

export function setGlobalDispatchEnabled(enabled: boolean): void {
  if (
    process.env.NODE_ENV === "production" &&
    process.env.KIVRO_ALLOW_RUNTIME_DISPATCH_TOGGLE !== "true"
  ) {
    throw new Error("RUNTIME_DISPATCH_TOGGLE_FORBIDDEN_IN_PRODUCTION");
  }
  globalDispatchEnabled = enabled;
}

export function resetGlobalDispatchForTests(enabled = true): void {
  globalDispatchEnabled = enabled;
}
