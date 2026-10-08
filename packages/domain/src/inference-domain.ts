/** Master Spec §163 — platform vs seller inference must not share billing/credentials. */

export type InferenceDomain = "PLATFORM" | "SELLER";

export interface InferenceUsageContext {
  domain: InferenceDomain;
  /** Credential owner — must match domain. */
  billingOwner: "PLATFORM" | "SELLER";
  purpose: string;
}

export function assertInferenceDomainIsolation(ctx: InferenceUsageContext): void {
  if (ctx.domain === "PLATFORM" && ctx.billingOwner !== "PLATFORM") {
    throw new Error("Platform inference must use platform billing");
  }
  if (ctx.domain === "SELLER" && ctx.billingOwner !== "SELLER") {
    throw new Error("Seller inference must use seller billing");
  }
}
