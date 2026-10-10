import { describe, expect, it } from "vitest";
import { archiveInputIssue } from "./archive-inputs.js";

describe("archive inputs", () => {
  it("rejects zip contracts", () => {
    expect(archiveInputIssue("bundle", ["application/zip"], [])).toMatch(/archive formats/);
    expect(archiveInputIssue("notes", ["text/plain"], [".txt"])).toBeNull();
  });
});
