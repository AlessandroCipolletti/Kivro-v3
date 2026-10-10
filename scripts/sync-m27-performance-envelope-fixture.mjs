#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const source = path.join(root, "docs/audits/M27-performance-envelope.json");
const dest = path.join(root, "tests/fixtures/m27-performance-envelope.json");
fs.copyFileSync(source, dest);
console.log("Synced tests/fixtures/m27-performance-envelope.json");
