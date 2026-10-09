import {
  defaultControlPlaneIdForProfile,
  resolveActiveControlPlaneIdForNewExecutions,
} from "@kivro/cloud-core";
import { getActiveCloudComposition } from "../cloud-composition.js";

export function resolveWorkerRequestControlPlane(
  headerValue: string | undefined,
): { controlPlaneId: string; fallbackControlPlaneId: string } {
  const composition = getActiveCloudComposition();
  const fallback = defaultControlPlaneIdForProfile(composition.profile);
  let defaultCp = fallback;
  try {
    defaultCp = resolveActiveControlPlaneIdForNewExecutions(process.env);
  } catch {
    // single-profile or ambiguous ACTIVE — use composition default
  }
  const controlPlaneId = headerValue?.trim() || defaultCp;
  return { controlPlaneId, fallbackControlPlaneId: fallback };
}
