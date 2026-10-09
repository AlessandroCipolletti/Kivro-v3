import { describe, expect, it } from "vitest";
import { parseCapabilityContract } from "@kivro/contracts";
import { prepareAgentJobSubmission } from "./agent-input-mapper.js";

const contract = parseCapabilityContract({
  name: "Render",
  description: "d",
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
        constraints: { text: { minLength: 5 } },
      },
      {
        key: "scene",
        label: "Scene",
        type: "FILE",
        required: true,
        constraints: { file: { allowedExtensions: [".blend"] } },
      },
    ],
  },
  output: { contractVersion: 1, type: "FILES" },
});

describe("prepareAgentJobSubmission", () => {
  it("maps instructions and blend attachment", () => {
    const result = prepareAgentJobSubmission(contract, {
      instructions: "Make glass transparent please",
      attachments: [{ filename: "x.blend", assetId: "id1", sizeBytes: 1000 }],
    });
    expect(result.inputs.instructions).toContain("transparent");
    expect(result.assets.scene?.[0]?.assetId).toBe("id1");
  });
  it("reports missing required file", () => {
    const result = prepareAgentJobSubmission(contract, {
      instructions: "long enough instruction text",
    });
    expect(result.missingRequired).toContain("scene");
  });
});
