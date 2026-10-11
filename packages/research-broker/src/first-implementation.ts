/** §264 — the first research implementation is search plus a safe fetch. */

export const FIRST_RESEARCH_IMPLEMENTATION = "search_and_fetch" as const;

const FIRST_TOOLS = ["web.search", "web.fetch"] as const;

export function researchImplementationMode(): typeof FIRST_RESEARCH_IMPLEMENTATION {
  return FIRST_RESEARCH_IMPLEMENTATION;
}

export function researchToolAllowed(tool: string): boolean {
  return (FIRST_TOOLS as readonly string[]).includes(tool);
}

/** Seller Chrome, cookies, signed-in sessions, and an unrestricted seller IP are never a research channel. */
export function sellerBrowserResearchChannelAllowed(channel: string): boolean {
  const refused = [
    "personal_chrome",
    "seller_cookies",
    "seller_authenticated_session",
    "seller_ip_proxy",
  ];
  return !refused.includes(channel);
}
