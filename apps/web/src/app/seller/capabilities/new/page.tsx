"use client";

import { PublishReadinessPanel } from "@/components/PublishReadinessPanel";
import { Alert } from "@/components/ui/Alert";
import { PageHeader } from "@/components/ui/PageHeader";
import { API_BASE } from "@/lib/kivro-api";
import Link from "next/link";
import { useState } from "react";

const MOCK_DISCOVERY = {
  snapshotVersion: 1,
  skills: ["demo-skill", "unused-skill"],
  tools: ["filesystem-read"],
  nativePlugins: [],
  warnings: [],
};

const DEFAULT_CONTRACT = {
  contractVersion: 2,
  name: "My capability",
  description: "Describe what buyers receive.",
  priceTierCents: 500,
  currency: "USD",
  inputs: {
    contractVersion: 2,
    fields: [
      {
        key: "instructions",
        label: "Instructions",
        type: "LONG_TEXT",
        required: true,
        order: 0,
        constraints: { text: { minLength: 10, maxLength: 5000 } },
      },
    ],
  },
  outputs: { contractVersion: 1, assets: [] },
};

const DEFAULT_MANIFEST = {
  manifestVersion: 1,
  categories: [
    {
      key: "AI_INFERENCE",
      buyerLabel: "AI inference",
      state: "USED",
      detail: "Runs model inference inside sandbox",
    },
  ],
};

type Readiness = {
  ready: boolean;
  items: Array<{ id: string; severity: "blocking" | "recommended"; title: string; detail: string }>;
};

