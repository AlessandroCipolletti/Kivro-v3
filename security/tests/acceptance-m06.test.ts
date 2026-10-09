import { describe, expect, it } from "vitest";
import { isAllowedResearchMethod } from "@kivro/research-broker";
import { evaluateControlledEgress } from "@kivro/egress-proxy";

/** §276 — Internet research acceptance criteria (brokered read-only path). */
describe("M06 acceptance criteria", () => {
  it("public research allows GET only", () => {
    expect(isAllowedResearchMethod("PUBLIC_WEB_RESEARCH", "GET")).toBe(true);
    expect(isAllowedResearchMethod("PUBLIC_WEB_RESEARCH", "POST")).toBe(false);
  });

  it("declared API egress does not substitute for public research broker", () => {
    const manifest = {
      manifestVersion: 1 as const,
      workerId: "550e8400-e29b-41d4-a716-446655440000",
      capabilityVersionId: "550e8400-e29b-41d4-a716-446655440001",
      runtime: { type: "openclaw" as const, supportedVersionRange: "1.x" },
      skills: [],
      tools: { allow: [], deny: ["browser"] },
      resources: [],
      network: { default: "deny" as const, allow: ["api.vendor.example"] },
      limits: {
        timeoutSeconds: 120,
        memoryMb: 1024,
        cpu: 1,
        maxPids: 128,
        maxInputBytes: 0,
        maxOutputBytes: 0,
      },
    };
    expect(evaluateControlledEgress(manifest, "https://api.vendor.example/data").allowed).toBe(true);
    expect(evaluateControlledEgress(manifest, "https://random-blog.example/post").allowed).toBe(
      false,
    );
  });
});
