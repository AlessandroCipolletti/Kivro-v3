/** §273 — typed research policy violations (fail closed). */
export type ResearchPolicyErrorCode =
  | "NETWORK_POLICY_VIOLATION"
  | "METHOD_NOT_ALLOWED"
  | "DESTINATION_BLOCKED"
  | "BUDGET_EXCEEDED"
  | "CONTENT_NOT_ALLOWED"
  | "CONNECTOR_NOT_DECLARED";

export interface ResearchPolicyError {
  code: ResearchPolicyErrorCode;
  message: string;
}

export function researchPolicyError(
  code: ResearchPolicyErrorCode,
  message: string,
): ResearchPolicyError {
  return { code, message };
}
