import type { WorkerManifest } from "@kivro/contracts";

export interface ControlledEgressRequest {
  manifest: WorkerManifest;
  url: string;
  method?: string;
  /** Redirect following is disabled in MVP; target host must match original. */
  redirectUrl?: string;
}

export interface ControlledEgressDecision {
  allowed: boolean;
  reason?: string;
  host?: string;
  port?: number;
  audit: Record<string, string>;
}
