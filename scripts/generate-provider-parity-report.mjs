#!/usr/bin/env node
/** M24 — generated provider parity evidence for release/conformance matrix. */
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const root = path.resolve(import.meta.dirname, "..");

const mod = await import(path.join(root, "packages/cloud-netsons/dist/index.js"));
const awsMod = await import(path.join(root, "packages/cloud-aws/dist/index.js"));
const coreMod = await import(path.join(root, "packages/cloud-core/dist/index.js"));

const netsons = mod.createNetsonsComposition();
const aws = awsMod.createAwsComposition();
coreMod.assertCompositionParity(netsons, aws);

const matrix = JSON.parse(
  fs.readFileSync(path.join(root, "tests/fixtures/compatibility-matrix.json"), "utf8"),
);

const report = {
  generatedAt: new Date().toISOString(),
  apiContractVersion: netsons.apiContractVersion,
  workerProtocolVersion: netsons.workerProtocolVersion,
  compatibilityMatrix: matrix,
  profiles: {
    netsons: {
      durableWorkProfile: netsons.durableWorkProfile,
      objectStorageProfile: netsons.objectStorageProfile,
      workerTransportKind: netsons.workerTransport.kind,
    },
    aws: {
      durableWorkProfile: aws.durableWorkProfile,
      objectStorageProfile: aws.objectStorageProfile,
      workerTransportKind: aws.workerTransport.kind,
    },
  },
  parityAsserted: true,
};

const outDir = path.join(root, "docs/audits");
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(
  path.join(outDir, "M24-provider-parity-report.json"),
  `${JSON.stringify(report, null, 2)}\n`,
);

console.log("M24 provider parity report generated");
