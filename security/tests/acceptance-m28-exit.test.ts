import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const root = path.resolve(import.meta.dirname, "../..");

describe("M28 exit criteria artifact", () => {
  it("M28-GOLD-004 exit JSON reports harness complete", () => {
    const doc = JSON.parse(
      fs.readFileSync(path.join(root, "docs/audits/M28-exit-criteria.json"), "utf8"),
    );
    expect(doc.m28HarnessComplete).toBe(true);
    const m23 = JSON.parse(
      fs.readFileSync(path.join(root, "docs/audits/M23-exit-criteria.json"), "utf8"),
    );
    const terminal = (m23.criteria ?? []).find((c: { id: string }) => c.id === "terminal-lossless-audit");
    expect(terminal?.status).toBe("EXECUTED_M28");
  });
});
