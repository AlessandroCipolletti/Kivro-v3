import { describe, expect, it } from "vitest";
import { parseCapabilityContract } from "@kivro/contracts";
import { validateAndNormalizeCapabilityContract } from "./validate-capability-contract.js";

describe("validateAndNormalizeCapabilityContract", () => {
  it("rejects file defaults", () => {
    const contract = parseCapabilityContract({
      name: "X",
      description: "d",
      currency: "USD",
      priceTierCents: 100,
      inputs: {
        contractVersion: 2,
        fields: [
          {
            key: "scene",
            label: "Scene",
            type: "FILE",
            required: true,
            defaultValue: "nope",
            constraints: { file: { allowedExtensions: [".blend"] } },
          },
        ],
      },
      output: { contractVersion: 1, type: "TEXT" },
    });
    expect(validateAndNormalizeCapabilityContract(contract).ok).toBe(false);
  });

  it("normalizes missing labels for v1", () => {
    const contract = parseCapabilityContract({
      name: "X",
      description: "d",
      currency: "USD",
      priceTierCents: 100,
      inputs: {
        contractVersion: 1,
        fields: [{ key: "companyName", type: "string", required: true }],
      },
      output: { contractVersion: 1, type: "TEXT" },
    });
    const result = validateAndNormalizeCapabilityContract(contract);
    expect(result.ok).toBe(true);
    expect(result.normalized?.inputs.fields[0]?.label).toBe("Company Name");
  });
});
