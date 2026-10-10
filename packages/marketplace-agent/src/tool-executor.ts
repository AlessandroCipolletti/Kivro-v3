/** §171 — the platform executes tools. A model name is not authorization. */
export const MARKETPLACE_TOOL_NAMES = [
  "search_capabilities",
  "get_capability",
  "get_price_quote",
  "get_availability",
  "create_orchestration_plan",
] as const;

export type MarketplaceToolName = (typeof MARKETPLACE_TOOL_NAMES)[number];

export type ToolDispatchResult =
  | { ok: true; result: unknown }
  | { ok: false; error: "UNKNOWN_TOOL" | "INVALID_ARGS" };

export function isMarketplaceToolName(name: string): name is MarketplaceToolName {
  return (MARKETPLACE_TOOL_NAMES as readonly string[]).includes(name);
}

export function dispatchMarketplaceTool(
  name: string,
  args: unknown,
  handlers: Partial<Record<MarketplaceToolName, (args: Record<string, unknown>) => unknown>>,
): ToolDispatchResult {
  if (!isMarketplaceToolName(name)) {
    return { ok: false, error: "UNKNOWN_TOOL" };
  }
  if (!args || typeof args !== "object" || Array.isArray(args)) {
    return { ok: false, error: "INVALID_ARGS" };
  }
  const handler = handlers[name];
  if (!handler) {
    return { ok: false, error: "UNKNOWN_TOOL" };
  }
  return { ok: true, result: handler(args as Record<string, unknown>) };
}
