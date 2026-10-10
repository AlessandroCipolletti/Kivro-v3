/** Master Spec §3. The first product stays inside these boundaries. */

export const MVP_IN_SCOPE = [
  "openclaw_sellers",
  "read_only_discovery",
  "outbound_worker_connection",
  "docker_sandbox",
  "structured_job_inputs",
  "prepaid_credits",
] as const;

export const MVP_OUT_OF_SCOPE = [
  "gpu_rental",
  "hardware_marketplace",
  "auctions",
  "automatic_price_negotiation",
  "other_agent_frameworks",
  "unrestricted_shell",
  "unrestricted_browser",
  "unrestricted_outbound_http",
] as const;

export function mvpAllows(feature: string): boolean {
  return (MVP_IN_SCOPE as readonly string[]).includes(feature);
}
