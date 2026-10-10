import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { CORE_ARCHITECTURE_PRINCIPLES, MVP_ONE_SENTENCE } from "./architecture-principles.js";

describe("architecture principles", () => {
  it("keeps the MVP sentence and the core principles in the README", () => {
    const readme = readFileSync(resolve(process.cwd(), "README.md"), "utf8");
    expect(readme).toContain(MVP_ONE_SENTENCE);
    for (const principle of CORE_ARCHITECTURE_PRINCIPLES) {
      expect(readme).toContain(principle);
    }
  });
});
