import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { normalizeInferenceRequest } from "./inference-request.js";

describe("normalized inference request", () => {
  it("keeps only the product fields", () => {
    const request = normalizeInferenceRequest({
      task: "ORCHESTRATION",
      system: "Plan the work.",
      messages: [{ role: "user", content: "Compare two services." }],
      maxOutputTokens: 800,
      metadata: { userId: "buyer-1", orchestrationId: "orch-1" },
    });
    expect(request.task).toBe("ORCHESTRATION");
    expect(request.metadata.userId).toBe("buyer-1");
    expect(Object.keys(request).sort()).toEqual([
      "maxOutputTokens",
      "messages",
      "metadata",
      "system",
      "task",
    ]);
  });

  it("keeps vendor URLs inside the provider adapters", () => {
    const dir = dirname(fileURLToPath(import.meta.url));
    const router = readFileSync(resolve(dir, "platform-inference.ts"), "utf8");
    const policy = readFileSync(resolve(dir, "platform-inference-policy.ts"), "utf8");
    const openai = readFileSync(resolve(dir, "platform-inference-openai.ts"), "utf8");
    const anthropic = readFileSync(resolve(dir, "platform-inference-anthropic.ts"), "utf8");
    expect(router).not.toContain("api.openai.com");
    expect(router).not.toContain("api.anthropic.com");
    expect(policy).not.toContain("api.openai.com");
    expect(openai).toContain("https://api.openai.com/v1/responses");
    expect(openai).toContain("https://developers.openai.com/api/docs/guides/migrate-to-responses");
    expect(anthropic).toContain("https://api.anthropic.com/v1/messages");
  });
});
