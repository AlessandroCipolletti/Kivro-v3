/** §159 — MVP agent commerce stops at an approved OpenClaw plan. */
const FORBIDDEN = new Set([
  "indefinite_autonomous",
  "recurring_purchase",
  "negotiate_price",
  "create_capability",
  "install_seller_dependencies",
  "non_openclaw_provider",
  "arbitrary_internet_purchasing",
  "unlimited_budget",
]);

const ALLOWED = new Set([
  "discover",
  "shortlist",
  "recommend",
  "prepare_job_draft",
  "multi_job_plan",
  "execute_after_approval",
]);

export function mvpAgentAllows(action: string): boolean {
  if (FORBIDDEN.has(action)) {
    return false;
  }
  return ALLOWED.has(action);
}
