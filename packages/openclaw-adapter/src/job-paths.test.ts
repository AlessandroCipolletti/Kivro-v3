import path from "node:path";
import { describe, expect, it } from "vitest";
import { localBuyerInputDirToDelete } from "./job-paths.js";

describe("local buyer input cleanup", () => {
  it("deletes only an input directory inside the runtime root", () => {
    const root = path.resolve("/tmp/kivro-runtime");
    const input = path.join(root, "jobs", "job-1", "attempt-1", "input");
    expect(localBuyerInputDirToDelete(root, input)).toBe(input);
    expect(localBuyerInputDirToDelete(root, path.join(root, "jobs", "job-1", "output"))).toBeNull();
    expect(localBuyerInputDirToDelete(root, "/etc/input")).toBeNull();
  });
});
