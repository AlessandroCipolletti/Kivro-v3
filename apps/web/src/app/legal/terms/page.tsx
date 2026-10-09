import { PageHeader } from "@/components/ui/PageHeader";

export default function TermsPage() {
  return (
    <div className="page-shell narrow">
      <PageHeader title="Marketplace terms (draft)" />
      <p className="meta">
        Alpha draft for private testing — not legal advice. Professional review is required before
        public launch (Master Spec §38).
      </p>
      <ul>
        <li>Buyers purchase capability executions using prepaid credits or authorized payment methods.</li>
        <li>Sellers operate worker environments on their own hardware subject to published permissions.</li>
        <li>Kivro provides the platform, dispatch, billing, and retention mechanics described in Privacy.</li>
        <li>Prohibited uses include abuse, credential harvesting, and attempts to escape sandbox boundaries.</li>
      </ul>
    </div>
  );
}
