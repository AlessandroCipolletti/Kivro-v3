#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const file = path.join(path.resolve(import.meta.dirname, ".."), "spec/COVERAGE.md");
let text = fs.readFileSync(file, "utf8");
const sections = new Set([
  "§192",
  "§193",
  "§194",
  "§195",
  "§196",
  "§197",
  "§198",
  "§199",
  "§200",
  "§201",
  "§202",
  "§203",
  "§204",
  "§205",
  "§206",
  "§207",
  "§208",
  "§209",
  "§210",
  "§211",
  "§212",
  "§213",
  "§214",
  "§215",
  "§216",
]);
const evidence =
  "packages/contracts/capability-io.ts, packages/job-io   vitest; scripts/verify-m05-flow.mjs   docs/milestones/M05-manual-validation.md M05";

const out = text.split("\n").map((line) => {
  const m = line.match(/(§\d+)\s+/);
  if (!m || !sections.has(m[1]) || !line.includes("`TODO`")) {
    return line;
  }
  if (m[1] === "§204" || m[1] === "§205" || m[1] === "§206" || m[1] === "§208") {
    return line.replace(
      /`TODO`\s+---\s+---\s+---/,
      "`PARTIAL`   packages/job-io, apps/api   vitest   API validation; seller UI builder post-M05 M05",
    );
  }
  return line.replace(/`TODO`\s+---\s+---\s+---/, `\`TESTED\`   ${evidence}`);
});

fs.writeFileSync(file, out.join("\n"));
console.log("Updated COVERAGE for M05 sections");
