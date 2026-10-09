import { describe, expect, it } from "vitest";
import { dependenciesMet, findRunnableSteps, toStepRecord } from "./orchestration-runner.js";

describe("orchestration-runner", () => {
  it("runs steps with satisfied dependencies only", () => {
    const steps = [
      toStepRecord({
        id: "1",
        label: "R1",
        capabilityId: "c1",
        capabilityVersionId: "v1",
        dependsOnStepIds: [],
        inputMappingJson: { _clientStepKey: "research-1" },
        status: "PLANNED",
        jobId: null,
        outputAssetRefsJson: null,
      }),
      toStepRecord({
        id: "2",
        label: "Compare",
        capabilityId: "c2",
        capabilityVersionId: "v2",
        dependsOnStepIds: ["research-1"],
        inputMappingJson: { _clientStepKey: "compare" },
        status: "PLANNED",
        jobId: null,
        outputAssetRefsJson: null,
      }),
    ];
    expect(findRunnableSteps(steps)).toHaveLength(1);
    const completed = { ...steps[0]!, status: "COMPLETED" };
    const after = [completed, steps[1]!];
    expect(findRunnableSteps(after)).toHaveLength(1);
    expect(findRunnableSteps(after)[0]?.clientStepKey).toBe("compare");
  });

  it("dependenciesMet requires COMPLETED status", () => {
    const dep = toStepRecord({
      id: "1",
      label: "R1",
      capabilityId: "c1",
      capabilityVersionId: "v1",
      dependsOnStepIds: [],
      inputMappingJson: { _clientStepKey: "research-1" },
      status: "RUNNING",
      jobId: "job-1",
      outputAssetRefsJson: null,
    });
    const step = toStepRecord({
      id: "2",
      label: "C",
      capabilityId: "c2",
      capabilityVersionId: "v2",
      dependsOnStepIds: ["research-1"],
      inputMappingJson: { _clientStepKey: "compare" },
      status: "PLANNED",
      jobId: null,
      outputAssetRefsJson: null,
    });
    const map = new Map([["research-1", dep]]);
    expect(dependenciesMet(step, map)).toBe(false);
  });
});
