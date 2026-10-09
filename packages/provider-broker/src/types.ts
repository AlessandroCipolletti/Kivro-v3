import type { InferenceDependency } from "@kivro/contracts";

export interface ProviderBrokerRequest {
  inference: InferenceDependency;
  provider: string;
  model: string;
  estimatedInputTokens?: number;
  estimatedOutputTokens?: number;
  jobId?: string;
}

export interface ProviderBrokerDecision {
  allowed: boolean;
  reason?: string;
  maxEstimatedSpendCents?: number;
}

export interface ProviderBroker {
  authorize(request: ProviderBrokerRequest): ProviderBrokerDecision;
}
