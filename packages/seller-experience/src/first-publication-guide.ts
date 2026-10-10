/** SELLERUX-039 — post-publish first-sale onboarding copy. */
export function buildFirstPublicationGuide(input: {
  capabilitySlug: string;
  marketplaceSellerId: string;
  payoutReady: boolean;
}): {
  title: string;
  steps: Array<{ id: string; title: string; detail: string; href?: string }>;
} {
  const steps = [
    {
      id: "preview_listing",
      title: "Preview your public listing",
      detail: "Confirm title, price tier, and buyer form match what you intended.",
      href: `/capabilities/${input.capabilitySlug}`,
    },
    {
      id: "share_link",
      title: "Share your capability link",
      detail: "Send buyers to the capability page — not your Worker machine.",
      href: `/capabilities/${input.capabilitySlug}`,
    },
    {
      id: "availability",
      title: "Set availability",
      detail: "Configure schedule or pause windows so buyers see accurate availability.",
      href: "/seller/dashboard",
    },
    {
      id: "payout",
      title: input.payoutReady ? "Payouts connected" : "Finish payout setup",
      detail: input.payoutReady
        ? "Earnings will flow to your connected account after settlement."
        : "Complete Stripe Connect before your first paid settlement.",
      href: "/seller/dashboard",
    },
    {
      id: "seller_profile",
      title: "Public seller profile",
      detail: "Buyers see your marketplace display name — not private KYC data.",
      href: `/sellers/${input.marketplaceSellerId}`,
    },
  ];
  return { title: "First publication — what to do next", steps };
}
