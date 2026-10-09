export const BUYER_API_SCOPES = [
  "capabilities:read",
  "jobs:create",
  "jobs:read",
  "assets:create",
  "assets:read",
  "webhooks:manage",
] as const;

export type BuyerApiScope = (typeof BUYER_API_SCOPES)[number];

export const DEFAULT_BUYER_API_SCOPES: BuyerApiScope[] = [
  "capabilities:read",
  "jobs:create",
  "jobs:read",
];

export function parseScopes(raw: unknown): BuyerApiScope[] {
  if (!Array.isArray(raw)) {
    return [...DEFAULT_BUYER_API_SCOPES];
  }
  return raw.filter((s): s is BuyerApiScope =>
    typeof s === "string" && (BUYER_API_SCOPES as readonly string[]).includes(s),
  );
}

export function scopesAllow(scopes: string[], required: BuyerApiScope): boolean {
  return scopes.includes(required);
}
