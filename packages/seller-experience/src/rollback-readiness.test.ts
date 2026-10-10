import type { WorkerManifest } from "@kivro/contracts";
import { describe, expect, it } from "vitest";
import { assessRollbackReadiness } from "./rollback-readiness.js";

const sampleManifest = (): WorkerManifest => ({
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

describe("assessRollbackReadiness", () => {
  it("blocks missing manifest and warns on in-flight jobs", () => {
    const blocked = assessRollbackReadiness({
      targetWorkerManifest: null,
      inFlightJobsOnCurrentVersion: 0,
    });
    expect(blocked.allowed).toBe(false);
    expect(blocked.blockers).toContain("TARGET_MANIFEST_MISSING");

    const warned = assessRollbackReadiness({
      targetWorkerManifest: sampleManifest(),
      inFlightJobsOnCurrentVersion: 2,
    });
    expect(warned.warnings.some((w) => w.includes("in-flight"))).toBe(true);
  });
});
