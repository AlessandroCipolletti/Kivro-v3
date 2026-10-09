import { describe, expect, it } from "vitest";
import { parseCapabilityContract } from "./capability-io.js";

describe("CapabilityContractSchema", () => {
  it("parses a minimal legacy contract", () => {
    const c = parseCapabilityContract({
      name: "Company Intelligence",
      description: "Structured report",
      currency: "USD",
      priceTierCents: 999,
      inputs: {
        contractVersion: 1,
        fields: [{ key: "companyName", type: "string", required: true, maxLength: 200 }],
      },
      output: { contractVersion: 1, type: "structured_report" },
    });
    expect(c.inputs.fields[0]?.key).toBe("companyName");
  });

  it("parses v2 input/output field contracts", () => {
    const c = parseCapabilityContract({
      name: "Blender",
      description: "Render",
      currency: "USD",
      priceTierCents: 800,
      inputs: {
        contractVersion: 2,
        fields: [
          {
            key: "scene",
            label: "Scene",
            type: "FILE",
            required: true,
            constraints: { file: { allowedExtensions: [".blend"] } },
          },
        ],
      },
      output: {
        contractVersion: 2,
        fields: [{ key: "renders", type: "FILES", required: true }],
      },
    });
    expect(c.output.contractVersion).toBe(2);
  });
});
