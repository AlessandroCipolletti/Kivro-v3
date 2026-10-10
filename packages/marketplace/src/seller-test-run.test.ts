import { describe, expect, it } from "vitest";
import { evaluateSellerContractTest, failedContractTestCount } from "./seller-test-run.js";

const testCase = {
  name: "Renders a preview",
  inputValues: { instructions: "red cube" },
  expectedOutputKeys: ["summary"],
  expectedFileExtensions: ["png"],
  maxRuntimeMs: 300_000,
  maxInferenceCostCents: 50,
};

describe("seller contract test run", () => {
  it("passes a result inside the declared output, file, runtime, and cost limits", () => {
    const result = evaluateSellerContractTest(testCase, {
      elapsedMs: 1_000,
      inferenceCostCents: 10,
      outputKeys: ["summary"],
      fileExtensions: ["png"],
    });
    expect(result.ok).toBe(true);
    expect(failedContractTestCount([result])).toBe(0);
  });

  it("fails when the output file or the runtime limit is missed", () => {
    const result = evaluateSellerContractTest(testCase, {
      elapsedMs: 400_000,
      inferenceCostCents: 10,
      outputKeys: ["summary"],
      fileExtensions: ["txt"],
    });
    expect(result.ok).toBe(false);
    expect(result.reasons).toContain("missing_file:png");
    expect(result.reasons).toContain("runtime");
  });
});
