import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  assertCompositionParity,
  buildDualProfileControlPlaneAdvertisements,
  createBrokenCompositionDriftProbe,
} from "@kivro/cloud-core";
import { createNetsonsComposition } from "@kivro/cloud-netsons";
import { createAwsComposition } from "@kivro/cloud-aws";
import {
  assertPollParsingParity,
  createBrokenTransportDriftProbe,
  createPollingWorkerTransport,
  createWssWorkerTransport,
} from "@kivro/worker-transport";
import { PROTOCOL_VERSION } from "@kivro/contracts";

const root = process.cwd();

describe("M24 golden conformance hardening", () => {
  it("M19-GOLD-004 worker service discovery dual profile ads", () => {
    process.env.KIVRO_NETSONS_CP_STATE = "DRAINING";
    process.env.KIVRO_AWS_CP_STATE = "ACTIVE";
    const ads = buildDualProfileControlPlaneAdvertisements("http://localhost:3001", process.env);
    expect(ads.some((a) => a.lifecycleState === "DRAINING" && a.transports[0]?.kind === "polling")).toBe(
      true,
    );
    expect(ads.some((a) => a.lifecycleState === "ACTIVE" && a.transports[0]?.kind === "wss")).toBe(true);
  });

  it("M19-GOLD-005 dual transport coexistence (cross-routing blocked)", () => {
    const polling = createPollingWorkerTransport({
      controlPlaneId: "netsons-default",
      workerDeviceId: "wd",
      cloudBaseUrl: "http://localhost:3001",
    });
    const wss = createWssWorkerTransport({
      controlPlaneId: "aws-default",
      workerDeviceId: "wd",
      wssUrl: "ws://localhost:3001/worker/wss",
    });
    expect(polling.buildPoll().controlPlaneId).not.toBe(wss.buildPoll().controlPlaneId);
    assertPollParsingParity(
      createPollingWorkerTransport({
        controlPlaneId: "cp",
        workerDeviceId: "wd",
        cloudBaseUrl: "http://localhost:3001",
      }),
      createWssWorkerTransport({
        controlPlaneId: "cp",
        workerDeviceId: "wd",
        wssUrl: "ws://localhost:3001/worker/wss",
      }),
    );
  });

  it("M24-GOLD-001 composition drift canary rejects broken adapter", () => {
    const netsons = createNetsonsComposition();
    const aws = createBrokenCompositionDriftProbe(createAwsComposition());
    expect(() => assertCompositionParity(netsons, aws)).toThrow(/API contract drift/);
    assertCompositionParity(netsons, createAwsComposition());
  });

  it("M24-GOLD-002 transport drift canary rejects broken adapter", () => {
    const polling = createPollingWorkerTransport({
      controlPlaneId: "cp",
      workerDeviceId: "wd",
      cloudBaseUrl: "http://localhost:3001",
    });
    const broken = createBrokenTransportDriftProbe(polling);
    const wss = createWssWorkerTransport({
      controlPlaneId: "cp",
      workerDeviceId: "wd",
      wssUrl: "ws://localhost:3001/worker/wss",
    });
    expect(() => assertPollParsingParity(broken, wss)).toThrow(/semantic drift/);
  });

  it("M24-GOLD-003 provider parity report artifact", () => {
    const reportPath = path.join(root, "docs/audits/M24-provider-parity-report.json");
    expect(fs.existsSync(reportPath)).toBe(true);
    const report = JSON.parse(fs.readFileSync(reportPath, "utf8")) as {
      parityAsserted: boolean;
      workerProtocolVersion: string;
    };
    expect(report.parityAsserted).toBe(true);
    expect(report.workerProtocolVersion).toBe(PROTOCOL_VERSION);
  });

  it("M24-GOLD-004 duplicate semantic ownership gate script exists", () => {
    expect(fs.existsSync(path.join(root, "scripts/check-duplicate-semantic-ownership.mjs"))).toBe(true);
  });
});
