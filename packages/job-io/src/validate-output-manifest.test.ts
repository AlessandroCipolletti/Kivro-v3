import { describe, expect, it } from "vitest";
import { validateWorkerResultManifest } from "./validate-output-manifest.js";

describe("validateWorkerResultManifest", () => {
  it("accepts paths under output root", () => {
    const result = validateWorkerResultManifest(
      {
        contractVersion: 2,
        fields: [{ key: "renders", type: "FILES", required: true, constraints: { file: { minFiles: 1 } } }],
      },
      {
        schemaVersion: 1,
        fields: {
          renders: { type: "FILES", paths: ["renders/a.png"] },
        },
      },
      "/tmp/job/output",
    );
    expect(result.ok).toBe(true);
  });
  it("rejects path traversal", () => {
    const result = validateWorkerResultManifest(
      {
        contractVersion: 2,
        fields: [{ key: "scene", type: "FILE", required: true }],
      },
      {
        schemaVersion: 1,
        fields: {
          scene: { type: "FILE", path: "../etc/passwd" },
        },
      },
      "/tmp/job/output",
    );
    expect(result.ok).toBe(false);
  });
});
