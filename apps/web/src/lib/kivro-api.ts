const API_BASE =
  process.env.KIVRO_API_URL ??
  process.env.NEXT_PUBLIC_KIVRO_API_URL ??
  "http://localhost:3007";

export type MarketplaceCapability = {
  id: string;
  slug: string;
  name: string;
  description: string;
  category: string;
  priceTierCents: number | null;
  currency: string;
  rating: number | null;
  jobCount: number;
  estimatedDuration: number | null;
  sellerDisplayName: string;
  availabilityStatus?: string;
  accepting?: boolean;
  nextAvailableAt?: string | null;
  contractCard?: { input: string; output: string } | null;
};

export async function fetchMarketplaceCapabilities(
  searchParams?: Record<string, string>,
): Promise<{
  capabilities: MarketplaceCapability[];
  groups?: { availableNow: string[]; availableLater: string[] };
  meta: { categories: string[] };
}> {
  const qs = new URLSearchParams(searchParams);
  const res = await fetch(`${API_BASE}/marketplace/capabilities?${qs.toString()}`, {
    next: { revalidate: 15 },
  });
  if (!res.ok) {
    throw new Error("MARKETPLACE_FETCH_FAILED");
  }
  return (await res.json()) as {
    capabilities: MarketplaceCapability[];
    groups?: { availableNow: string[]; availableLater: string[] };
    meta: { categories: string[] };
  };
}

export type CapabilityDetailResponse = {
  capability: {
    id: string;
    name: string;
    description: string;
    slug: string;
    currency: string;
    priceTierCents: number | null;
    estimatedDuration: number | null;
    currentVersion?: { priceSnapshotCents: number };
  };
  seller?: { id: string; displayName: string; verificationStatus: string };
  buyerTrust?: unknown;
  buyerForm?: {
    fields: Array<{
      key: string;
      label: string;
      description?: string;
      required: boolean;
      widget: string;
      constraints: Record<string, unknown>;
    }>;
  };
  availability?: {
    status: string;
    accepting: boolean;
    nextAvailableAt: string | null;
  };
  reviews?: { average: number | null; count: number };
  examples?: Array<{ label?: string; values: Record<string, unknown> }>;
  publishedExamples?: Array<{
    id: string;
    title: string;
    description: string | null;
    inputValues: unknown;
    outputValues: unknown;
    source: string;
  }>;
  privacyDisclosure?: { executionModel: string; dataHandling: string; retention: string };
};

export async function fetchCapabilityDetail(slug: string): Promise<CapabilityDetailResponse | null> {
  const res = await fetch(`${API_BASE}/capabilities/${encodeURIComponent(slug)}`, {
    next: { revalidate: 15 },
  });
  if (!res.ok) {
    return null;
  }
  return (await res.json()) as CapabilityDetailResponse;
}

export type AvailabilityResponse = {
  status: string;
  accepting: boolean;
  nextAvailableAt?: string | null;
  purchaseAction?: "RUN_NOW" | "SCHEDULE_EARLIEST" | "JOIN_QUEUE" | "UNAVAILABLE";
  purchaseLabel?: string;
  cardLabel?: string;
};

export async function fetchAvailability(slug: string): Promise<AvailabilityResponse | null> {
  const res = await fetch(`${API_BASE}/capabilities/${encodeURIComponent(slug)}/availability`, {
    next: { revalidate: 30 },
  });
  if (!res.ok) {
    return null;
  }
  return (await res.json()) as AvailabilityResponse;
}

export async function fetchCapabilityReviews(slug: string): Promise<{
  rating: number | null;
  reviewCount: number;
  reviews: Array<{ id: string; stars: number; body: string | null }>;
} | null> {
  const res = await fetch(`${API_BASE}/capabilities/${encodeURIComponent(slug)}/reviews`, {
    next: { revalidate: 60 },
  });
  if (!res.ok) {
    return null;
  }
  const body = (await res.json()) as {
    rating: number | null;
    reviewCount: number;
    reviews: Array<{ id: string; stars: number; body: string | null }>;
  };
  return body;
}

