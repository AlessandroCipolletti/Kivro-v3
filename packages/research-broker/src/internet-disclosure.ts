import type { InternetResearchPolicy, WorkerManifest } from "@kivro/contracts";

/** §257 / §258 — seller + buyer internet permission copy. */
export function buildInternetPermissionSummary(manifest: WorkerManifest): {
  sellerSummary: string[];
  buyerSummary: string[];
  buyerDetail: string[];
} {
  const policy: InternetResearchPolicy =
    manifest.internet ?? { mode: "NO_NETWORK", domainPolicy: "ANY_PUBLIC_DOMAIN" };
  if (policy.mode === "NO_NETWORK") {
    return {
      sellerSummary: ["No Internet access"],
      buyerSummary: ["No Internet access"],
      buyerDetail: ["This capability does not use the public Internet during jobs."],
    };
  }
  if (policy.mode === "PUBLIC_WEB_RESEARCH") {
    const lines = ["Public web research"];
    const seller = [
      "INTERNET ACCESS: Public web research",
      policy.search?.enabled ? "✓ Search the public web" : "✗ Search disabled",
      policy.fetch?.enabled ? "✓ Read public webpages" : "✗ Fetch disabled",
      policy.fetch?.allowDocumentDownload
        ? "✓ Download public documents/images (within limits)"
        : "✗ Document download disabled",
      "High-risk remote actions (POST, purchase, email) are not enabled.",
    ];
    return {
      sellerSummary: seller,
      buyerSummary: lines,
      buyerDetail: [
        "This capability may search and read public Internet sources while processing your job.",
        "It does not receive unrestricted access to the seller's network.",
      ],
    };
  }
  return {
    sellerSummary: ["Specific APIs only (declared connectors)"],
    buyerSummary: ["Uses declared external APIs only"],
    buyerDetail: [
      "Network access is limited to seller-declared API integrations.",
      "Generic web browsing and seller LAN access are not in scope.",
    ],
  };
}
