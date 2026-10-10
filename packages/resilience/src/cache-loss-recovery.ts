/** HARD-016 — after Redis/cache loss, recovery must rehydrate from PostgreSQL only. */

export type CacheLossRecoveryPlan = {
  rehydrateJobStateFrom: "postgresql";
  rehydratePaymentsFrom: "postgresql";
  invalidateEphemeralCaches: true;
  redispatchVia: "idempotent-durable-work-queue";
};

export function buildCacheLossRecoveryPlan(): CacheLossRecoveryPlan {
  return {
    rehydrateJobStateFrom: "postgresql",
    rehydratePaymentsFrom: "postgresql",
    invalidateEphemeralCaches: true,
    redispatchVia: "idempotent-durable-work-queue",
  };
}

export function assertCacheLossRecoveryPlan(plan: CacheLossRecoveryPlan): {
  ok: true;
} | {
  ok: false;
  reason: string;
} {
  if (plan.rehydrateJobStateFrom !== "postgresql" || plan.rehydratePaymentsFrom !== "postgresql") {
    return { ok: false, reason: "Authoritative rehydration must use PostgreSQL" };
  }
  if (!plan.invalidateEphemeralCaches) {
    return { ok: false, reason: "Ephemeral caches must be invalidated after Redis loss" };
  }
  return { ok: true };
}
