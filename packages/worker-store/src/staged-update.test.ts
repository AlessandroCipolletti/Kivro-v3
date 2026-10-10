import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { getStagedWorkerUpdate, openWorkerStore, setStagedWorkerUpdate } from "./index.js";

describe("staged Worker update persistence (M25)", () => {
  it("M25-GOLD-010 round-trips staged state in worker store", () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), "kivro-wstore-"));
    const store = openWorkerStore(root);
    setStagedWorkerUpdate(store, {
      phase: "staging",
      version: "0.0.0-m08",
      healthChecksPassed: 1,
      requiredHealthChecks: 2,
    });
    expect(getStagedWorkerUpdate(store)).toMatchObject({ phase: "staging", version: "0.0.0-m08" });
  });
});
