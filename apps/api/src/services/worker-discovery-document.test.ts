import { afterEach, describe, expect, it } from "vitest";
import {
  AWS_DEFAULT_CONTROL_PLANE_ID,
  NETSONS_DEFAULT_CONTROL_PLANE_ID,
} from "@kivro/cloud-core";
import { buildApiWorkerDiscoveryDocument } from "./worker-discovery-document.js";

describe("buildApiWorkerDiscoveryDocument (M22)", () => {
  const saved: Record<string, string | undefined> = {};

  afterEach(() => {
    for (const [k, v] of Object.entries(saved)) {
      if (v === undefined) delete process.env[k];
      else process.env[k] = v;
    }
  });

  function snapshot(keys: string[]) {
    for (const k of keys) {
      saved[k] = process.env[k];
    }
  }

  it("omits RETIRED control planes from worker-visible discovery", () => {
    snapshot(["KIVRO_NETSONS_CP_STATE", "KIVRO_AWS_CP_STATE"]);
    process.env.KIVRO_NETSONS_CP_STATE = "RETIRED";
    process.env.KIVRO_AWS_CP_STATE = "ACTIVE";
    const doc = buildApiWorkerDiscoveryDocument("http://localhost:3001");
    expect(doc.controlPlanes.map((cp) => cp.controlPlaneId)).toEqual([
      AWS_DEFAULT_CONTROL_PLANE_ID,
    ]);
  });

  it("includes both planes during DRAINING overlap", () => {
    snapshot(["KIVRO_NETSONS_CP_STATE", "KIVRO_AWS_CP_STATE"]);
    process.env.KIVRO_NETSONS_CP_STATE = "DRAINING";
    process.env.KIVRO_AWS_CP_STATE = "ACTIVE";
    const doc = buildApiWorkerDiscoveryDocument("http://localhost:3001");
    expect(doc.controlPlanes.map((cp) => cp.controlPlaneId).sort()).toEqual(
      [AWS_DEFAULT_CONTROL_PLANE_ID, NETSONS_DEFAULT_CONTROL_PLANE_ID].sort(),
    );
  });
});
