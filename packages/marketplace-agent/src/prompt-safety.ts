/** §147 — strip patterns that look like instruction injection from untrusted marketplace text. */
export function sanitizeMarketplaceTextForAgent(text: string, maxLen = 4000): string {
  const trimmed = text.slice(0, maxLen);
  return trimmed
    .replace(/<\/?system>/gi, "")
    .replace(/ignore (all )?(previous|prior) instructions/gi, "[filtered]")
    .replace(/you are now (a|an) /gi, "[filtered] ");
}
