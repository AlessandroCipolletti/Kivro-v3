import type { InferenceTask } from "./platform-inference-policy.js";

export type PlatformToolDefinition = {
  name: string;
  description: string;
};

export type PlatformToolCall = {
  name: string;
  arguments: unknown;
};

/** Master Spec §170. Callers never pass a vendor payload. */
export type PlatformInferenceRequest = {
  task: InferenceTask;
  system: string;
  messages: Array<{ role: "user" | "assistant"; content: string }>;
  tools?: PlatformToolDefinition[];
  responseSchema?: Record<string, unknown>;
  maxOutputTokens?: number;
  metadata: {
    userId?: string;
    conversationId?: string;
    orchestrationId?: string;
  };
};

export type PlatformInferenceResponse = {
  provider: "openai" | "anthropic" | "deterministic";
  model: string;
  text?: string;
  structuredOutput?: unknown;
  toolCalls?: PlatformToolCall[];
};

export type ProviderHealth = {
  id: "openai" | "anthropic";
  configured: boolean;
};

export interface PlatformInferenceProvider {
  readonly id: "openai" | "anthropic";
  generate(request: PlatformInferenceRequest): Promise<PlatformInferenceResponse>;
  healthCheck(): Promise<ProviderHealth>;
  estimateCost(): null;
}

export function normalizeInferenceRequest(
  input: PlatformInferenceRequest,
): PlatformInferenceRequest {
  return {
    task: input.task,
    system: input.system,
    messages: input.messages.map((message) => ({
      role: message.role,
      content: message.content,
    })),
    ...(input.tools
      ? {
          tools: input.tools.map((tool) => ({
            name: tool.name,
            description: tool.description,
          })),
        }
      : {}),
    ...(input.responseSchema ? { responseSchema: input.responseSchema } : {}),
    maxOutputTokens: input.maxOutputTokens,
    metadata: {
      userId: input.metadata.userId,
      conversationId: input.metadata.conversationId,
      orchestrationId: input.metadata.orchestrationId,
    },
  };
}
