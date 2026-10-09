import { logInfo } from "@kivro/observability";
import type { BrevoConfig } from "./brevo-config.js";

export type SendTemplateResult = { ok: true } | { ok: false; reason: string };

export async function sendBrevoTemplate(
  config: BrevoConfig,
  input: {
    to: string;
    templateId: number;
    params: Record<string, string>;
    correlationId?: string;
  },
  fetchImpl: typeof fetch = fetch,
): Promise<SendTemplateResult> {
  const res = await fetchImpl("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      accept: "application/json",
      "content-type": "application/json",
      "api-key": config.apiKey,
    },
    body: JSON.stringify({
      ...(config.senderEmail
        ? { sender: { email: config.senderEmail, name: config.senderName } }
        : {}),
      to: [{ email: input.to }],
      templateId: input.templateId,
      params: input.params,
    }),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    logInfo({
      correlationId: input.correlationId ?? "email",
      message: "Brevo template send failed",
      status: res.status,
      templateId: input.templateId,
    });
    return { ok: false, reason: body || `HTTP_${res.status}` };
  }
  return { ok: true };
}
