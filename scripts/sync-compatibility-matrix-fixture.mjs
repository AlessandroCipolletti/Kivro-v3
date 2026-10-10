#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const authoritative = path.join(root, "packages/compatibility/matrix.json");
const fixture = path.join(root, "tests/fixtures/compatibility-matrix.json");
const src = JSON.parse(fs.readFileSync(authoritative, "utf8"));
const fixtureDoc = {
  ...src,
  description: "HARD-007 — mirror of packages/compatibility/matrix.json for fixtures/tests.",
};
fs.writeFileSync(fixture, `${JSON.stringify(fixtureDoc, null, 2)}\n`);
console.log("Synced tests/fixtures/compatibility-matrix.json from authoritative matrix");
