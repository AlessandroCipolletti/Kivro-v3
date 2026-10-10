/** §356 — one purchasable capability is these coordinated contracts. */
export type MarketplaceServiceContract = {
  identity: { name: string; seller: string; description: string };
  version: { versionId: string; immutable: true };
  io: { accepts: string[]; outputs: string[] };
  permissions: string[];
  dependencies: string[];
  network: string;
  commercial: { priceCents: number; sellerEarningCents: number; platformFeeCents: number };
  availability: { status: string; nextAvailableAt: string | null };
  delivery: { success: string };
};

const FORBIDDEN_NETWORK = "ARBITRARY_REMOTE_CONTROL_OF_SELLER_NETWORK";

export function marketplaceServiceContract(input: Omit<MarketplaceServiceContract, "version"> & {
  version: { versionId: string };
}): MarketplaceServiceContract {
  if (input.network === FORBIDDEN_NETWORK) {
    throw new Error("NETWORK_NOT_A_SERVICE_PRIMITIVE");
  }
  return {
    ...input,
    version: { versionId: input.version.versionId, immutable: true },
  };
}
