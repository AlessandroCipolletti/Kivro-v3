import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const root = process.cwd();

describe("M16 §90 canonical E2E fixtures", () => {
  it("Document Analyzer fixture matches §90 shape", () => {
    const doc = JSON.parse(
      fs.readFileSync(
        path.join(root, "security/adversarial-fixtures/document-analyzer.capability.json"),
        "utf8",
      ),
    ) as { output: { files: string[] }; workerConstraints: { browser: boolean } };
    expect(doc.output.files).toContain("summary.md");
    expect(doc.output.files).toContain("structured-result.json");
    expect(doc.workerConstraints.browser).toBe(false);
  });

  it("Synthetic read-only DB fixture references broker tests", () => {
    const db = JSON.parse(
      fs.readFileSync(
        path.join(root, "security/adversarial-fixtures/synthetic-readonly-db.capability.json"),
        "utf8",
      ),
    ) as { resources: Array<{ tables: string[] }>; automatedEvidence: string };
    expect(db.resources[0]?.tables?.length).toBeGreaterThanOrEqual(2);
    expect(fs.existsSync(path.join(root, db.automatedEvidence))).toBe(true);
  });
});
