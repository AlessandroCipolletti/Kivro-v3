/** §447 — buyers cannot pause/resume seller execution. */
export const BUYER_JOB_CONTROL_FORBIDDEN = "BUYER_JOB_CONTROL_FORBIDDEN" as const;

export function rejectBuyerJobControl(): { error: typeof BUYER_JOB_CONTROL_FORBIDDEN } {
  return { error: BUYER_JOB_CONTROL_FORBIDDEN };
}
