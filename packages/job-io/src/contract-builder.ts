import { parseCapabilityContract, type CapabilityContract } from "@kivro/contracts";
import { fileConstraintsFromPreset, type MediaPresetKey } from "./media-presets.js";

type DraftConstraints = {
  text?: { minLength?: number; maxLength?: number; allowedValues?: string[] };
  file?: {
    minFiles?: number;
    maxFiles?: number;
    maxFileSizeBytes?: number;
    allowedExtensions?: string[];
    allowedMimeTypes?: string[];
  };
};

export type DraftInput = {
  key: string;
  label: string;
  description?: string;
  type: "SHORT_TEXT" | "LONG_TEXT" | "INTEGER" | "SELECT" | "FILE" | "FILES";
  required: boolean;
  order: number;
  constraints?: DraftConstraints;
};

export type DraftOutput = {
  key: string;
  type: "SHORT_TEXT" | "MARKDOWN" | "FILE" | "FILES";
  required: boolean;
  constraints?: DraftConstraints;
};

export type ContractDraft = {
  name: string;
  description: string;
  priceTierCents: number;
  inputs: DraftInput[];
  outputs: DraftOutput[];
  published: CapabilityContract | null;
};

export function createContractDraft(name: string, description: string): ContractDraft {
  return { name, description, priceTierCents: 100, inputs: [], outputs: [], published: null };
}

function assertMutable(draft: ContractDraft): void {
  if (draft.published) {
    throw new Error("published contract is immutable");
  }
}

export function addScalarInput(
  draft: ContractDraft,
  field: Omit<DraftInput, "order" | "type"> & { type?: DraftInput["type"] },
): void {
  assertMutable(draft);
  draft.inputs.push({ ...field, type: field.type ?? "LONG_TEXT", order: draft.inputs.length });
}

export function addFileInput(
  draft: ContractDraft,
  field: {
    key: string;
    label: string;
    description?: string;
    required: boolean;
    multiple: boolean;
    preset?: MediaPresetKey;
    maxFiles?: number;
    maxFileSizeBytes?: number;
  },
): void {
  assertMutable(draft);
  const preset = field.preset ? fileConstraintsFromPreset(field.preset) : {};
  draft.inputs.push({
    key: field.key,
    label: field.label,
    description: field.description,
    type: field.multiple ? "FILES" : "FILE",
    required: field.required,
    order: draft.inputs.length,
    constraints: {
      file: {
        ...preset,
        maxFiles: field.maxFiles,
        minFiles: field.required ? 1 : 0,
        maxFileSizeBytes: field.maxFileSizeBytes,
      },
    },
  });
}

export function reorderInputs(draft: ContractDraft, keys: string[]): void {
  assertMutable(draft);
  const byKey = new Map(draft.inputs.map((field) => [field.key, field]));
  draft.inputs = keys.map((key, order) => {
    const field = byKey.get(key);
    if (!field) {
      throw new Error(`unknown field ${key}`);
    }
    return { ...field, order };
  });
}

export function addOutputField(draft: ContractDraft, field: DraftOutput): void {
  assertMutable(draft);
  draft.outputs.push(field);
}

export function compileContract(draft: ContractDraft): CapabilityContract {
  return parseCapabilityContract({
    name: draft.name,
    description: draft.description,
    currency: "USD",
    priceTierCents: draft.priceTierCents,
    inputs: { contractVersion: 2, fields: draft.inputs },
    output: { contractVersion: 2, fields: draft.outputs },
  });
}

export function publishContract(draft: ContractDraft): CapabilityContract {
  const published = compileContract(draft);
  draft.published = published;
  return published;
}
