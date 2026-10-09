const API_BASE =
  process.env.KIVRO_API_URL ??
  process.env.NEXT_PUBLIC_KIVRO_API_URL ??
  "http://localhost:3001";

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
};

export async function fetchMarketplaceCapabilities(
  searchParams?: Record<string, string>,
): Promise<{ capabilities: MarketplaceCapability[]; meta: { categories: string[] } }> {
  const qs = new URLSearchParams(searchParams);
  const res = await fetch(`${API_BASE}/marketplace/capabilities?${qs.toString()}`, {
    next: { revalidate: 15 },
  });
  if (!res.ok) {
    throw new Error("MARKETPLACE_FETCH_FAILED");
  }
  return (await res.json()) as {
    capabilities: MarketplaceCapability[];
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

export { API_BASE };