export default function NewCapabilityWizardPage() {
  const [slug, setSlug] = useState("");
  const [capabilityId, setCapabilityId] = useState<string | null>(null);
  const [selectedSkills, setSelectedSkills] = useState<string[]>(["demo-skill"]);
  const [preview, setPreview] = useState<unknown>(null);
  const [previewRun, setPreviewRun] = useState<string | null>(null);
  const [permissions, setPermissions] = useState<unknown>(null);
  const [disclosure, setDisclosure] = useState<unknown>(null);
  const [readiness, setReadiness] = useState<Readiness | null>(null);
  const [expansionAck, setExpansionAck] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const consent = {
    consentVersion: 1,
    selectedSkills,
    selectedTools: [] as string[],
    permissionManifest: DEFAULT_MANIFEST,
  };

  async function createDraft() {
    setBusy(true);
    setError(null);
    const res = await fetch(`${API_BASE}/seller/capabilities`, {
      method: "POST",
      credentials: "include",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        slug,
        contract: DEFAULT_CONTRACT,
        permissionManifest: DEFAULT_MANIFEST,
      }),
    });
    setBusy(false);
    if (!res.ok) {
      setError("Could not create draft — check slug (lowercase, hyphens).");
      return;
    }
    const body = (await res.json()) as { capability: { id: string } };
    setCapabilityId(body.capability.id);
  }

  async function validateDiscoveryExposure() {
    setError(null);
    const res = await fetch(`${API_BASE}/seller/import/validate-discovery-exposure`, {
      method: "POST",
      credentials: "include",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        discovery: MOCK_DISCOVERY,
        consent,
        effectiveSkills: selectedSkills,
        effectiveTools: [],
      }),
    });
    if (!res.ok) {
      const body = (await res.json().catch(() => ({}))) as { error?: string };
      setError(body.error ?? "Discovery consent validation failed.");
      return;
    }
    setError(null);
  }

  async function loadAiDraft() {
    const res = await fetch(`${API_BASE}/seller/import/ai-draft`, {
      method: "POST",
      credentials: "include",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ discovery: MOCK_DISCOVERY }),
    });
    if (res.ok) {
      setPreview(await res.json());
    }
  }

  async function loadEffectivePermissions() {
    const graphRes = await fetch(`${API_BASE}/seller/import/analyze-dependencies`, {
      method: "POST",
      credentials: "include",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        discovery: MOCK_DISCOVERY,
        consent,
        rootName: slug || "capability",
        contract: DEFAULT_CONTRACT,
      }),
    });
    const graphBody = graphRes.ok ? ((await graphRes.json()) as { graph: unknown }) : { graph: null };
    const res = await fetch(`${API_BASE}/seller/capabilities/${capabilityId}/effective-permissions`, {
      method: "POST",
      credentials: "include",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        permissionManifest: DEFAULT_MANIFEST,
        dependencyGraph: graphBody.graph,
      }),
    });
    if (res.ok) setPermissions(await res.json());
  }

  async function loadDisclosure() {
    const res = await fetch(`${API_BASE}/seller/capabilities/${capabilityId}/security-disclosure`, {
      method: "POST",
      credentials: "include",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        permissionManifest: DEFAULT_MANIFEST,
        selectedSkills,
        selectedTools: [],
      }),
    });
    if (res.ok) setDisclosure(await res.json());
  }

  async function loadPreview() {
    if (!capabilityId) return;
    const res = await fetch(`${API_BASE}/seller/capabilities/${capabilityId}/draft-preview`, {
      method: "POST",
      credentials: "include",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ contract: DEFAULT_CONTRACT }),
    });
    if (res.ok) setPreview(await res.json());
  }

  async function runSandboxPreview() {
    if (!capabilityId) return;
    setError(null);
    setPreviewRun(null);
    const res = await fetch(`${API_BASE}/seller/capabilities/${capabilityId}/draft-preview`, {
      method: "POST",
      credentials: "include",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        contract: DEFAULT_CONTRACT,
        run: true,
        inputs: { instructions: "Summarize this local preview request." },
      }),
    });
    const body = (await res.json().catch(() => ({}))) as { error?: string; previewRun?: unknown };
    if (!res.ok) {
      setError(body.error === "DOCKER_UNAVAILABLE" ? "Docker is not available, so the sandbox preview did not run." : (body.error ?? "Preview run failed"));
      return;
    }
    setPreview(body);
    setPreviewRun(body.previewRun ? JSON.stringify(body.previewRun, null, 2) : "Preview ran.");
  }

  async function loadReadiness() {
    if (!capabilityId) return;
    const graphRes = await fetch(`${API_BASE}/seller/import/analyze-dependencies`, {
      method: "POST",
      credentials: "include",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        discovery: MOCK_DISCOVERY,
        consent,
        rootName: slug || "cap",
        contract: DEFAULT_CONTRACT,
      }),
    });
    const graphBody = graphRes.ok ? ((await graphRes.json()) as { graph: unknown }) : { graph: null };
    const res = await fetch(`${API_BASE}/seller/capabilities/${capabilityId}/publish-readiness`, {
      method: "POST",
      credentials: "include",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        contract: DEFAULT_CONTRACT,
        executionModelAcknowledged: true,
        permissionExpansionAcknowledged: expansionAck,
        dependencyGraph: graphBody.graph,
      }),
    });
    if (res.ok) setReadiness((await res.json()) as Readiness);
  }

  function toggleSkill(skill: string) {
    setSelectedSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill],
    );
  }

  return (
    <div className="page-shell">
      <PageHeader
        title="Capability wizard"
        description="Discovery consent, permissions, buyer preview, and publish readiness."
      />
      {error && <Alert tone="danger">{error}</Alert>}

      <section className="detail-panel form-stack">
        <strong>1. Discovery consent</strong>
        <p className="muted">Only selected skills are included in the effective manifest.</p>
        {MOCK_DISCOVERY.skills.map((skill) => (
          <label key={skill} style={{ display: "block" }}>
            <input
              type="checkbox"
              checked={selectedSkills.includes(skill)}
              onChange={() => toggleSkill(skill)}
            />{" "}
            {skill}
          </label>
        ))}
        <button className="button secondary" type="button" onClick={() => void validateDiscoveryExposure()}>
          Validate consent
        </button>
      </section>

      <section className="detail-panel form-stack">
        <strong>2. Create draft</strong>
        <label className="field-label" htmlFor="slug">
          Slug
        </label>
        <input id="slug" value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="my-capability" />
        <button className="button" type="button" disabled={busy || !slug} onClick={() => void createDraft()}>
          Create draft
        </button>
      </section>

      {capabilityId && (
        <section className="detail-panel form-stack">
          <strong>3. Review & preview</strong>
          <p>
            Draft id: <code>{capabilityId}</code>
          </p>
          <button className="button secondary" type="button" onClick={() => void loadAiDraft()}>
            Suggest inputs (advisory draft)
          </button>
          <button className="button secondary" type="button" onClick={() => void loadEffectivePermissions()}>
            Effective permissions
          </button>
          <button className="button secondary" type="button" onClick={() => void loadDisclosure()}>
            Security disclosure
          </button>
          <button className="button secondary" type="button" onClick={() => void loadPreview()}>
            Preview as buyer
          </button>
          <button className="button secondary" type="button" onClick={() => void runSandboxPreview()}>
            Run sandbox preview
          </button>
          <label>
            <input
              type="checkbox"
              checked={expansionAck}
              onChange={(e) => setExpansionAck(e.target.checked)}
            />{" "}
            I acknowledge permission expansion vs live version (if any)
          </label>
          <button className="button" type="button" onClick={() => void loadReadiness()}>
            Check publish readiness
          </button>
          <Link href={`/seller/capabilities/${capabilityId}/schedule`}>Configure availability →</Link>
          <Link href={`/seller/capabilities/${capabilityId}/guide`}>First publication guide →</Link>
        </section>
      )}

      {readiness && <PublishReadinessPanel ready={readiness.ready} items={readiness.items} />}
      {permissions != null && (
        <pre className="detail-panel">{JSON.stringify(permissions, null, 2)}</pre>
      )}
      {disclosure != null && (
        <pre className="detail-panel">{JSON.stringify(disclosure, null, 2)}</pre>
      )}
      {preview != null && <BuyerPreview preview={preview} />}
      {previewRun && <pre className="detail-panel">{previewRun}</pre>}
      <p>
        <Link href="/seller/onboarding">← Onboarding</Link>
      </p>
    </div>
  );
}

function BuyerPreview({ preview }: { preview: unknown }) {
  const view = preview as {
    notice?: string;
    presentation?: {
      title: string;
      priceLabel: string;
      fields: Array<{ label: string; required: boolean; hint: string | null }>;
      outputNote: string;
      ctaLabel: string;
      purchasable: boolean;
    };
  };
  if (!view.presentation) {
    return <pre className="detail-panel">{JSON.stringify(preview, null, 2)}</pre>;
  }
  return (
    <section className="detail-panel form-stack">
      <p className="meta">Buyer preview</p>
      <h2 className="text-lg font-medium">{view.presentation.title}</h2>
      <p>{view.presentation.priceLabel}</p>
      <ul>
        {view.presentation.fields.map((field) => (
          <li key={field.label}>
            {field.label}
            {field.required ? " *" : ""}
            {field.hint ? ` — ${field.hint}` : ""}
          </li>
        ))}
      </ul>
      <p className="meta">{view.presentation.outputNote}</p>
      <button className="button" type="button" disabled>
        {view.presentation.ctaLabel}
      </button>
      <p className="meta">{view.notice}</p>
    </section>
  );
}
