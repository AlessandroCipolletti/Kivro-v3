import {
  escapeForSafeTextDisplay,
  normalizeTextOutput,
  safeExternalUrlForRender,
} from "@kivro/job-io";
export type SemanticResultAssetRef = {
  id: string;
  filename: string;
  outputKey?: string;
};

export type SemanticResultFieldView = {
  key: string;
  label: string;
  type: string;
  presentation: "text" | "markdown" | "json" | "url" | "file" | "files" | "boolean" | "number";
  displayText?: string;
  url?: string;
  assetRefs?: Array<{ id: string; filename: string }>;
  previewMode: "inline" | "download_only";
};

export type SemanticResultView = {
  contractVersion: number;
  fields: SemanticResultFieldView[];
  legacyFallback?: boolean;
};

/** BUYERUX-018..020 — semantic manifest from immutable output contract snapshot. */
export function buildSemanticResultView(input: {
  outputContract: unknown;
  structuredOutput: unknown;
  assets: SemanticResultAssetRef[];
}): SemanticResultView {
  const contract = coerceOutputContract(input.outputContract);
  const outputRecord = structuredOutputRecord(input.structuredOutput);
  const assetsByKey = groupAssetsByOutputKey(input.assets, outputRecord);

  if (contract.contractVersion === 2 && contract.fields.length > 0) {
    const fields = contract.fields.map((field) => {
      const raw = outputRecord[field.key];
      const assetRefs = assetsByKey.get(field.key) ?? [];
      return fieldToView(field.key, field.label ?? field.key, field.type, raw, assetRefs);
    });
    return { contractVersion: 2, fields };
  }

  const legacyType = contract.legacyType ?? "JSON";
  const single = fieldToView("result", "Result", legacyType, input.structuredOutput, input.assets);
  return { contractVersion: 1, fields: [single], legacyFallback: true };
}

function fieldToView(
  key: string,
  label: string,
  type: string,
  raw: unknown,
  assetRefs: SemanticResultAssetRef[],
): SemanticResultFieldView {
  const normalized = String(type).toUpperCase();
  if (normalized === "FILE" || normalized === "FILES") {
    const previewMode = "download_only" as const;
    return {
      key,
      label,
      type: normalized,
      presentation: normalized === "FILES" ? "files" : "file",
      assetRefs: assetRefs.map((a) => ({ id: a.id, filename: a.filename })),
      previewMode,
    };
  }
  if (normalized === "URL") {
    const href = typeof raw === "string" ? raw : "";
    const safe = safeExternalUrlForRender(href);
    return {
      key,
      label,
      type: normalized,
      presentation: "url",
      url: safe ?? undefined,
      displayText: safe ? safe : "Link unavailable (unsupported URL scheme)",
      previewMode: safe ? "inline" : "download_only",
    };
  }
  if (normalized === "MARKDOWN" || normalized === "TEXT" || normalized === "LONG_TEXT" || normalized === "SHORT_TEXT") {
    const text = escapeForSafeTextDisplay(normalizeTextOutput(raw));
    const inline = normalized === "MARKDOWN" || normalized === "TEXT" || normalized === "LONG_TEXT" || normalized === "SHORT_TEXT";
    return {
      key,
      label,
      type: normalized,
      presentation: normalized === "MARKDOWN" ? "markdown" : "text",
      displayText: text,
      previewMode: inline ? "inline" : "download_only",
    };
  }
  if (normalized === "JSON") {
    return {
      key,
      label,
      type: "JSON",
      presentation: "json",
      displayText: escapeForSafeTextDisplay(normalizeTextOutput(raw)),
      previewMode: "inline",
    };
  }
  if (normalized === "BOOLEAN") {
    return {
      key,
      label,
      type: normalized,
      presentation: "boolean",
      displayText: String(Boolean(raw)),
      previewMode: "inline",
    };
  }
  if (normalized === "NUMBER") {
    return {
      key,
      label,
      type: normalized,
      presentation: "number",
      displayText: typeof raw === "number" ? String(raw) : normalizeTextOutput(raw),
      previewMode: "inline",
    };
  }
  return {
    key,
    label,
    type: normalized,
    presentation: "text",
    displayText: escapeForSafeTextDisplay(normalizeTextOutput(raw)),
    previewMode: "inline",
  };
}

function structuredOutputRecord(raw: unknown): Record<string, unknown> {
  if (raw && typeof raw === "object" && !Array.isArray(raw)) {
    return raw as Record<string, unknown>;
  }
  return { result: raw };
}

function groupAssetsByOutputKey(
  assets: SemanticResultAssetRef[],
  output: Record<string, unknown>,
): Map<string, SemanticResultAssetRef[]> {
  const map = new Map<string, SemanticResultAssetRef[]>();
  for (const asset of assets) {
    const key = asset.outputKey ?? (asset.id.includes(":") ? asset.id.split(":")[0]! : "files");
    const list = map.get(key) ?? [];
    list.push(asset);
    map.set(key, list);
  }
  if (assets.length > 0 && map.size === 1 && map.has("files")) {
    for (const key of Object.keys(output)) {
      if (Array.isArray(output[key])) {
        map.set(key, assets);
      }
    }
  }
  return map;
}

function coerceOutputContract(raw: unknown): {
  contractVersion: 1 | 2;
  fields: Array<{ key: string; label?: string; type: string }>;
  legacyType?: string;
} {
  if (!raw || typeof raw !== "object") {
    return { contractVersion: 1, fields: [], legacyType: "JSON" };
  }
  const o = raw as Record<string, unknown>;
  if (o.contractVersion === 2 && Array.isArray(o.fields)) {
    return {
      contractVersion: 2,
      fields: o.fields.flatMap((f) => {
        if (!f || typeof f !== "object") {
          return [];
        }
        const row = f as Record<string, unknown>;
        if (typeof row.key !== "string" || typeof row.type !== "string") {
          return [];
        }
        return [
          {
            key: row.key,
            label: typeof row.label === "string" ? row.label : undefined,
            type: row.type,
          },
        ];
      }),
    };
  }
  const legacyType = typeof o.type === "string" ? o.type : "JSON";
  return { contractVersion: 1, fields: [], legacyType };
}
