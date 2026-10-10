"use client";

import { useMemo, useState } from "react";

export type BuyerFormField = {
  key: string;
  label: string;
  description?: string;
  required: boolean;
  widget: string;
  constraints: Record<string, unknown>;
};

export function BuyerInputForm({
  fields,
  onSubmit,
  loading,
  initialValues,
}: {
  fields: BuyerFormField[];
  onSubmit: (inputs: Record<string, unknown>) => void | Promise<void>;
  loading?: boolean;
  initialValues?: Record<string, unknown>;
}) {
  const initial = useMemo(() => {
    const o: Record<string, unknown> = { ...(initialValues ?? {}) };
    for (const f of fields) {
      if (f.widget === "checkbox" && o[f.key] === undefined) {
        o[f.key] = false;
      }
    }
    return o;
  }, [fields, initialValues]);
  const [values, setValues] = useState<Record<string, unknown>>(initial);

  function setField(key: string, value: unknown) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        void onSubmit(values);
      }}
      className="buyer-form"
    >
      {fields.map((field) => (
        <div key={field.key} className="form-field">
          <label className="field-label" htmlFor={field.key}>
            {field.label}
            {field.required ? " *" : ""}
          </label>
          {field.description && <p className="field-hint">{field.description}</p>}
          {renderControl(field, values[field.key], (v) => setField(field.key, v))}
        </div>
      ))}
      <div className="form-actions">
        <button className="button" type="submit" disabled={loading}>
          {loading ? "Submitting…" : "Submit with credits"}
        </button>
      </div>
    </form>
  );
}

function renderControl(
  field: BuyerFormField,
  value: unknown,
  onChange: (v: unknown) => void,
): React.ReactNode {
  const id = field.key;
  const allowed = field.constraints.allowedValues as string[] | undefined;
  switch (field.widget) {
    case "textarea":
      return (
        <textarea
          id={id}
          required={field.required}
          rows={4}
          value={String(value ?? "")}
          onChange={(e) => onChange(e.target.value)}
        />
      );
    case "checkbox":
      return (
        <input
          id={id}
          type="checkbox"
          checked={Boolean(value)}
          onChange={(e) => onChange(e.target.checked)}
        />
      );
    case "number":
      return (
        <input
          id={id}
          type="number"
          required={field.required}
          value={value === undefined || value === "" ? "" : Number(value)}
          onChange={(e) => onChange(e.target.value === "" ? "" : Number(e.target.value))}
        />
      );
    case "select":
      return (
        <select
          id={id}
          required={field.required}
          value={String(value ?? "")}
          onChange={(e) => onChange(e.target.value)}
        >
          <option value="">Select…</option>
          {allowed?.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      );
    case "json":
      return (
        <textarea
          id={id}
          required={field.required}
          rows={6}
          className="input-mono"
          value={typeof value === "string" ? value : JSON.stringify(value ?? {}, null, 2)}
          onChange={(e) => {
            try {
              onChange(JSON.parse(e.target.value) as unknown);
            } catch {
              onChange(e.target.value);
            }
          }}
        />
      );
    case "file":
    case "files":
      return (
        <p className="meta">
          File inputs: use JSON run mode or upload via API (MVP web uses text fields only).
        </p>
      );
    default:
      return (
        <input
          id={id}
          type={field.widget === "url" ? "url" : "text"}
          required={field.required}
          maxLength={
            typeof field.constraints.maxLength === "number" ? field.constraints.maxLength : undefined
          }
          value={String(value ?? "")}
          onChange={(e) => onChange(e.target.value)}
        />
      );
  }
}
