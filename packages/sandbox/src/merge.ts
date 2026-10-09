import { MARKETPLACE_SANDBOX_BASELINE } from "./baseline.js";

export interface SellerSandboxOverrides {
  docker?: {
    network?: string;
    memory?: string;
    cpus?: number;
  };
}

/** Seller config cannot weaken the marketplace baseline (§20). */
export function mergeSandboxConfig(seller?: SellerSandboxOverrides): typeof MARKETPLACE_SANDBOX_BASELINE {
  const base = MARKETPLACE_SANDBOX_BASELINE;
  if (!seller?.docker) {
    return base;
  }
  const network = seller.docker.network;
  if (network && network !== "none" && !network.startsWith("restricted:")) {
    throw new Error("SANDBOX_NETWORK_WEAKENING_FORBIDDEN");
  }
  if (seller.docker.memory && parseMemoryMb(seller.docker.memory) > 1024) {
    throw new Error("SANDBOX_MEMORY_CEILING_EXCEEDED");
  }
  return {
    ...base,
    docker: {
      ...base.docker,
      ...(seller.docker.network ? { network: seller.docker.network as "none" } : {}),
    },
  };
}

function parseMemoryMb(value: string): number {
  if (value.endsWith("g")) {
    return Number.parseFloat(value) * 1024;
  }
  if (value.endsWith("m")) {
    return Number.parseFloat(value);
  }
  return Number.parseFloat(value);
}
