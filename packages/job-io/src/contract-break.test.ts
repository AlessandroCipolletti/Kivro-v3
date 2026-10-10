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

  it("flags a removed field, a dropped file format, and an output type change", () => {
    const reasons = contractBreakReasons(
      {
        inputs: [
          { key: "notes", required: false, type: "TEXT" },
          { key: "scene", required: true, type: "FILE", acceptedFormats: ["blend", "png"] },
        ],
        outputs: [{ key: "render", required: true, type: "FILE" }],
      },
      {
        inputs: [{ key: "scene", required: true, type: "FILE", acceptedFormats: ["png"] }],
        outputs: [{ key: "render", required: true, type: "TEXT" }],
      },
    );
    expect(reasons).toContain("removing field notes");
    expect(reasons).toContain("removed accepted file format scene blend");
    expect(reasons).toContain("output type changed render");
  });
});
