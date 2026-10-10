import { describe, expect, it } from "vitest";
import { parseCapabilityContract } from "@kivro/contracts";
import { validateBuyerInput } from "./validate-buyer-input.js";

const contract = parseCapabilityContract({
  name: "Blender Product Renderer",
  description: "Render",
  currency: "USD",
  priceTierCents: 800,
  inputs: {
    contractVersion: 2,
    fields: [
      {
        key: "instructions",
        label: "Instructions",
        type: "LONG_TEXT",
        required: true,
        constraints: { text: { minLength: 10, maxLength: 10000 } },
      },
      {
        key: "scene",
        label: "Scene",
        type: "FILE",
        required: true,
        constraints: {
          file: { allowedExtensions: [".blend"], maxFileSizeBytes: 524288000 },
        },
      },
      {
        key: "resolution",
        label: "Resolution",
        type: "SELECT",
        required: true,
        constraints: { text: { allowedValues: ["1080p", "4K"] } },
      },
      {
        key: "duration",
        label: "Duration",
        type: "INTEGER",
        required: true,
        when: { fieldKey: "resolution", equals: "4K" },
        constraints: { text: { minimum: 1, maximum: 120 } },
      },
    ],
  },
  output: {
    contractVersion: 2,
    fields: [
      { key: "renders", type: "FILES", required: true, constraints: { file: { minFiles: 1 } } },
    ],
  },
});

describe("validateBuyerInput", () => {
  it("accepts valid blender-style submission", () => {
    const result = validateBuyerInput({
      contract,
      inputs: {
        instructions: "Make the bottle glass transparent",
        resolution: "1080p",
      },
      assets: {
        scene: [
          {
            assetId: "a1",
            filename: "product.blend",
            sizeBytes: 1024,
            sniffedMimeType: "application/x-blender",
          },
        ],
      },
    });
    expect(result.ok).toBe(true);
  });
  it("accepts a missing optional text field", () => {
    const optional = parseCapabilityContract({
      name: "Notes",
      description: "Notes",
      currency: "USD",
      priceTierCents: 100,
      inputs: {
        contractVersion: 2,
        fields: [
          {
            key: "notes",
            label: "Notes",
            type: "LONG_TEXT",
            required: false,
            constraints: { text: { minLength: 0, maxLength: 1000 } },
          },
        ],
      },
      output: { contractVersion: 1, type: "TEXT" },
    });
    const result = validateBuyerInput({ contract: optional, inputs: {}, assets: {} });
    expect(result.ok).toBe(true);
  });

  it("rejects missing required file", () => {
    const result = validateBuyerInput({
      contract,
      inputs: { instructions: "long enough text here", resolution: "1080p" },
      assets: {},
    });
    expect(result.ok).toBe(false);
  });
  it("rejects MIME/signature mismatches per §216", () => {
    const result = validateBuyerInput({
      contract,
      inputs: {
        instructions: "long enough text here",
        resolution: "1080p",
      },
      assets: {
        scene: [
          {
            assetId: "a1",
            filename: "photo.jpg",
            sizeBytes: 1024,
            declaredMimeType: "image/jpeg",
            sniffedMimeType: "application/pdf",
          },
        ],
      },
    });
    expect(result.ok).toBe(false);
    expect(result.issues.some((i) => i.code === "MIME_MISMATCH")).toBe(true);
  });

  it("enforces conditional field visibility", () => {
    const result = validateBuyerInput({
      contract,
      inputs: {
        instructions: "long enough text here",
        resolution: "1080p",
        duration: 10,
      },
      assets: {
        scene: [{ assetId: "a1", filename: "x.blend", sizeBytes: 1 }],
      },
    });
    expect(result.issues.some((i) => i.code === "INACTIVE_FIELD_PROVIDED")).toBe(true);
  });
});
