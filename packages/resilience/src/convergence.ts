/** HARD-006 — converged authoritative state assertions for fault-injection tests. */

export type ConvergenceCheck =
  | { ok: true }
  | { ok: false; code: string; detail: string };

export function assertExactlyOnceFinancialEffect(input: {
  settlementAttempts: number;
  distinctLedgerKeys: string[];
  expectedMinKeys: number;
}): ConvergenceCheck {
  if (input.settlementAttempts < 1) {
    return { ok: false, code: "NO_SETTLEMENT", detail: "Expected at least one settlement attempt" };
  }
  const unique = new Set(input.distinctLedgerKeys);
  if (unique.size !== input.distinctLedgerKeys.length) {
    return { ok: false, code: "DUPLICATE_LEDGER_KEY", detail: "Duplicate idempotency keys applied" };
  }
  if (unique.size < input.expectedMinKeys) {
    return {
      ok: false,
      code: "INCOMPLETE_LEDGER",
      detail: `Expected >= ${input.expectedMinKeys} distinct ledger keys`,
    };
  }
  return { ok: true };
}

export function assertJobTerminalConverged(input: {
  finalStatus: string;
  allowed: string[];
}): ConvergenceCheck {
  if (!input.allowed.includes(input.finalStatus)) {
    return {
      ok: false,
      code: "JOB_NOT_CONVERGED",
      detail: `Status ${input.finalStatus} not in ${input.allowed.join(",")}`,
    };
  }
  return { ok: true };
}

export function assertDuplicateDeliveryHarmless(input: {
  deliveryCount: number;
  sideEffectCount: number;
}): ConvergenceCheck {
  if (input.deliveryCount > 1 && input.sideEffectCount > 1) {
    return {
      ok: false,
      code: "DUPLICATE_SIDE_EFFECT",
      detail: "Duplicate delivery caused multiple side effects",
    };
  }
  return { ok: true };
}
