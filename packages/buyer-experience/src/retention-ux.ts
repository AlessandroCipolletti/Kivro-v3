/** BUYERUX-032 — buyer-visible retention countdown and download eligibility. */
export function describeResultRetentionUx(input: {
  resultRetentionExpiresAt: Date | null | undefined;
  now?: Date;
}): {
  expiresAt: string | null;
  expired: boolean;
  daysRemaining: number | null;
  headline: string;
  downloadAllowed: boolean;
} {
  const expiresAt = input.resultRetentionExpiresAt;
  if (!expiresAt) {
    return {
      expiresAt: null,
      expired: false,
      daysRemaining: null,
      headline: "Result files follow platform retention policy.",
      downloadAllowed: true,
    };
  }
  const now = input.now ?? new Date();
  const expired = Boolean(expiresAt && expiresAt.getTime() <= now.getTime());
  const msLeft = expiresAt.getTime() - now.getTime();
  const daysRemaining = expired ? 0 : Math.max(0, Math.ceil(msLeft / 86_400_000));
  return {
    expiresAt: expiresAt.toISOString(),
    expired,
    daysRemaining,
    headline: expired
      ? "Result files expired — historical job metadata remains available."
      : `Result files available until ${expiresAt.toISOString().slice(0, 10)} (${daysRemaining} day(s) remaining).`,
    downloadAllowed: !expired,
  };
}
