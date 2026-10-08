import { describe, expect, it } from "vitest";
import { parseCapabilityContract } from "./capability-io.js";

describe("CapabilityContractSchema", () => {
  it("parses a minimal contract", () => {
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
});
