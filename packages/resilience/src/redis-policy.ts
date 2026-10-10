/** HARD-016 — Redis/cache is never authoritative for jobs, payments, or identity. */

export const AUTHORITATIVE_STORES = ["postgresql", "object-storage"] as const;

export const REDIS_ALLOWED_USES = [
  "coordination",
  "cache",
  "rate-limit",
  "ephemeral-lock",
  "transport-optimization",
] as const;

export function classifyStateStore(store: string): "authoritative" | "cache" | "unknown" {
  const s = store.toLowerCase();
  if (s.includes("postgres") || s.includes("prisma") || s.includes("object-storage") || s.includes("s3")) {
    return "authoritative";
  }
  if (s.includes("redis")) {
    return "cache";
  }
  return "unknown";
}

export function assertAuthoritativeNotRedisOnly(input: {
  durableJobStateStore: string;
  paymentLedgerStore: string;
}): { ok: true } | { ok: false; reason: string } {
  for (const [label, store] of [
    ["job", input.durableJobStateStore],
    ["payment", input.paymentLedgerStore],
  ] as const) {
    if (classifyStateStore(store) === "cache") {
      return { ok: false, reason: `${label} state must not be Redis-only` };
    }
  }
  return { ok: true };
}
