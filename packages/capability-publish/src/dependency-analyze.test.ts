import { describe, expect, it } from "vitest";
import { ImportConsentSchema } from "./import-consent.js";
import { buildDependencyGraph, findPublishBlockers } from "./dependency-analyze.js";

describe("buildDependencyGraph", () => {
  it("flags blocked tool patterns", () => {
    const consent = ImportConsentSchema.parse({
      consentVersion: 1,
      selectedSkills: ["video"],
      selectedTools: ["personal browser session"],
      permissionManifest: {
        manifestVersion: 1,
        categories: [{ key: "BROWSER", state: "USED", buyerLabel: "Browser" }],
      },
    });
    const graph = buildDependencyGraph(
      {
        snapshotVersion: 1,
        skills: ["video"],
        tools: ["personal browser session"],
        nativePlugins: [],
        warnings: [],
      },
      consent,
      "Video",
    );
    expect(findPublishBlockers(graph).length).toBeGreaterThan(0);
  });
});
