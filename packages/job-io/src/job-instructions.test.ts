import { describe, expect, it } from "vitest";
import { parseCapabilityContract } from "@kivro/contracts";
import { buildInternalJobInstructions } from "./job-instructions.js";

describe("buildInternalJobInstructions", () => {
  it("mentions job input and output paths", () => {
    const contract = parseCapabilityContract({
      name: "X",
      description: "d",
      currency: "USD",
      priceTierCents: 100,
      inputs: {
        contractVersion: 1,
        fields: [{ key: "instructions", type: "text", required: true }],
      },
      output: { contractVersion: 1, type: "TEXT" },
    });
    const text = buildInternalJobInstructions(contract);
    expect(text).toContain("/job/input/");
    expect(text).toContain("result.json");
  });
});
