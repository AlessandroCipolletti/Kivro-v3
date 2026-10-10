import type { SecurityWarning } from "@kivro/seller-health";

/** SELLERUX-026..027 — deterministic auto-pause reason and remediation. */
export function buildAutoPauseExplanation(input: {
  platformSecurityPause: boolean;
  platformSecurityPauseReason: string | null;
  emergencyPause: boolean;
  warnings: SecurityWarning[];
}): {
  autoPaused: boolean;
  reason: string | null;
  evidence: string[];
  remediation: string[];
  retestHint: string;
} {
  const blocking = input.warnings.filter((w) => w.blocking);
  if (input.platformSecurityPause) {
    return {
      autoPaused: true,
      reason: input.platformSecurityPauseReason ?? "PLATFORM_SECURITY",
      evidence: blocking.map((w) => w.title),
      remediation: [
        "Fix Worker health blockers reported in dashboard.",
        "Run kivro-worker doctor and kivro-worker health.",
      ],
      retestHint: "Resume is allowed only after blocking warnings clear.",
    };
  }
  if (input.emergencyPause) {
    return {
      autoPaused: true,
      reason: "SELLER_EMERGENCY_PAUSE",
      evidence: ["Seller enabled emergency pause"],
      remediation: ["Use dashboard to resume when ready."],
      retestHint: "Emergency pause is manual — not auto-cleared.",
    };
  }
  if (blocking.length >= 3) {
    return {
      autoPaused: true,
      reason: "REPEATED_HEALTH_FAILURE",
      evidence: blocking.map((w) => w.title),
      remediation: blocking.map((w) => w.title),
      retestHint: "Clear blocking warnings then refresh Worker health.",
    };
  }
  return {
    autoPaused: false,
    reason: null,
    evidence: [],
    remediation: [],
    retestHint: "No auto-pause active.",
  };
}
