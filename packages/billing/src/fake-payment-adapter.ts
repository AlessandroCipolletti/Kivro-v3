/**
 * Deterministic dev payment adapter (Master Spec §564).
 * Production must never enable this adapter.
 */
import { isDevPaymentShortcutsEnabled } from "./dev-payment.js";

export type FakePaymentOutcome = "success" | "insufficient_funds" | "declined";

export function isFakePaymentAdapterEnabled(): boolean {
  return (
    isDevPaymentShortcutsEnabled() &&
    process.env.KIVRO_FAKE_PAYMENT_ADAPTER === "true"
  );
}

export function assertFakePaymentAdapterAllowed(): void {
  if (process.env.NODE_ENV === "production") {
    throw new Error("FAKE_PAYMENT_ADAPTER_FORBIDDEN_IN_PRODUCTION");
  }
  if (!isFakePaymentAdapterEnabled()) {
    throw new Error("FAKE_PAYMENT_ADAPTER_DISABLED");
  }
}

/** Resolve scripted outcome for local E2E (default success). */
export function resolveFakePaymentOutcome(): FakePaymentOutcome {
  assertFakePaymentAdapterAllowed();
  const mode = process.env.KIVRO_FAKE_PAYMENT_MODE ?? "success";
  if (mode === "insufficient_funds" || mode === "declined" || mode === "success") {
    return mode;
  }
  return "success";
}
