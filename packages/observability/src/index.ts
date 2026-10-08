import { randomUUID } from "node:crypto";

const REDACT_KEYS = new Set([
  "authorization",
  "cookie",
  "apiKey",
  "api_key",
  "password",
  "secret",
]);

export function createCorrelationId(): string {
  return randomUUID();
}

export function redactRecord(input: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(input)) {
    if (REDACT_KEYS.has(key.toLowerCase())) {
      out[key] = "[REDACTED]";
    } else {
      out[key] = value;
    }
  }
  return out;
}

export interface LogFields {
  correlationId: string;
  message: string;
  [key: string]: unknown;
}

export function logInfo(fields: LogFields): void {
  const { message, ...rest } = fields;
  const payload = redactRecord(rest);
  // Structured JSON logs (Master Spec §83)
  console.log(JSON.stringify({ level: "info", message, ...payload }));
}
