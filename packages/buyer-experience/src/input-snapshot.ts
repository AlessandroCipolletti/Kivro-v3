import { CapabilityInputContractSchema } from "@kivro/contracts";
import { escapeForSafeTextDisplay, normalizeTextOutput } from "@kivro/job-io";

export type InputSnapshotFieldView = {
  key: string;
  label: string;
  displayValue: string;
  redacted: boolean;
};

/** BUYERUX-023 — immutable sanitized input snapshot for historical jobs. */
export function buildSanitizedInputSnapshotView(input: {
  inputContractSnapshot: unknown;
  structuredInput: unknown;
  assetManifest?: unknown;
}): { summary: string; fields: InputSnapshotFieldView[] } {
  const structured =
    input.structuredInput && typeof input.structuredInput === "object" && !Array.isArray(input.structuredInput)
      ? (input.structuredInput as Record<string, unknown>)
      : {};
  const parsed = CapabilityInputContractSchema.safeParse(input.inputContractSnapshot);
  const fields: InputSnapshotFieldView[] = [];
  if (parsed.success) {
    for (const field of parsed.data.fields) {
      const raw = structured[field.key];
      const label = field.label ?? field.key;
      if (isFileField(field.type)) {
        const count = countAssets(input.assetManifest, field.key);
        fields.push({
          key: field.key,
          label,
          displayValue: count > 0 ? `${count} uploaded file(s)` : "(no files)",
          redacted: false,
        });
        continue;
      }
      fields.push({
        key: field.key,
        label,
        displayValue: escapeForSafeTextDisplay(normalizeTextOutput(raw)).slice(0, 500),
        redacted: isSensitiveKey(field.key),
      });
    }
  } else {
    for (const [key, value] of Object.entries(structured).slice(0, 12)) {
      fields.push({
        key,
        label: key,
        displayValue: escapeForSafeTextDisplay(normalizeTextOutput(value)).slice(0, 500),
        redacted: isSensitiveKey(key),
      });
    }
  }
  const summary = fields.map((f) => `${f.label}: ${f.displayValue}`).join("; ").slice(0, 400);
  return { summary, fields };
}

function isFileField(type: string): boolean {
  const t = type.toUpperCase();
  return t === "FILE" || t === "FILES";
}

function isSensitiveKey(key: string): boolean {
  return /password|secret|token|credential/i.test(key);
}

function countAssets(manifest: unknown, fieldKey: string): number {
  if (!manifest || typeof manifest !== "object") {
    return 0;
  }
  const refs = (manifest as Record<string, unknown>)[fieldKey];
  return Array.isArray(refs) ? refs.length : 0;
}
