import { assertExecutionControlPlaneMatch } from "@kivro/cloud-core";

export function assertWorkerJobOnControlPlane(input: {
  jobExecutionControlPlaneId: string | null;
  requestControlPlaneId: string;
  fallbackControlPlaneId: string;
}): { error: "CROSS_CONTROL_PLANE" } | { ok: true } {
  try {
    assertExecutionControlPlaneMatch({
      jobExecutionControlPlaneId: input.jobExecutionControlPlaneId,
      envelopeControlPlaneId: input.requestControlPlaneId,
      fallbackControlPlaneId: input.fallbackControlPlaneId,
    });
    return { ok: true };
  } catch {
    return { error: "CROSS_CONTROL_PLANE" };
  }
}
