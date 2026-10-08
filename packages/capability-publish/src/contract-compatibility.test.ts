import { describe, expect, it } from "vitest";
import { parseCapabilityContract } from "@kivro/contracts";
import { checkContractDependencyCompatibility } from "./contract-compatibility.js";

describe("checkContractDependencyCompatibility", () => {
  it("warns on blend input without blender skill", () => {
    const contract = parseCapabilityContract({
      name: "X",
      description: "d",
      currency: "USD",
      priceTierCents: 100,
      inputs: {
        contractVersion: 1,
        fields: [
          {
            key: "model",
            type: "file",
            required: true,
            file: { mimeAllowList: ["application/x-blend"] },
          },
        ],
      },
      output: { contractVersion: 1, type: "TEXT" },
    });
    const warnings = checkContractDependencyCompatibility(contract, ["research"]);
    expect(warnings.some((w) => w.code === "FILE_TYPE_WITHOUT_TOOL")).toBe(true);
  });
});
