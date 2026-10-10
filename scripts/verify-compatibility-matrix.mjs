#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const matrixPath = path.join(root, "packages/compatibility/matrix.json");
const matrix = JSON.parse(fs.readFileSync(matrixPath, "utf8"));

const contracts = await import(path.join(root, "packages/contracts/dist/index.js"));
const core = await import(path.join(root, "packages/cloud-core/dist/index.js"));
const compatibility = await import(path.join(root, "packages/compatibility/dist/index.js"));

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
  console.error("Worker protocol compatibility window drift vs matrix");
  process.exit(1);
}

if (PROTOCOL_VERSION !== matrix.workerProtocolMin) {
  console.error(`PROTOCOL_VERSION ${PROTOCOL_VERSION} != matrix min ${matrix.workerProtocolMin}`);
  process.exit(1);
}

const migDir = path.join(root, matrix.database.migrationsRelativePath);
const migrationFolders = fs
  .readdirSync(migDir)
  .filter((f) => /^\d/.test(f) && fs.statSync(path.join(migDir, f)).isDirectory());

if (migrationFolders.length < 1) {
  console.error("Missing database migration history");
  process.exit(1);
}

const registryPath = path.join(root, matrix.database.rolloutRegistryPath);
const registry = compatibility.parseSchemaRolloutRegistry(
  JSON.parse(fs.readFileSync(registryPath, "utf8")),
);
const cover = compatibility.validateRolloutRegistryCoversDisk({
  registry,
  migrationFolderNames: migrationFolders,
});
if (!cover.ok) {
  console.error(`Schema rollout registry missing migrations: ${cover.missing.join(", ")}`);
  process.exit(1);
}

const fixturePath = path.join(root, "tests/fixtures/compatibility-matrix.json");
const fixture = JSON.parse(fs.readFileSync(fixturePath, "utf8"));
if (fixture.apiContractVersion !== matrix.apiContractVersion) {
  console.error("tests/fixtures/compatibility-matrix.json drift vs authoritative matrix");
  process.exit(1);
}

console.log("Compatibility matrix verification OK (M25 HARD-007)");
