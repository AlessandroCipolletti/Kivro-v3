/** §230 — seller-authored cases stored for the capability. Not an execution. */
export const MAX_SELLER_TEST_CASES = 10;

export function validateSellerTestCase(input: {
  name: string;
  inputValues: unknown;
}): "ok" | "INVALID_TEST_CASE" {
  if (!input.name.trim() || input.name.trim().length > 120) {
    return "INVALID_TEST_CASE";
  }
  if (!input.inputValues || typeof input.inputValues !== "object" || Array.isArray(input.inputValues)) {
    return "INVALID_TEST_CASE";
  }
  return "ok";
}
