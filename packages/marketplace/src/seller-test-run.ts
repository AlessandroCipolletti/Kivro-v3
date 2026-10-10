/** §230 — a new version publishes only when its contract tests pass. */

export type SellerContractTest = {
  name: string;
  inputValues: Record<string, unknown>;
  expectedOutputKeys: string[];
  expectedFileExtensions: string[];
  maxRuntimeMs: number;
  maxInferenceCostCents: number;
};

export type SellerContractTestMeasurement = {
  elapsedMs: number;
  inferenceCostCents: number;
  outputKeys: string[];
  fileExtensions: string[];
};

export function evaluateSellerContractTest(
  test: SellerContractTest,
  measurement: SellerContractTestMeasurement,
): { ok: boolean; reasons: string[] } {
  const reasons: string[] = [];
  for (const key of test.expectedOutputKeys) {
    if (!measurement.outputKeys.includes(key)) {
      reasons.push(`missing_output:${key}`);
    }
  }
  for (const extension of test.expectedFileExtensions) {
    if (!measurement.fileExtensions.includes(extension)) {
      reasons.push(`missing_file:${extension}`);
    }
  }
  if (measurement.elapsedMs > test.maxRuntimeMs) {
    reasons.push("runtime");
  }
  if (measurement.inferenceCostCents > test.maxInferenceCostCents) {
    reasons.push("inference_cost");
  }
  return { ok: reasons.length === 0, reasons };
}

export function failedContractTestCount(
  cases: Array<{ ok: boolean }>,
): number {
  return cases.filter((testCase) => !testCase.ok).length;
}
