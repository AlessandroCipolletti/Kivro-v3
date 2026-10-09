import {
  AWS_DEFAULT_CONTROL_PLANE_ID,
  NETSONS_DEFAULT_CONTROL_PLANE_ID,
  type ControlPlaneLifecycleState,
} from "./worker-discovery.js";
import type { CloudProfileId } from "./composition.js";

export type ControlPlaneRegistryEntry = {
  controlPlaneId: string;
  lifecycleState: ControlPlaneLifecycleState;
};

/** PORT-021 / M22 — lifecycle from env (ops flips ACTIVE without Worker re-pair). */
export function readControlPlaneRegistry(
  env: NodeJS.ProcessEnv = process.env,
): ControlPlaneRegistryEntry[] {
  const netsonsState = lifecycleFromEnv(env.KIVRO_NETSONS_CP_STATE, "DRAINING");
  const awsState = lifecycleFromEnv(env.KIVRO_AWS_CP_STATE, "ACTIVE");
  return [
    { controlPlaneId: NETSONS_DEFAULT_CONTROL_PLANE_ID, lifecycleState: netsonsState },
    { controlPlaneId: AWS_DEFAULT_CONTROL_PLANE_ID, lifecycleState: awsState },
  ];
}

function lifecycleFromEnv(
  raw: string | undefined,
  fallback: ControlPlaneLifecycleState,
): ControlPlaneLifecycleState {
  const v = raw?.trim().toUpperCase();
  if (v === "ACTIVE" || v === "DRAINING" || v === "RETIRED") {
    return v;
  }
  return fallback;
}

export function isDualControlPlaneDiscoveryEnabled(env: NodeJS.ProcessEnv = process.env): boolean {
  return env.KIVRO_DUAL_CONTROL_PLANE === "1" || env.KIVRO_DUAL_CONTROL_PLANE === "true";
}

export function defaultControlPlaneIdForProfile(profile: CloudProfileId): string {
  return profile === "aws" ? AWS_DEFAULT_CONTROL_PLANE_ID : NETSONS_DEFAULT_CONTROL_PLANE_ID;
}

/** New executions bind to the sole ACTIVE control plane (dual-transition mode). */
export function resolveActiveControlPlaneIdForNewExecutions(
  env: NodeJS.ProcessEnv = process.env,
): string {
  if (!isDualControlPlaneDiscoveryEnabled(env)) {
    const profile = (env.KIVRO_CLOUD_PROFILE?.trim().toLowerCase() ?? "netsons") as CloudProfileId;
    return defaultControlPlaneIdForProfile(profile === "aws" ? "aws" : "netsons");
  }
  const active = readControlPlaneRegistry(env).filter((cp) => cp.lifecycleState === "ACTIVE");
  if (active.length !== 1) {
    throw new Error(
      `CONTROL_PLANE_ACTIVE_AMBIGUOUS: expected exactly one ACTIVE control plane, got ${active.length}`,
    );
  }
  return active[0]!.controlPlaneId;
}

export function controlPlaneMayAcceptNewExecutions(
  controlPlaneId: string,
  env: NodeJS.ProcessEnv = process.env,
): boolean {
  const entry = readControlPlaneRegistry(env).find((cp) => cp.controlPlaneId === controlPlaneId);
  return entry?.lifecycleState === "ACTIVE";
}

/** Poll/WSS offers: in-flight work stays on owning control plane (PORT-005/008). */
export function jobVisibleOnControlPlane(input: {
  jobExecutionControlPlaneId: string | null;
  requestControlPlaneId: string;
  fallbackControlPlaneId: string;
}): boolean {
  const owner = input.jobExecutionControlPlaneId ?? input.fallbackControlPlaneId;
  return owner === input.requestControlPlaneId;
}

export function assertExecutionControlPlaneMatch(input: {
  jobExecutionControlPlaneId: string | null;
  envelopeControlPlaneId: string;
  fallbackControlPlaneId: string;
}): void {
  const owner = input.jobExecutionControlPlaneId ?? input.fallbackControlPlaneId;
  if (owner !== input.envelopeControlPlaneId) {
    throw new Error(
      `CROSS_CONTROL_PLANE_ROUTING:${input.envelopeControlPlaneId}->${owner}`,
    );
  }
}
