import type { CapabilityContract, CapabilityInputField } from "@kivro/contracts";
import { normalizeInputFieldType, isFileInputField } from "./normalize-field-type.js";
import { resolvedFileConstraints, resolvedTextMaxLength } from "./field-constraints.js";

export interface BuyerFormField {
  key: string;
  label: string;
  description?: string;
  type: string;
  required: boolean;
  order: number;
  group?: string;
  when?: CapabilityInputField["when"];
  widget: "text" | "textarea" | "number" | "checkbox" | "select" | "multi-select" | "url" | "json" | "file" | "files";
  constraints: Record<string, unknown>;
}

/** §204 / §206 — machine-readable buyer form derived from published contract. */
export function buildBuyerFormSchema(contract: CapabilityContract): {
  schemaVersion: 1;
  capabilityName: string;
  fields: BuyerFormField[];
  groups?: CapabilityContract["inputs"]["groups"];
} {
  const sorted = [...contract.inputs.fields].sort(
    (a, b) => (a.order ?? 0) - (b.order ?? 0),
  );
  return {
    schemaVersion: 1,
    capabilityName: contract.name,
    fields: sorted.map((field) => toBuyerFormField(field)),
    groups: contract.inputs.groups,
  };
}

function toBuyerFormField(field: CapabilityInputField): BuyerFormField {
  const type = normalizeInputFieldType(field.type);
  const widget = widgetForType(type);
  const constraints: Record<string, unknown> = {};
  if (isFileInputField(field)) {
    Object.assign(constraints, resolvedFileConstraints(field));
  } else {
    const max = resolvedTextMaxLength(field);
    if (max) {
      constraints.maxLength = max;
    }
    if (field.constraints?.text?.minLength) {
      constraints.minLength = field.constraints.text.minLength;
    }
    if (field.constraints?.text?.allowedValues ?? field.choices) {
      constraints.allowedValues = field.constraints?.text?.allowedValues ?? field.choices;
    }
  }
  return {
    key: field.key,
    label: field.label ?? field.key,
    description: field.description,
    type,
    required: field.required,
    order: field.order ?? 0,
    group: field.group,
    when: field.when,
    widget,
    constraints,
  };
}

function widgetForType(type: string): BuyerFormField["widget"] {
  switch (type) {
    case "SHORT_TEXT":
      return "text";
    case "LONG_TEXT":
      return "textarea";
    case "INTEGER":
    case "NUMBER":
      return "number";
    case "BOOLEAN":
      return "checkbox";
    case "SELECT":
      return "select";
    case "MULTI_SELECT":
      return "multi-select";
    case "URL":
      return "url";
    case "JSON":
      return "json";
    case "FILE":
      return "file";
    case "FILES":
      return "files";
    default:
      return "text";
  }
}
