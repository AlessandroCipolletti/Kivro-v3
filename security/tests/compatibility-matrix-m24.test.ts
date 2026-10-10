import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  PROTOCOL_VERSION,
  WORKER_PROTOCOL_COMPATIBILITY_WINDOW,
} from "@kivro/contracts";
import { SHARED_API_CONTRACT_VERSION } from "@kivro/cloud-core";

const root = process.cwd();

describe("M24 compatibility matrix (HARD-007)", () => {
  it("M24-GOLD-006 fixture matches live version surfaces", () => {
    const matrix = JSON.parse(
      fs.readFileSync(path.join(root, "tests/fixtures/compatibility-matrix.json"), "utf8"),
    ) as {
      apiContractVersion: string;
      workerProtocolMin: number;
      workerProtocolMax: number;
      workerRelease: { minSupportedWorkerVersion: string };
    };
    expect(matrix.workerRelease.minSupportedWorkerVersion).toBeTruthy();
    expect(matrix.apiContractVersion).toBe(SHARED_API_CONTRACT_VERSION);
    expect(matrix.workerProtocolMin).toBe(PROTOCOL_VERSION);
    expect(WORKER_PROTOCOL_COMPATIBILITY_WINDOW.minSupportedProtocolVersion).toBe(
      matrix.workerProtocolMin,
    );
    expect(WORKER_PROTOCOL_COMPATIBILITY_WINDOW.maxAdvertisedProtocolVersion).toBe(
      matrix.workerProtocolMax,
    );
  });
});
