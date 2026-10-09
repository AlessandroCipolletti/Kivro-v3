import { assertCompositionParity, type KivroCloudComposition } from "@kivro/cloud-core";
import { createAwsComposition } from "@kivro/cloud-aws";
import { createNetsonsComposition } from "@kivro/cloud-netsons";

let active: KivroCloudComposition | null = null;

/** Runtime composition root selected by deploy profile (M19 — one shared API app). */
export function resolveCloudComposition(profileRaw?: string): KivroCloudComposition {
  const profile = profileRaw?.trim().toLowerCase();
  if (profile === "aws") {
    active = createAwsComposition();
    return active;
  }
  active = createNetsonsComposition();
  return active;
}

export function getActiveCloudComposition(): KivroCloudComposition {
  if (!active) {
    return resolveCloudComposition(process.env.KIVRO_CLOUD_PROFILE);
  }
  return active;
}

export function verifyBothCompositionRootsParity(): void {
  assertCompositionParity(createNetsonsComposition(), createAwsComposition());
}
