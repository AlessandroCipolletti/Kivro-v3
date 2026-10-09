import { PageHeader } from "@/components/ui/PageHeader";

export default function AupPage() {
  return (
    <div className="page-shell narrow">
      <PageHeader title="Acceptable use (draft)" />
      <p className="meta">Platform response to abuse (§30, §38) during alpha.</p>
      <ul>
        <li>No prompt-injection attempts to exfiltrate secrets or bypass sandbox policy.</li>
        <li>No spam, harassment, or misleading capability listings.</li>
        <li>Report capabilities or accounts via Developer settings or API abuse report endpoint.</li>
        <li>Kivro may pause capabilities, suspend accounts, or disable dispatch using deterministic controls.</li>
      </ul>
    </div>
  );
}
