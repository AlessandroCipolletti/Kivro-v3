import { describe, expect, it } from "vitest";
import { contractBreakReasons } from "./contract-break.js";

describe("contract breaks", () => {
  it("flags a new required input and an output that becomes required", () => {
    const reasons = contractBreakReasons(
      {
        inputs: [{ key: "q", required: true, type: "TEXT" }],
        outputs: [{ key: "report", required: false, type: "TEXT" }],
      },
      {
        inputs: [
          { key: "q", required: true, type: "TEXT" },
          { key: "region", required: true, type: "TEXT" },
        ],
        outputs: [{ key: "report", required: true, type: "TEXT" }],
      },
    );
    expect(reasons).toContain("new required field region");
    expect(reasons).toContain("making optional output required report");
  });
});
