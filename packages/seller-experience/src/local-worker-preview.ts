import type { CapabilityContract } from "@kivro/contracts";
import { validateBuyerInput, type JobAssetRef } from "@kivro/job-io";
import { projectDeclaredResult } from "@kivro/platform-policy";
import { buildDraftBuyerPreviewView } from "./draft-buyer-preview.js";

export type LocalWorkerPreviewExecutor = (input: {
  inputs: Record<string, unknown>;
  assets: Record<string, JobAssetRef[]>;
}) => Promise<Record<string, unknown>>;

/** §229 — show the buyer form, then run it on the local worker without creating a purchase. */
export async function runLocalWorkerPreview(input: {
  capabilityName: string;
  capabilitySlug: string;
  contract: CapabilityContract;
  priceCents: number;
  currency: string;
  inputs: Record<string, unknown>;
  assets: Record<string, JobAssetRef[]>;
  declaredOutputKeys: string[];
  approvedMetadataKeys: string[];
  worker?: LocalWorkerPreviewExecutor;
}): Promise<
  | { ran: false; reason: "worker_required" | "invalid_input"; purchasable: false; issues?: string[] }
  | { ran: true; purchasable: false; result: Record<string, unknown> }
> {
  const preview = buildDraftBuyerPreviewView(input);
  if (preview.presentation.purchasable !== false) {
    return { ran: false, reason: "invalid_input", purchasable: false };
  }
  const validation = validateBuyerInput({
    contract: input.contract,
    inputs: input.inputs,
    assets: input.assets,
  });
  if (!validation.ok) {
    return {
      ran: false,
      reason: "invalid_input",
      purchasable: false,
      issues: validation.issues.map((issue) => issue.code),
    };
  }
  if (!input.worker) {
    return { ran: false, reason: "worker_required", purchasable: false };
  }
  const output = await input.worker({ inputs: input.inputs, assets: input.assets });
  return {
    ran: true,
    purchasable: false,
    result: projectDeclaredResult(output, input.declaredOutputKeys, input.approvedMetadataKeys),
  };
}
