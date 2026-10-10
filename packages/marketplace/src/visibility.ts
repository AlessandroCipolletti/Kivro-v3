/** Master Spec §§312–318 — visibility is separate from runtime status. */

export const CAPABILITY_VISIBILITIES = ["DRAFT", "PRIVATE", "UNLISTED", "PUBLIC"] as const;
export type CapabilityVisibility = (typeof CAPABILITY_VISIBILITIES)[number];

export const MAX_PUBLISHED_EXAMPLES = 3;

export function isCapabilityVisibility(value: string): value is CapabilityVisibility {
  return (CAPABILITY_VISIBILITIES as readonly string[]).includes(value);
}

export function isPublicMarketplaceListing(input: {
  status: string;
  visibility: string;
  currentVersionId?: string | null;
}): boolean {
  return (
    input.status === "PUBLISHED" &&
    input.visibility === "PUBLIC" &&
    Boolean(input.currentVersionId)
  );
}

export function canViewCapability(input: {
  status: string;
  visibility: CapabilityVisibility;
  isSeller: boolean;
  hasGrant: boolean;
}): boolean {
  if (input.isSeller) {
    return true;
  }
  if (input.status !== "PUBLISHED" && input.status !== "PAUSED") {
    return false;
  }
  if (input.visibility === "PUBLIC" || input.visibility === "UNLISTED") {
    return true;
  }
  if (input.visibility === "PRIVATE") {
    return input.hasGrant;
  }
  return false;
}

export function canPurchaseCapability(input: {
  status: string;
  visibility: CapabilityVisibility;
  hasGrant: boolean;
}): boolean {
  if (input.status !== "PUBLISHED") {
    return false;
  }
  if (input.visibility === "PUBLIC" || input.visibility === "UNLISTED") {
    return true;
  }
  if (input.visibility === "PRIVATE") {
    return input.hasGrant;
  }
  return false;
}

/** Agent recommendations stay on listed capabilities. A known link may still open UNLISTED. */
export function canRecommendByDefault(visibility: CapabilityVisibility): boolean {
  return visibility === "PUBLIC";
}

export function visibilityTransitionError(input: {
  to: CapabilityVisibility;
  status: string;
  hasCurrentVersion: boolean;
  hasPrice: boolean;
}): string | null {
  if (input.to === "UNLISTED" || input.to === "PUBLIC" || input.to === "PRIVATE") {
    if (input.status !== "PUBLISHED" && input.status !== "PAUSED") {
      return "PUBLISH_BEFORE_EXPOSURE";
    }
    if (!input.hasCurrentVersion || !input.hasPrice) {
      return "PUBLIC_REQUIRES_ACTIVE_VERSION";
    }
  }
  return null;
}

export function visibilityAfterPublish(current: CapabilityVisibility): CapabilityVisibility {
  return current === "DRAFT" ? "PUBLIC" : current;
}
