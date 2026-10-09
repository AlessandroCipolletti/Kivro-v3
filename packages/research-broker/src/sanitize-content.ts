/** §271 — normalized page text for agent consumption (not raw HTML/JS). */
export interface WebPageResult {
  finalUrl: string;
  title?: string;
  text: string;
  contentType: string;
  fetchedAt: string;
  contentSha256: string;
}

export function sanitizeResearchText(htmlOrText: string, contentType: string): string {
  const lower = contentType.toLowerCase();
  if (lower.includes("html")) {
    return htmlOrText
      .replace(/<script[\s\S]*?<\/script>/gi, "")
      .replace(/<style[\s\S]*?<\/style>/gi, "")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }
  return htmlOrText.trim();
}
