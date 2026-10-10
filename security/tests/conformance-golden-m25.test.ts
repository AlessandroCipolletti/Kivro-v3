import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { KIVRO_COMPATIBILITY_MATRIX, validateUnifiedReleaseManifest } from "@kivro/compatibility";

const root = process.cwd();

describe("M25 golden conformance — release compatibility metadata", () => {
  it("unified release manifest matches authoritative matrix", () => {
    const manifestPath = path.join(root, "docs/audits/unified-release-manifest.json");
    expect(fs.existsSync(manifestPath)).toBe(true);
    const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
    const validation = validateUnifiedReleaseManifest(manifest);
    expect(validation.ok).toBe(true);
    expect(manifest.apiContractVersion).toBe(KIVRO_COMPATIBILITY_MATRIX.apiContractVersion);
  });

  it("schema rollout registry path is declared in matrix", () => {
    expect(KIVRO_COMPATIBILITY_MATRIX.database.rolloutRegistryPath).toBe(
      "tests/fixtures/schema-rollout-registry.json",
    );
    expect(fs.existsSync(path.join(root, KIVRO_COMPATIBILITY_MATRIX.database.rolloutRegistryPath))).toBe(
      true,
    );
  });
});
