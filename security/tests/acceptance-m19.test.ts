import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { assertCompositionParity, SHARED_API_CONTRACT_VERSION } from "@kivro/cloud-core";
import { createAwsComposition } from "@kivro/cloud-aws";
import { createNetsonsComposition } from "@kivro/cloud-netsons";
import {
  assertTransportSemanticParity,
  createPollingWorkerTransport,
  createWssWorkerTransport,
} from "@kivro/worker-transport";

const root = path.resolve(import.meta.dirname, "../..");

describe("M19 unified backend & conformance harness", () => {
  it("exposes verify:m19 and composition packages", () => {
    const pkg = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));
    expect(pkg.scripts["verify:m19"]).toBeTruthy();
    for (const dir of [
      "packages/cloud-core",
      "packages/cloud-netsons",
      "packages/cloud-aws",
      "packages/worker-transport",
    ]) {
      expect(fs.existsSync(path.join(root, dir, "package.json"))).toBe(true);
    }
  });

  it("both composition roots share API contract and Worker Protocol version", () => {
    const netsons = createNetsonsComposition();
    const aws = createAwsComposition();
    expect(netsons.apiContractVersion).toBe(SHARED_API_CONTRACT_VERSION);
    expect(aws.apiContractVersion).toBe(SHARED_API_CONTRACT_VERSION);
    expect(() => assertCompositionParity(netsons, aws)).not.toThrow();
  });

  it("default transports match profile baselines", () => {
    expect(createNetsonsComposition().workerTransport.kind).toBe("polling");
    expect(createAwsComposition().workerTransport.kind).toBe("wss");
  });

  it("documents WSS dispatch shim for AWS transport parity", () => {
    expect(
      fs.existsSync(path.join(root, "apps/api/src/routes/worker-wss-shim.ts")),
    ).toBe(true);
  });

  it("exposes worker service discovery and composition entry apps (PORT-021)", () => {
    expect(fs.existsSync(path.join(root, "apps/api/src/routes/worker-discovery.ts"))).toBe(
      true,
    );
    expect(fs.existsSync(path.join(root, "apps/cloud-netsons/start.mjs"))).toBe(true);
    expect(fs.existsSync(path.join(root, "apps/cloud-aws/start.mjs"))).toBe(true);
  });

  it("transport adapters remain semantically equivalent", () => {
    const polling = createPollingWorkerTransport({
      controlPlaneId: "cp",
      workerDeviceId: "wd",
      cloudBaseUrl: "http://localhost:3001",
    });
    const wss = createWssWorkerTransport({
      controlPlaneId: "cp",
      workerDeviceId: "wd",
      wssUrl: "ws://localhost:3001/worker/wss",
    });
    expect(() => assertTransportSemanticParity(polling, wss)).not.toThrow();
  });
});
