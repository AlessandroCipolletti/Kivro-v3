import { getBrevoConfig } from "./brevo-config.js";
import { sendBrevoTemplate } from "./brevo-transactional.js";
import { baseTemplateParams } from "./template-params.js";

export function buildVerificationLink(webAppUrl: string, rawToken: string): string {
  const base = webAppUrl.replace(/\/$/, "");
  return `${base}/verify-email?token=${encodeURIComponent(rawToken)}`;
}

export function buildPasswordResetLink(webAppUrl: string, rawToken: string): string {
  const base = webAppUrl.replace(/\/$/, "");
  return `${base}/reset-password?token=${encodeURIComponent(rawToken)}`;
}

export async function sendEmailVerificationMessage(input: {
  to: string;
  confirmLink: string;
  acceptLink?: string;
  correlationId?: string;
}): Promise<{ sent: boolean; reason?: string }> {
  const config = getBrevoConfig();
  if (!config) {
    return { sent: false, reason: "BREVO_NOT_CONFIGURED" };
  }
  const acceptLink = input.acceptLink ?? input.confirmLink;
  const result = await sendBrevoTemplate(config, {
    to: input.to,
    templateId: config.templates.emailVerification,
    params: {
      ...baseTemplateParams(input.to),
      confirmLink: input.confirmLink,
      acceptLink,
    },
    correlationId: input.correlationId,
  });
  return result.ok ? { sent: true } : { sent: false, reason: result.reason };
}

export async function sendAccountConfirmedMessage(input: {
  to: string;
  correlationId?: string;
}): Promise<{ sent: boolean; reason?: string }> {
  const config = getBrevoConfig();
  if (!config) {
    return { sent: false, reason: "BREVO_NOT_CONFIGURED" };
  }
  const result = await sendBrevoTemplate(config, {
    to: input.to,
    templateId: config.templates.accountConfirmed,
    params: baseTemplateParams(input.to),
    correlationId: input.correlationId,
  });
  return result.ok ? { sent: true } : { sent: false, reason: result.reason };
}

export async function sendPasswordResetMessage(input: {
  to: string;
  resetLink: string;
  correlationId?: string;
}): Promise<{ sent: boolean; reason?: string }> {
  const config = getBrevoConfig();
  if (!config) {
    return { sent: false, reason: "BREVO_NOT_CONFIGURED" };
  }
  const result = await sendBrevoTemplate(config, {
    to: input.to,
    templateId: config.templates.passwordReset,
    params: {
      ...baseTemplateParams(input.to),
      resetLink: input.resetLink,
    },
    correlationId: input.correlationId,
  });
  return result.ok ? { sent: true } : { sent: false, reason: result.reason };
}
