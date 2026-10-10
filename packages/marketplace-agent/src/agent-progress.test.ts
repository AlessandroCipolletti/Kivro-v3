import { describe, expect, it } from "vitest";
import { agentStepProgressLabel } from "./agent-progress.js";

describe("agent progress", () => {
  it("names the step without exposing reasoning", () => {
    expect(agentStepProgressLabel("SEARCHING_ALTERNATIVE")).toBe(
      "Searching for an available alternative",
    );
    expect(agentStepProgressLabel("WAITING")).toBe("Waiting for previous step");
    expect(JSON.stringify(agentStepProgressLabel("RUNNING"))).not.toContain("reasoning");
  });
});
