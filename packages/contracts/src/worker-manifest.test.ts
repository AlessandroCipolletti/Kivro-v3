import { describe, expect, it } from "vitest";
import { parseWorkerManifest } from "./worker-manifest.js";

const base = {
  manifestVersion: 1,
  workerId: "550e8400-e29b-41d4-a716-446655440000",
  capabilityVersionId: "550e8400-e29b-41d4-a716-446655440001",
  runtime: { type: "openclaw", supportedVersionRange: "1.x" },
  skills: [],
  tools: { allow: [], deny: ["browser"] },
  resources: [],
  network: { default: "deny", allow: [] as unknown[] },
  limits: {
    timeoutSeconds: 120,
    memoryMb: 1024,
    cpu: 1,
    maxPids: 128,
    maxInputBytes: 0,
    maxOutputBytes: 0,
  },
};

describe("WorkerManifest network allow", () => {
  it("accepts host strings", () => {
    const m = parseWorkerManifest({
      ...base,
      network: { default: "deny", allow: ["api.anthropic.com"] },
    });
    expect(m.network.allow).toHaveLength(1);
  });
  it("accepts structured allow entries", () => {
    const m = parseWorkerManifest({
      ...base,
      network: {
        default: "deny",
        allow: [{ host: "api.anthropic.com", ports: [443], purpose: "LLM provider" }],
      },
    });
    expect(m.network.allow[0]).toMatchObject({ host: "api.anthropic.com" });
  });
});
