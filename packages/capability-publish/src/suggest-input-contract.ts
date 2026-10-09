import type { CapabilityContract } from "@kivro/contracts";
import { fileConstraintsFromPreset } from "@kivro/job-io";
import type { DiscoverySnapshot } from "./import-consent.js";

/** §205 — suggestion only; seller must review before publish. */
export function suggestInputContractFromDiscovery(discovery: DiscoverySnapshot): {
  suggested: CapabilityContract["inputs"];
  rationale: string[];
} {
  const rationale: string[] = [];
  const fields: CapabilityContract["inputs"]["fields"] = [
    {
      key: "instructions",
      label: "Instructions",
      type: "LONG_TEXT",
      required: true,
      order: 0,
      constraints: { text: { minLength: 10, maxLength: 10000 } },
    },
  ];
  rationale.push("Most capabilities require explicit text instructions.");

  const blenderish = discovery.skills.some((s) => /blender|blend|3d|render/i.test(s));
  if (blenderish) {
    const preset = fileConstraintsFromPreset("blender");
    fields.push({
      key: "scene",
      label: "Blender scene",
      type: "FILE",
      required: true,
      order: 1,
      description: "Primary .blend scene file",
      constraints: {
        file: {
          allowedExtensions: [...preset.allowedExtensions],
          allowedMimeTypes: [...preset.allowedMimeTypes],
          maxFileSizeBytes: 524_288_000,
        },
      },
    });
    rationale.push("Discovery suggests Blender/3D skills — proposed .blend file input.");
    const images = fileConstraintsFromPreset("images");
    fields.push({
      key: "referenceImages",
      label: "Reference images",
      type: "FILES",
      required: false,
      order: 2,
      constraints: {
        file: {
          minFiles: 0,
          maxFiles: 10,
          allowedExtensions: [...images.allowedExtensions],
          allowedMimeTypes: [...images.allowedMimeTypes],
        },
      },
    });
  }

  return {
    suggested: { contractVersion: 2, fields },
    rationale,
  };
}
