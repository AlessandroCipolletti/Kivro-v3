export type BrevoConfig = {
  apiKey: string;
  senderEmail?: string;
  senderName: string;
  templates: {
    emailVerification: number;
    passwordReset: number;
    accountConfirmed: number;
  };
};

export function getBrevoConfig(): BrevoConfig | null {
  const apiKey = process.env.BREVO_API_KEY?.trim();
  if (!apiKey) {
    return null;
  }
  const verification = parseTemplateId(process.env.BREVO_EMAIL_VERIFICATION_TEMPLATE_ID);
  const passwordReset = parseTemplateId(process.env.BREVO_PASSWORD_RESET_TEMPLATE_ID);
  const accountConfirmed = parseTemplateId(process.env.BREVO_ACCOUNT_CONFIRMED_TEMPLATE_ID);
  if (verification == null || passwordReset == null || accountConfirmed == null) {
    return null;
  }
  const senderEmail =
    process.env.BREVO_SENDER_EMAIL?.trim() ?? process.env.EMAIL_FROM?.trim() ?? undefined;
  return {
    apiKey,
    senderEmail,
    senderName: process.env.BREVO_SENDER_NAME?.trim() || "Kivro",
    templates: {
      emailVerification: verification,
      passwordReset,
      accountConfirmed,
    },
  };
}

function parseTemplateId(raw: string | undefined): number | null {
  if (!raw?.trim()) {
    return null;
  }
  const n = Number.parseInt(raw, 10);
  return Number.isFinite(n) && n > 0 ? n : null;
}
