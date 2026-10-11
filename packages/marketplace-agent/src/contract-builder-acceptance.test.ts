import { describe, expect, it } from "vitest";
import {
  addFileInput,
  addOutputField,
  addScalarInput,
  buildBuyerFormSchema,
  compileContract,
  createContractDraft,
  prepareAgentJobSubmission,
  publishContract,
  reorderInputs,
  sanitizeDownloadFilename,
  validateBuyerInput,
  validateWorkerResultManifest,
} from "@kivro/job-io";
import { validatePlanCompatibility } from "./plan-compatibility.js";

describe("contract builder acceptance", () => {
  it("builds a file-heavy contract and keeps the published version immutable", () => {
    const draft = createContractDraft("Blender Product Renderer", "Render a scene");
    addScalarInput(draft, {
      key: "instructions",
      label: "Instructions",
      description: "What to render",
      required: true,
      constraints: { text: { minLength: 10, maxLength: 1000 } },
    });
    addFileInput(draft, {
      key: "scene",
      label: "Blender Scene",
      description: "One .blend file",
      required: true,
      multiple: false,
      preset: "blender",
      maxFiles: 1,
      maxFileSizeBytes: 500_000_000,
    });
    addFileInput(draft, {
      key: "references",
      label: "Reference Images",
      required: false,
      multiple: true,
      preset: "images",
      maxFiles: 10,
      maxFileSizeBytes: 20_000_000,
    });
    reorderInputs(draft, ["scene", "instructions", "references"]);
    addOutputField(draft, {
      key: "renders",
      type: "FILES",
      required: true,
      constraints: { file: { minFiles: 1, allowedExtensions: [".png"] } },
    });
    const contract = publishContract(draft);
    expect(contract.inputs.fields.map((field) => field.key)).toEqual(["scene", "instructions", "references"]);
    expect(buildBuyerFormSchema(contract).fields.length).toBe(3);
    expect(() => addScalarInput(draft, { key: "extra", label: "Extra", required: false })).toThrow(/immutable/);

    const submission = validateBuyerInput({
      contract,
      inputs: { instructions: "Make the bottle glass" },
      assets: { scene: [{ assetId: "a1", filename: "scene.blend", sizeBytes: 100, sniffedMimeType: "application/x-blender" }] },
    });
    expect(submission.ok).toBe(true);
    const output = validateWorkerResultManifest(
      contract.output,
      { schemaVersion: 1, fields: { renders: { type: "FILES", paths: ["render.png"] } } },
      "/tmp/kivro-output",
    );
    expect(output.ok).toBe(true);
    expect(sanitizeDownloadFilename("../render.png")).not.toContain("..");

    const agent = prepareAgentJobSubmission(contract, { instructions: "Make the bottle glass" });
    expect(agent.missingRequired.length).toBeGreaterThan(0);

    expect(
      validatePlanCompatibility([
        { clientStepKey: "research", outputKind: "text", dependsOnStepIds: [] },
        { clientStepKey: "pdf", outputKind: "pdf", inputKind: "text", dependsOnStepIds: ["research"] },
      ]),
    ).toEqual([]);
    expect(compileContract({ ...draft, published: null }).name).toBe(contract.name);
  });
});
