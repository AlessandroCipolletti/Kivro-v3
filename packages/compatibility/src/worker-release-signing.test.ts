import { describe, expect, it } from "vitest";
import {
  demoWorkerReleaseManifest,
  generateWorkerReleaseSigningKeyPair,
  signWorkerReleaseManifest,
  verifyWorkerReleaseManifest,
} from "./worker-release-signing.js";

/** M25-GOLD-005 signed Worker release verification */
describe("Worker release signing (HARD-011)", () => {
  it("rejects tampered manifest", () => {
    const keys = generateWorkerReleaseSigningKeyPair();
    const manifest = demoWorkerReleaseManifest();
    const sig = signWorkerReleaseManifest(manifest, keys.privateKeyPem);
    expect(verifyWorkerReleaseManifest(manifest, sig, keys.publicKeyPem)).toBe(true);
    const tampered = { ...manifest, artifactSha256: "deadbeef".repeat(8) };
    expect(verifyWorkerReleaseManifest(tampered, sig, keys.publicKeyPem)).toBe(false);
  });
});
