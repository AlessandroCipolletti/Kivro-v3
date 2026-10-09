import { PageHeader } from "@/components/ui/PageHeader";

export default function PrivacyPage() {
  return (
    <div className="page-shell narrow">
      <PageHeader title="Privacy & data processing (draft)" />
      <p className="meta">
        Summarizes Master Spec §37 disclosure for alpha buyers and sellers.
      </p>
      <ul>
        <li>Job inputs and deliverables may be stored temporarily so buyers can download results.</li>
        <li>Execution occurs on seller-controlled workers; sellers process buyer inputs for the job.</li>
        <li>Capability pages list seller-declared external processors and permission-derived network access.</li>
        <li>Marketplace Agent requests may be sent to configured LLM providers — see capability permissions.</li>
        <li>Audit logs and metrics avoid raw secrets, credentials, and unnecessary buyer content.</li>
      </ul>
    </div>
  );
}
