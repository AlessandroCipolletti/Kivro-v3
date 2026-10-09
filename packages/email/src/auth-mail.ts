import { getBrevoConfig } from "./brevo-config.js";
import { sendBrevoTemplate } from "./brevo-transactional.js";

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
  verifyLink: string;
  correlationId?: string;
}): Promise<{ sent: boolean; reason?: string }> {
  const config = getBrevoConfig();
  if (!config) {
    return { sent: false, reason: "BREVO_NOT_CONFIGURED" };
  }
  const result = await sendBrevoTemplate(config, {
    to: input.to,
    templateId: config.templates.emailVerification,
    params: {
      verify_link: input.verifyLink,
      VERIFY_LINK: input.verifyLink,
      email: input.to,
      EMAIL: input.to,
    },
    correlationId: input.correlationId,
  });
  return result.ok ? { sent: true } : { sent: false, reason: result.reason };
}

export async function sendAccountConfirmedMessage(input: {
  to: string;
  webAppUrl: string;
  correlationId?: string;
}): Promise<{ sent: boolean; reason?: string }> {
  const config = getBrevoConfig();
  if (!config) {
    return { sent: false, reason: "BREVO_NOT_CONFIGURED" };
  }
  const webApp = input.webAppUrl.replace(/\/$/, "");
  const result = await sendBrevoTemplate(config, {
    to: input.to,
    templateId: config.templates.accountConfirmed,
    params: {
      email: input.to,
      EMAIL: input.to,
      web_app_url: webApp,
      WEB_APP_URL: webApp,
    },
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
      reset_link: input.resetLink,
      RESET_LINK: input.resetLink,
      email: input.to,
      EMAIL: input.to,
    },
    correlationId: input.correlationId,
  });
  return result.ok ? { sent: true } : { sent: false, reason: result.reason };
}
