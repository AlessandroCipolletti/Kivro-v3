import type { InferenceTask } from "./platform-inference-policy.js";

/** Master Spec §170. Callers never pass a vendor payload. */
export type PlatformInferenceRequest = {
  task: InferenceTask;
  system: string;
  messages: Array<{ role: "user" | "assistant"; content: string }>;
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
};

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
    maxOutputTokens: input.maxOutputTokens,
    metadata: {
      userId: input.metadata.userId,
      conversationId: input.metadata.conversationId,
      orchestrationId: input.metadata.orchestrationId,
    },
  };
}
