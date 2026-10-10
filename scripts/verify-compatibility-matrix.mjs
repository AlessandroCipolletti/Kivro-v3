#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const matrix = JSON.parse(
  fs.readFileSync(path.join(root, "tests/fixtures/compatibility-matrix.json"), "utf8"),
);

const contracts = await import(path.join(root, "packages/contracts/dist/index.js"));
const core = await import(path.join(root, "packages/cloud-core/dist/index.js"));

const { PROTOCOL_VERSION, WORKER_PROTOCOL_COMPATIBILITY_WINDOW } = contracts;
const { SHARED_API_CONTRACT_VERSION } = core;

if (matrix.apiContractVersion !== SHARED_API_CONTRACT_VERSION) {
  console.error(
    `API contract drift: matrix ${matrix.apiContractVersion} vs core ${SHARED_API_CONTRACT_VERSION}`,
  );
  process.exit(1);
}

if (
  WORKER_PROTOCOL_COMPATIBILITY_WINDOW.minSupportedProtocolVersion !== matrix.workerProtocolMin ||
  WORKER_PROTOCOL_COMPATIBILITY_WINDOW.maxAdvertisedProtocolVersion !== matrix.workerProtocolMax
) {
  console.error("Worker protocol compatibility window drift vs fixture");
  process.exit(1);
}

if (PROTOCOL_VERSION !== matrix.workerProtocolMin) {
  console.error(`PROTOCOL_VERSION ${PROTOCOL_VERSION} != matrix min ${matrix.workerProtocolMin}`);
  process.exit(1);
}

const migDir = path.join(root, matrix.database.migrationsRelativePath);
if (!fs.existsSync(migDir) || fs.readdirSync(migDir).filter((f) => /^\d/.test(f)).length < 1) {
  console.error("Missing database migration history");
  process.exit(1);
}

console.log("Compatibility matrix verification OK (HARD-007 seed)");
