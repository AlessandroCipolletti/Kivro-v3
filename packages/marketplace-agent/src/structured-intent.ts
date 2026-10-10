import type { BuyerConstraints } from "@kivro/marketplace";
import { normalizeBuyerConstraints } from "@kivro/marketplace";

/** §172 — model JSON cannot become a purchase or raise the buyer's budget. */
const ALLOWED_KEYS = new Set([
  "intentLabel",
  "maxTotalSpendCents",
  "maxPerJobSpendCents",
  "minRating",
  "onlineOnly",
]);

export function acceptModelIntent(
  raw: unknown,
  floor: Partial<BuyerConstraints>,
): { intentLabel: string; constraints: BuyerConstraints } | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return null;
  }
  const obj = raw as Record<string, unknown>;
  if ("purchase" in obj || "charge" in obj || "jobId" in obj || "paymentIntent" in obj) {
    return null;
  }
  for (const key of Object.keys(obj)) {
    if (!ALLOWED_KEYS.has(key)) {
      return null;
    }
  }
  const model: Partial<BuyerConstraints> = {};
  if (typeof obj.maxTotalSpendCents === "number" && obj.maxTotalSpendCents > 0) {
    model.maxTotalSpendCents = obj.maxTotalSpendCents;
  }
  if (typeof obj.maxPerJobSpendCents === "number" && obj.maxPerJobSpendCents > 0) {
    model.maxPerJobSpendCents = obj.maxPerJobSpendCents;
  }
  if (typeof obj.minRating === "number") {
    model.minRating = obj.minRating;
  }
  if (obj.onlineOnly === true) {
    model.onlineOnly = true;
  }
  const constraints = clampModelConstraints(model, floor);
  const intentLabel =
    typeof obj.intentLabel === "string" && obj.intentLabel.trim()
      ? obj.intentLabel.trim().slice(0, 80)
      : "general_marketplace_search";
  return { intentLabel, constraints };
}

export function clampModelConstraints(
  model: Partial<BuyerConstraints>,
  floor: Partial<BuyerConstraints>,
): BuyerConstraints {
  const base = normalizeBuyerConstraints(floor);
  const merged = normalizeBuyerConstraints({ ...base, ...model });
  if (base.maxTotalSpendCents != null) {
    merged.maxTotalSpendCents = Math.min(
      merged.maxTotalSpendCents ?? base.maxTotalSpendCents,
      base.maxTotalSpendCents,
    );
  }
  if (base.maxPerJobSpendCents != null) {
    merged.maxPerJobSpendCents = Math.min(
      merged.maxPerJobSpendCents ?? base.maxPerJobSpendCents,
      base.maxPerJobSpendCents,
    );
  }
  if (base.minRating != null) {
    merged.minRating = Math.max(merged.minRating ?? base.minRating, base.minRating);
  }
  return merged;
}
