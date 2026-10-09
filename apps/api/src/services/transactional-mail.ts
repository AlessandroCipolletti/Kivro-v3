import { resolvePublicApiBaseUrl } from "@kivro/auth";
import {
  getBrevoConfig,
  sendAccountConfirmedMessage,
  sendEmailVerificationMessage,
} from "@kivro/email";
import { logInfo } from "@kivro/observability";

function webAppUrl(): string {
  return process.env.WEB_APP_URL?.trim() || "http://localhost:3000";
}

function apiVerificationLink(verificationToken: string): string {
  const base = resolvePublicApiBaseUrl();
  return `${base}/auth/verify-email?token=${encodeURIComponent(verificationToken)}`;
}

export function isTransactionalEmailConfigured(): boolean {
  return getBrevoConfig() !== null;
}

export async function deliverVerificationEmail(input: {
  email: string;
  verificationToken: string;
  correlationId?: string;
}): Promise<void> {
  const confirmLink = apiVerificationLink(input.verificationToken);
  const web = webAppUrl().replace(/\/$/, "");
  const result = await sendEmailVerificationMessage({
    to: input.email,
    confirmLink,
    acceptLink: `${web}/verify-email`,
    correlationId: input.correlationId,
  });
  if (!result.sent) {
    logInfo({
      correlationId: input.correlationId ?? "auth",
      message: "Verification email not sent",
      reason: result.reason,
    });
  }
}

export async function deliverAccountConfirmedEmail(input: {
  email: string;
  correlationId?: string;
}): Promise<void> {
  const result = await sendAccountConfirmedMessage({
    to: input.email,
    correlationId: input.correlationId,
  });
  if (!result.sent) {
    logInfo({
      correlationId: input.correlationId ?? "auth",
      message: "Account confirmed email not sent",
      reason: result.reason,
    });
  }
}
