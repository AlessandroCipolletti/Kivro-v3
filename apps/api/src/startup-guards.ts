/** Fail closed if development-only flags are enabled in production (§566 / DEV-LOCAL-019). */

const FORBIDDEN_IN_PRODUCTION = [
  "KIVRO_DEV_AUTH_SHORTCUTS",
  "KIVRO_DEV_PAYMENT_SHORTCUTS",
  "KIVRO_FAKE_PAYMENT_ADAPTER",
  "KIVRO_ALLOW_RUNTIME_DISPATCH_TOGGLE",
] as const;

export function assertSafeProductionEnvironment(): void {
  if (process.env.NODE_ENV !== "production") {
    return;
  }
  for (const key of FORBIDDEN_IN_PRODUCTION) {
    if (process.env[key] === "true") {
      throw new Error(`UNSAFE_PRODUCTION_ENV:${key}`);
    }
  }
}
