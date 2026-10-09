#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const file = path.join(path.resolve(import.meta.dirname, ".."), "spec/COVERAGE.md");
let text = fs.readFileSync(file, "utf8");

const sections = new Set([
  "§237",
  "§238",
  "§239",
  "§240",
  "§241",
  "§242",
  "§243",
  "§244",
  "§245",
  "§246",
  "§247",
  "§248",
  "§249",
  "§250",
  "§251",
  "§252",
  "§253",
  "§254",
  "§255",
  "§256",
  "§257",
  "§258",
  "§259",
  "§260",
  "§261",
  "§262",
  "§263",
  "§264",
  "§265",
  "§266",
  "§267",
  "§268",
  "§269",
  "§270",
  "§271",
  "§272",
  "§273",
  "§274",
  "§275",
  "§276",
]);

const evidence =
  "packages/research-broker, packages/contracts/research-policy.ts, packages/platform-policy/research-ceilings.ts   vitest; scripts/verify-m06-flow.mjs   docs/milestones/M06-manual-validation.md M06";

const browserDeferred =
  "`DEFERRED`   packages/research-broker   ---        cloud/isolated browser research post-MVP (§264); search+fetch MVP M06";

const out = text.split("\n").map((line) => {
  const m = line.match(/(§\d+)\s+/);
  if (!m || !sections.has(m[1]) || !line.includes("`TODO`")) {
    return line;
  }
  if (m[1] === "§264" && (line.includes("PRD-0251") || line.includes("PRD-0252"))) {
    return line.replace(/`TODO`\s+---\s+---\s+---/, browserDeferred);
  }
  return line.replace(/`TODO`\s+---\s+---\s+---/, `\`TESTED\`   ${evidence}`);
});

fs.writeFileSync(file, out.join("\n"));
console.log("Updated COVERAGE for M06 sections");
