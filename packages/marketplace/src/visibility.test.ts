import { describe, expect, it } from "vitest";
import {
  canPurchaseCapability,
  canRecommendByDefault,
  canViewCapability,
  isPublicMarketplaceListing,
  visibilityAfterPublish,
  visibilityTransitionError,
} from "./visibility.js";

describe("capability visibility §§312–318", () => {
  it("lists only published public capabilities", () => {
    expect(
      isPublicMarketplaceListing({
        status: "PUBLISHED",
        visibility: "PUBLIC",
        currentVersionId: "v1",
      }),
    ).toBe(true);
    expect(
      isPublicMarketplaceListing({
        status: "PUBLISHED",
        visibility: "UNLISTED",
        currentVersionId: "v1",
      }),
    ).toBe(false);
    expect(
      isPublicMarketplaceListing({
        status: "DRAFT",
        visibility: "PUBLIC",
        currentVersionId: null,
      }),
    ).toBe(false);
  });

  it("lets a granted buyer see and buy a private capability", () => {
    const base = { status: "PUBLISHED" as const, visibility: "PRIVATE" as const };
    expect(canViewCapability({ ...base, isSeller: false, hasGrant: false })).toBe(false);
    expect(canViewCapability({ ...base, isSeller: false, hasGrant: true })).toBe(true);
    expect(canPurchaseCapability({ ...base, hasGrant: true })).toBe(true);
    expect(canPurchaseCapability({ ...base, hasGrant: false })).toBe(false);
  });

  it("opens unlisted capabilities by link and keeps them out of agent recommendations", () => {
    expect(
      canViewCapability({
        status: "PUBLISHED",
        visibility: "UNLISTED",
        isSeller: false,
        hasGrant: false,
      }),
    ).toBe(true);
    expect(canRecommendByDefault("UNLISTED")).toBe(false);
    expect(canRecommendByDefault("PUBLIC")).toBe(true);
  });

  it("promotes a draft to public on publish and keeps an explicit unlisted choice", () => {
    expect(visibilityAfterPublish("DRAFT")).toBe("PUBLIC");
    expect(visibilityAfterPublish("UNLISTED")).toBe("UNLISTED");
    expect(
      visibilityTransitionError({
        to: "PUBLIC",
        status: "DRAFT",
        hasCurrentVersion: false,
        hasPrice: false,
      }),
    ).toBe("PUBLISH_BEFORE_EXPOSURE");
  });
});
