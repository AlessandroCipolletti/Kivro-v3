#!/usr/bin/env node
import fs from "node:fs";

/**
 * Parse spec/COVERAGE.md into normalized requirement records.
 */
export function parseCoverage(markdown) {
  const rows = [];
  const lines = markdown.split("\n");

  for (const line of lines) {
    const main = line.match(
      /^\s*`([A-Z]+-\d+)`\s+(P[012])\s+(§\d+)\s+`(TODO|TESTED|PARTIAL|BLOCKED|DEFERRED|IMPLEMENTED)`\s+([^\s]+)\s+([^\s]+)\s+(.*)$/,
    );
    if (main) {
      rows.push({
        id: main[1],
        priority: main[2],
        source: main[3],
        section: Number(main[3].slice(1)),
        status: main[4],
        implementation: main[5],
        tests: main[6],
        notes: main[7].trim(),
        line,
      });
      continue;
    }

    const compact = line.match(
      /^\s*([A-Z][A-Z0-9-]+-\d+)\s+(P[012])\s+(TODO|TESTED|PARTIAL|BLOCKED|DEFERRED|IMPLEMENTED)\s+(\S+)\s+(\S+)\s+(.*)$/,
    );
    if (compact && !line.includes("Requirement")) {
      const notes = compact[6].trim();
      const secMatch = notes.match(/§(\d+)/);
      rows.push({
        id: compact[1],
        priority: compact[2],
        source: secMatch ? `§${secMatch[1]}` : "",
        section: secMatch ? Number(secMatch[1]) : inferSectionFromId(compact[1]),
        status: compact[3],
        implementation: compact[4],
        tests: compact[5],
        notes: notes.replace(/§\d+\s*/, "").trim() || notes,
        line,
      });
    }
  }

  return rows;
}

function inferSectionFromId(id) {
  if (id.startsWith("DEV-LOCAL-")) return 551;
  if (id.startsWith("AUTH-")) return 574;
  if (id.startsWith("HOST-NET-")) return 581;
  if (id.startsWith("PORT-")) return 608;
  if (id.startsWith("ARCH-UNI-")) return 608;
  return 0;
}

export function loadCoverageFromRepo(root) {
  const text = fs.readFileSync(`${root}/spec/COVERAGE.md`, "utf8");
  return parseCoverage(text);
}
