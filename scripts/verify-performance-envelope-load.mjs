#!/usr/bin/env node
/** M27 — envelope parse + synthetic load suite for both profiles (HARD-019/020). */
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const releaseOps = await import(path.join(root, "packages/release-ops/dist/index.js"));

const envelopePath = path.join(root, "docs/audits/M27-performance-envelope.json");
const raw = JSON.parse(fs.readFileSync(envelopePath, "utf8"));
const envelope = releaseOps.parsePerformanceEnvelope(raw);

const suite = releaseOps.runEnvelopeLoadSuite(envelope);
if (!suite.ok) {
  console.error("Performance envelope load suite failed:", suite.reason);
  process.exit(1);
}

const ceiling = releaseOps.runEnvelopeQueueCeilingSuite(envelope);
if (!ceiling.ok) {
  console.error("Performance envelope queue ceiling suite failed:", ceiling.reason);
  process.exit(1);
}

console.log(
  `Performance envelope load OK (${suite.results.length} profile simulations + queue ceiling within HARD-019)`,
);
