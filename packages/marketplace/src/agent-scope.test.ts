import { describe, expect, it } from "vitest";
import { mvpAgentAllows } from "./agent-scope.js";

describe("marketplace agent scope", () => {
  it("discovers and plans, and does not negotiate or buy forever", () => {
    expect(mvpAgentAllows("discover")).toBe(true);
    expect(mvpAgentAllows("multi_job_plan")).toBe(true);
    expect(mvpAgentAllows("execute_after_approval")).toBe(true);
    expect(mvpAgentAllows("negotiate_price")).toBe(false);
    expect(mvpAgentAllows("recurring_purchase")).toBe(false);
    expect(mvpAgentAllows("create_capability")).toBe(false);
    expect(mvpAgentAllows("unlimited_budget")).toBe(false);
  });
});
