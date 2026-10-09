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

export type WorkerControlPlaneContext = {
  controlPlaneId: string;
  fallbackControlPlaneId: string;
};

export function gateWorkerJobOnControlPlane(
  job: { executionControlPlaneId: string | null },
  ctx?: WorkerControlPlaneContext,
): { error: "CROSS_CONTROL_PLANE" } | null {
  if (!ctx) {
    return null;
  }
  const gate = assertWorkerJobOnControlPlane({
    jobExecutionControlPlaneId: job.executionControlPlaneId,
    requestControlPlaneId: ctx.controlPlaneId,
    fallbackControlPlaneId: ctx.fallbackControlPlaneId,
  });
  return "error" in gate ? gate : null;
}