export type BuyerApiKeyRow = {
  id: string;
  name: string;
  prefix: string;
  scopes: string[];
  createdAt: string;
  lastUsedAt: string | null;
  expiresAt: string | null;
};

export async function fetchBuyerApiKeys(): Promise<{ keys: BuyerApiKeyRow[] } | { error: string }> {
  const res = await fetch(`${API_BASE}/buyer/api-keys`, { credentials: "include" });
  if (res.status === 401) {
    return { error: "UNAUTHORIZED" };
  }
  if (!res.ok) {
    return { error: "FETCH_FAILED" };
  }
  return (await res.json()) as { keys: BuyerApiKeyRow[] };
}

export async function createBuyerApiKey(input: {
  name: string;
  scopes?: string[];
  expiresAt?: string;
}): Promise<
  | { id: string; prefix: string; secret: string; scopes: string[]; warning?: string }
  | { error: string }
> {
  const res = await fetch(`${API_BASE}/buyer/api-keys`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  const body = (await res.json()) as Record<string, unknown>;
  if (!res.ok) {
    return { error: String(body.error ?? "CREATE_FAILED") };
  }
  return body as {
    id: string;
    prefix: string;
    secret: string;
    scopes: string[];
    warning?: string;
  };
}

export async function revokeBuyerApiKey(keyId: string): Promise<{ ok: true } | { error: string }> {
  const res = await fetch(`${API_BASE}/buyer/api-keys/${keyId}/revoke`, {
    method: "POST",
    credentials: "include",
  });
  if (!res.ok) {
    return { error: "REVOKE_FAILED" };
  }
  return { ok: true };
}

export type WebhookEndpointRow = {
  id: string;
  url: string;
  events: string[];
  enabled: boolean;
  lastSuccessAt: string | null;
  lastFailureAt: string | null;
  failureCount: number;
  createdAt: string;
};

export async function fetchBuyerWebhooks(): Promise<
  { endpoints: WebhookEndpointRow[] } | { error: string }
> {
  const res = await fetch(`${API_BASE}/buyer/webhooks`, { credentials: "include" });
  if (res.status === 401) {
    return { error: "UNAUTHORIZED" };
  }
  if (!res.ok) {
    return { error: "FETCH_FAILED" };
  }
  return (await res.json()) as { endpoints: WebhookEndpointRow[] };
}

export async function createBuyerWebhook(input: {
  url: string;
  events?: string[];
}): Promise<
  | { endpoint: { id: string; url: string; events: string[] }; secret: string; warning?: string }
  | { error: string }
> {
  const res = await fetch(`${API_BASE}/buyer/webhooks`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  const body = (await res.json()) as Record<string, unknown>;
  if (!res.ok) {
    return { error: String(body.error ?? "CREATE_FAILED") };
  }
  return body as {
    endpoint: { id: string; url: string; events: string[] };
    secret: string;
    warning?: string;
  };
}

export async function fetchWebhookDeliveries(
  endpointId: string,
): Promise<
  | {
      deliveries: Array<{
        id: string;
        eventType: string;
        success: boolean;
        statusCode: number | null;
        createdAt: string;
      }>;
    }
  | { error: string }
> {
  const res = await fetch(`${API_BASE}/buyer/webhooks/${endpointId}/deliveries`, {
    credentials: "include",
  });
  if (!res.ok) {
    return { error: "FETCH_FAILED" };
  }
  return (await res.json()) as {
    deliveries: Array<{
      id: string;
      eventType: string;
      success: boolean;
      statusCode: number | null;
      createdAt: string;
    }>;
  };
}

export async function disableBuyerWebhook(endpointId: string): Promise<{ ok: true } | { error: string }> {
  const res = await fetch(`${API_BASE}/buyer/webhooks/${endpointId}/disable`, {
    method: "POST",
    credentials: "include",
  });
  if (!res.ok) {
    return { error: "DISABLE_FAILED" };
  }
  return { ok: true };
}

export { API_BASE };
