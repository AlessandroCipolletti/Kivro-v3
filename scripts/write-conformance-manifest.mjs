#!/usr/bin/env node
/** CONFORMANCE.md release matrix seed (M19). */
import fs from "node:fs";
import path from "node:path";
import { createAwsComposition } from "../packages/cloud-aws/dist/index.js";
import { createNetsonsComposition } from "../packages/cloud-netsons/dist/index.js";
import { SHARED_API_CONTRACT_VERSION } from "../packages/cloud-core/dist/index.js";
import { WORKER_PROTOCOL_COMPATIBILITY_WINDOW } from "../packages/contracts/dist/index.js";

const root = path.resolve(import.meta.dirname, "..");
const outPath = path.join(root, "tests/fixtures/backend-conformance-manifest.json");

const netsons = createNetsonsComposition();
const aws = createAwsComposition();

const manifest = {
  generatedAt: new Date().toISOString(),
  apiContractVersion: SHARED_API_CONTRACT_VERSION,
  workerProtocolCompatibility: WORKER_PROTOCOL_COMPATIBILITY_WINDOW,
  profiles: {
    netsons: {
      workerTransport: netsons.workerTransport.kind,
      durableWorkProfile: netsons.durableWorkProfile,
      objectStorageProfile: netsons.objectStorageProfile,
    },
    aws: {
      workerTransport: aws.workerTransport.kind,
      durableWorkProfile: aws.durableWorkProfile,
      objectStorageProfile: aws.objectStorageProfile,
    },
  },
};

fs.writeFileSync(outPath, `${JSON.stringify(manifest, null, 2)}\n`);
console.log(`Wrote ${path.relative(root, outPath)}`);
