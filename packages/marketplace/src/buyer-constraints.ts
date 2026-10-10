/** §134 — hard buyer constraints enforced outside any LLM. */
export type BuyerConstraints = {
  maxTotalSpendCents?: number;
  maxPerJobSpendCents?: number;
  minRating?: number;
  maxRuntimeSeconds?: number;
  onlineOnly?: boolean;
  maxJobs?: number;
  preferredCapabilitySlugs?: string[];
  blockedSellerProfileIds?: string[];
  /** ISO-8601 hard delivery deadline (BUYERUX-004/006). */
  hardDeliveryDeadlineAt?: string;
  /**
   * IMMEDIATE excludes future-only services.
   * DEADLINE allows a window that finishes in time.
   * EARLIEST_AVAILABLE_ALLOWED is set only when the buyer explicitly permits a wait.
   */
  timingMode?: "IMMEDIATE" | "DEADLINE" | "EARLIEST_AVAILABLE_ALLOWED";
  /** Hard contract filter: a text-only capability cannot satisfy a file request. */
  needsFileInput?: boolean;
};

export function normalizeBuyerConstraints(raw: Partial<BuyerConstraints>): BuyerConstraints {
  const out: BuyerConstraints = {};
  if (raw.maxTotalSpendCents != null && raw.maxTotalSpendCents > 0) {
    out.maxTotalSpendCents = Math.floor(raw.maxTotalSpendCents);
  }
  if (raw.maxPerJobSpendCents != null && raw.maxPerJobSpendCents > 0) {
    out.maxPerJobSpendCents = Math.floor(raw.maxPerJobSpendCents);
  }
  if (raw.minRating != null && raw.minRating >= 0) {
    out.minRating = Math.min(5, raw.minRating);
  }
  if (raw.maxRuntimeSeconds != null && raw.maxRuntimeSeconds > 0) {
    out.maxRuntimeSeconds = Math.floor(raw.maxRuntimeSeconds);
  }
  if (raw.onlineOnly === true) {
    out.onlineOnly = true;
  }
  if (raw.maxJobs != null && raw.maxJobs > 0) {
    out.maxJobs = Math.min(20, Math.floor(raw.maxJobs));
  }
  if (raw.preferredCapabilitySlugs?.length) {
    out.preferredCapabilitySlugs = raw.preferredCapabilitySlugs.slice(0, 20);
  }
  if (raw.blockedSellerProfileIds?.length) {
    out.blockedSellerProfileIds = raw.blockedSellerProfileIds.slice(0, 50);
  }
  if (raw.hardDeliveryDeadlineAt) {
    const t = Date.parse(raw.hardDeliveryDeadlineAt);
    if (Number.isFinite(t)) {
      out.hardDeliveryDeadlineAt = new Date(t).toISOString();
    }
  }
  if (
    raw.timingMode === "IMMEDIATE" ||
    raw.timingMode === "DEADLINE" ||
    raw.timingMode === "EARLIEST_AVAILABLE_ALLOWED"
  ) {
    out.timingMode = raw.timingMode;
  }
  if (raw.needsFileInput === true) {
    out.needsFileInput = true;
  }
  return out;
}

/** Lightweight constraint extraction from natural language (deterministic). */
export function extractConstraintsFromText(text: string): BuyerConstraints {
  const lower = text.toLowerCase();
  const out: BuyerConstraints = {};

  const budgetMatch =
    lower.match(/(?:under|less than|max(?:imum)?|at most|<=)\s*\$?\s*(\d+(?:\.\d{1,2})?)/) ??
    lower.match(/\$(\d+(?:\.\d{1,2})?)\s*(?:budget|max|limit)/);
  if (budgetMatch) {
    out.maxPerJobSpendCents = Math.round(Number.parseFloat(budgetMatch[1]!) * 100);
    out.maxTotalSpendCents = out.maxPerJobSpendCents;
  }

  const ratingMatch =
    lower.match(/(?:rated|rating)\s*(?:at least|>=|above|over)?\s*(\d+(?:\.\d)?)/) ??
    lower.match(/(?:at least|>=)\s*(\d+(?:\.\d)?)\s*(?:stars?|rating)/);
  if (ratingMatch) {
    out.minRating = Number.parseFloat(ratingMatch[1]!);
  }

  if (/\bonline now\b|\bonline only\b|\bavailable now\b/.test(lower)) {
    out.onlineOnly = true;
  }

  if (
    /\byou can schedule\b|\bschedule if necessary\b|\bi can wait\b|\bwilling to wait\b|\bdon't care if it runs\b|\bdont care if it runs\b/.test(
      lower,
    )
  ) {
    out.timingMode = "EARLIEST_AVAILABLE_ALLOWED";
  }

  const deadlineIso = text.match(
    /\b(?:by|before|deadline)\s+(\d{4}-\d{2}-\d{2}(?:T[\d:.]+Z)?)/i,
  );
  if (deadlineIso) {
    out.hardDeliveryDeadlineAt = new Date(deadlineIso[1]!).toISOString();
  }

  const runtimeMatch = lower.match(/(?:under|less than|max)\s*(\d+)\s*(?:sec|seconds|min|minutes)/);
  if (runtimeMatch) {
    const n = Number.parseInt(runtimeMatch[1]!, 10);
    out.maxRuntimeSeconds = lower.includes("min") ? n * 60 : n;
  }

  return normalizeBuyerConstraints(out);
}

export function searchQueryFromIntent(text: string): string {
  return text
    .replace(/\$(\d+(?:\.\d{1,2})?)/g, "")
    .replace(/\b(under|less than|at least|rated|rating|online|budget|max|minutes?|seconds?)\b/gi, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 500);
}
