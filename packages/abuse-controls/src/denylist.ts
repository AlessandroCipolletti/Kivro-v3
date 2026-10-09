/** §30 — deterministic input denylist (not LLM moderation). */

export const BUILTIN_DENYLIST_PATTERNS: Array<{ pattern: string; flags?: string; category: string }> = [
  {
    pattern: "ignore\\s+(all\\s+)?(previous|prior)\\s+instructions",
    flags: "i",
    category: "PROMPT_INJECTION",
  },
  {
    pattern: "reveal\\s+(the\\s+)?(system|hidden)\\s+prompt",
    flags: "i",
    category: "PROMPT_INJECTION",
  },
  {
    pattern: "(/etc/passwd|\\.ssh/id_rsa|AWS_SECRET)",
    flags: "i",
    category: "CREDENTIAL_HARVEST",
  },
  {
    pattern: "(docker\\.sock|169\\.254\\.169\\.254)",
    flags: "i",
    category: "INFRA_PROBE",
  },
];

export function compileDenylistPatterns(
  rows: Array<{ pattern: string; active: boolean }>,
): RegExp[] {
  const compiled: RegExp[] = [];
  for (const row of rows) {
    if (!row.active) continue;
    try {
      compiled.push(new RegExp(row.pattern));
    } catch {
      // Skip invalid admin patterns; do not fail closed on misconfiguration.
    }
  }
  for (const built of BUILTIN_DENYLIST_PATTERNS) {
    compiled.push(new RegExp(built.pattern, built.flags ?? "i"));
  }
  return compiled;
}

export function findDenylistMatch(
  haystack: string,
  patterns: RegExp[],
): { matched: true; index: number } | { matched: false } {
  for (let i = 0; i < patterns.length; i++) {
    if (patterns[i].test(haystack)) {
      return { matched: true, index: i };
    }
  }
  return { matched: false };
}

export function stringifyBuyerPayload(input: Record<string, unknown>): string {
  try {
    return JSON.stringify(input);
  } catch {
    return String(input);
  }
}
