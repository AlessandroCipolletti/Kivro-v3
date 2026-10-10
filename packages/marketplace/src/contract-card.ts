type LooseField = {
  type?: string;
  constraints?: {
    file?: {
      allowedExtensions?: string[];
      allowedMimeTypes?: string[];
    };
  };
};

/** §234 — a card states what the buyer gives and what comes back. */
export function contractDiscoverabilityCard(input: {
  inputSchema: unknown;
  outputSchema: unknown;
}): { input: string; output: string } | null {
  const inputs = fieldsOf(input.inputSchema);
  const outputs = fieldsOf(input.outputSchema);
  if (inputs.length === 0 && outputs.length === 0) {
    return null;
  }
  return {
    input: summarize(inputs),
    output: summarize(outputs),
  };
}

function fieldsOf(schema: unknown): LooseField[] {
  if (!schema || typeof schema !== "object") {
    return [];
  }
  const record = schema as { fields?: unknown; type?: unknown };
  if (Array.isArray(record.fields)) {
    return record.fields.filter((field): field is LooseField => !!field && typeof field === "object");
  }
  if (typeof record.type === "string") {
    return [{ type: record.type }];
  }
  return [];
}

function summarize(fields: LooseField[]): string {
  const labels = fields.flatMap((field) => labelsFor(field));
  const unique = [...new Set(labels)];
  return unique.join(" + ") || "—";
}

function labelsFor(field: LooseField): string[] {
  const extensions = field.constraints?.file?.allowedExtensions ?? [];
  const mimes = field.constraints?.file?.allowedMimeTypes ?? [];
  if (extensions.length > 0 || mimes.length > 0) {
    return [...extensions.map(extensionLabel), ...mimes.map(mimeLabel)].filter((label): label is string => !!label);
  }
  const type = (field.type ?? "").toUpperCase();
  if (type === "FILE" || type === "FILES") {
    return ["File"];
  }
  if (type.includes("TEXT") || type === "STRING" || type === "MARKDOWN") {
    return ["Text"];
  }
  if (type === "JSON") {
    return ["JSON"];
  }
  return field.type ? [field.type] : [];
}

function extensionLabel(ext: string): string {
  const normalized = ext.trim().toLowerCase().replace(/^\./, "");
  if (["png", "jpg", "jpeg", "webp", "gif"].includes(normalized)) {
    return "Images";
  }
  if (normalized === "pdf") {
    return "PDF";
  }
  return `.${normalized}`;
}

function mimeLabel(mime: string): string | null {
  if (mime.toLowerCase().startsWith("image/")) {
    return "Images";
  }
  if (mime.toLowerCase() === "application/pdf") {
    return "PDF";
  }
  return null;
}
