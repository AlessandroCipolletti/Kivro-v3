/** SELLERUX-009..010 — cloud-visible credential metadata without secret values. */
export type CloudCredentialRef = {
  refId: string;
  provider: string;
  status: "CONFIGURED" | "MISSING" | "STALE" | "UNKNOWN";
  lastVerifiedAt: string | null;
};

export function buildCloudCredentialRefs(input: {
  refs: Array<{ refId: string; provider: string; lastVerifiedAt?: string | null }>;
  staleAfterMs?: number;
  now?: Date;
}): CloudCredentialRef[] {
  const now = input.now ?? new Date();
  const staleMs = input.staleAfterMs ?? 86_400_000;
  return input.refs.map((ref) => {
    if (!ref.lastVerifiedAt) {
      return { ...ref, status: "UNKNOWN" as const, lastVerifiedAt: null };
    }
    const age = now.getTime() - new Date(ref.lastVerifiedAt).getTime();
    const status = age > staleMs ? ("STALE" as const) : ("CONFIGURED" as const);
    return { refId: ref.refId, provider: ref.provider, status, lastVerifiedAt: ref.lastVerifiedAt };
  });
}
