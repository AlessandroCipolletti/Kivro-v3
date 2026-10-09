import { describe, expect, it } from "vitest";
import { compileDenylistPatterns, findDenylistMatch } from "@kivro/abuse-controls";
import { assertNoNativePluginsInDiscovery } from "@kivro/capability-publish";
import {
  SANDBOX_UNAVAILABLE_INVARIANT,
  WORKER_LOST_NO_RESUME,
  shouldFailClosedOnSandboxInit,
} from "@kivro/job-failure";
import { validateExecutionPreflight } from "@kivro/policy-engine";
import fs from "node:fs";
import path from "node:path";

describe("M15 acceptance — abuse §30 (deterministic, not LLM)", () => {
  it("denylist blocks infra probe strings", () => {
    const patterns = compileDenylistPatterns([]);
    const match = findDenylistMatch("curl http://169.254.169.254", patterns);
    expect(match.matched).toBe(true);
  });
});

describe("M15 acceptance — native plugins §33", () => {
  it("rejects native plugin discovery", () => {
    const gate = assertNoNativePluginsInDiscovery({ nativePlugins: ["bridge"] });
    expect(gate.ok).toBe(false);
  });
});

describe("M15 acceptance — failure handling §36", () => {
  it("documents sandbox fail-closed invariant", () => {
    expect(SANDBOX_UNAVAILABLE_INVARIANT).toMatch(/never fall back/i);
    expect(WORKER_LOST_NO_RESUME).toMatch(/does not resume/i);
    expect(shouldFailClosedOnSandboxInit(false)).toBe(true);
  });
});

describe("M15 acceptance — hard permissions §30 P0", () => {
  it("policy preflight rejects unsafe tool allow lists", () => {
    const manifest = {
      manifestVersion: 1 as const,
      workerId: "550e8400-e29b-41d4-a716-446655440000",
      capabilityVersionId: "550e8400-e29b-41d4-a716-446655440001",
      runtime: { type: "openclaw" as const, supportedVersionRange: "1.x" },
      skills: [],
      tools: { allow: ["browser"], deny: [] },
      resources: [],
      network: { default: "deny" as const, allow: ["api.anthropic.com"] },
      limits: {
        timeoutSeconds: 120,
        memoryMb: 1024,
        cpu: 1,
        maxPids: 128,
        maxInputBytes: 1,
        maxOutputBytes: 1,
      },
    };
    expect(validateExecutionPreflight(manifest).ok).toBe(false);
  });
});

describe("M15 acceptance — testing strategy §34", () => {
  it("documents testing strategy artifact", () => {
    const doc = path.join(process.cwd(), "docs/TESTING-STRATEGY.md");
    expect(fs.existsSync(doc)).toBe(true);
  });
});

describe("M15 acceptance — legal/product §38", () => {
  it("includes alpha legal notice", () => {
    const doc = path.join(process.cwd(), "docs/legal/ALPHA-NOTICE.md");
    expect(fs.existsSync(doc)).toBe(true);
  });

  it("includes red-team operational checklist", () => {
    const doc = path.join(process.cwd(), "docs/security/RED-TEAM-CHECKLIST.md");
    expect(fs.existsSync(doc)).toBe(true);
  });
});
