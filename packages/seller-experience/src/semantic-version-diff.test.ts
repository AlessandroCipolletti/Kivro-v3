import { describe, expect, it } from "vitest";
import type { WorkerManifest } from "@kivro/contracts";
import { buildDraftManifestDiff, detectPermissionExpansion } from "./semantic-version-diff.js";

const baseManifest = (): WorkerManifest => ({
  manifestVersion: 1,
  workerId: "00000000-0000-0000-0000-000000000001",
  capabilityVersionId: "00000000-0000-0000-0000-000000000002",
  runtime: { type: "openclaw", supportedVersionRange: "1.x" },
  skills: ["demo"],
  tools: { allow: ["read"], deny: [] },
  resources: [],
  network: { default: "deny", allow: [] },
  limits: {
    timeoutSeconds: 60,
    memoryMb: 512,
    cpu: 1,
    maxPids: 64,
    maxInputBytes: 1_000_000,
    maxOutputBytes: 1_000_000,
  },
});

describe("semantic version diff SELLERUX-022/023", () => {
  it("detects permission expansion when tools grow", () => {
    const live = baseManifest();
    const draft = baseManifest();
    draft.tools.allow = ["read", "write"];
    expect(detectPermissionExpansion(live, draft)).toBe(true);
  });

  it("no expansion when manifest unchanged", () => {
    const live = baseManifest();
    expect(detectPermissionExpansion(live, baseManifest())).toBe(false);
  });

  it("buildDraftManifestDiff surfaces warnings", () => {
    const live = baseManifest();
    const draft = baseManifest();
    draft.tools.allow = ["read", "exec"];
    const diff = buildDraftManifestDiff(live, draft);
    expect(diff.permissionExpansion).toBe(true);
    expect(diff.prominentWarnings.length).toBeGreaterThan(0);
  });
});
