import { describe, expect, it } from "vitest";
import { persistWorkerJobDeliverables } from "./worker-deliverables.js";

describe("persistWorkerJobDeliverables", () => {
  it("exports persist function", () => {
    expect(typeof persistWorkerJobDeliverables).toBe("function");
  });
});
