#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const src = path.join(root, "packages/resilience/fault-injection-matrix.json");
const dest = path.join(root, "tests/fixtures/fault-injection-matrix.json");
fs.writeFileSync(dest, fs.readFileSync(src, "utf8"));
console.log("Synced fault-injection-matrix fixture");
