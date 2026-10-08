import { describe, expect, it } from "vitest";
import { buildWorkerManifestTemplate } from "./build-manifest-template.js";
import { finalizeWorkerManifest } from "./worker-manifest-verify.js";

describe("finalizeWorkerManifest", () => {
  it("binds version and worker ids", () => {
    const template = buildWorkerManifestTemplate({
      skills: [{ name: "demo", contentHash: "sha256:" + "a".repeat(64) }],
    });
    const { manifest, hash } = finalizeWorkerManifest(template, {
      capabilityVersionId: "11111111-1111-1111-1111-111111111111",
      workerDeviceId: "22222222-2222-2222-2222-222222222222",
    });
    expect(manifest.capabilityVersionId).toBe("11111111-1111-1111-1111-111111111111");
    expect(manifest.workerId).toBe("22222222-2222-2222-2222-222222222222");
    expect(hash.startsWith("sha256:")).toBe(true);
  });
});
