#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { loadCoverageFromRepo } from "./lib/parse-coverage.mjs";

const root = path.resolve(import.meta.dirname, "..");
const rows = loadCoverageFromRepo(root);
const index = JSON.parse(
  fs.readFileSync(path.join(root, "spec/compliance/section-milestone-index.json"), "utf8"),
);

const closedM00M16 = new Set();
const plan = fs.readFileSync(path.join(root, "spec/IMPLEMENTATION-PLAN.md"), "utf8");
for (const chunk of plan.split(/^### M|^## M/m)) {
  const head = chunk.match(/^(\d+)\s/);
  if (!head || Number(head[1]) > 16) continue;
  for (const sec of chunk.matchAll(/§(\d+)/g)) closedM00M16.add(Number(sec[1]));
}

function evidencePaths(cell) {
  if (!cell || cell === "---") return [];
  return cell
    .split(/[,;]/)
    .map((s) => s.trim())
    .filter(Boolean);
}

const EVIDENCE_SKIP = new Set([
  "vitest",
  "prisma",
  "pnpm",
  "---",
  "post-MVP",
  "security/tests",
]);

function looksLikeRepoPath(token) {
  const t = token.split(/\s+/)[0];
  if (EVIDENCE_SKIP.has(t)) return false;
  return /^(apps|packages|docs|scripts|security|tests|\.github)\//.test(t) || t.endsWith(".md") || t.endsWith(".ts");
}

function pathExists(rel) {
  const token = rel.split(/\s+/)[0];
  const candidates = [token];
  const pkgFile = token.match(/^packages\/([^/]+)\/([^/]+\.(ts|tsx|mjs|md))$/);
  if (pkgFile) {
    candidates.push(`packages/${pkgFile[1]}/src/${pkgFile[2]}`);
  }
  const apiRoute = token.match(/^apps\/api\/routes\/(.+)$/);
  if (apiRoute) {
    candidates.push(`apps/api/src/routes/${apiRoute[1]}`);
  }
  if (token === "apps/api/server.ts") {
    candidates.push("apps/api/src/server.ts");
  }
  if (/^packages\/[^/]+$/.test(token)) {
    candidates.push(`${token}/package.json`);
  }
  if (/^apps\/[^/]+$/.test(token)) {
    candidates.push(`${token}/package.json`);
  }
  return candidates.some((c) => fs.existsSync(path.join(root, c)));
}

const summary = { TESTED: 0, TODO: 0, PARTIAL: 0, BLOCKED: 0, DEFERRED: 0, IMPLEMENTED: 0 };
const byPriority = { P0: {}, P1: {}, P2: {} };
const unexplained = [];
const invalidTested = [];
const m00m16Open = [];
const p0p1Open = [];

for (const row of rows) {
  summary[row.status] = (summary[row.status] ?? 0) + 1;
  byPriority[row.priority][row.status] = (byPriority[row.priority][row.status] ?? 0) + 1;

  if (["TODO", "PARTIAL", "BLOCKED"].includes(row.status)) {
    const n = row.notes.trim();
    const ok =
      n &&
      n !== "---" &&
      !/^§\d+$/.test(n) &&
      /scheduled:|post-MVP|M\d{2}|bounded|deferred|IMPLEMENTATION-PLAN|M17/i.test(n);
    if (!ok) unexplained.push(row);
    if (row.priority === "P0" || row.priority === "P1") {
      p0p1Open.push(row);
    }
    if (closedM00M16.has(row.section) && row.status === "TODO") {
      m00m16Open.push(row);
    }
  }

  if (row.status === "TESTED") {
    const impl = evidencePaths(row.implementation);
    const tests = evidencePaths(row.tests);
    if (impl.length === 0 && tests.length === 0) {
      invalidTested.push({ row, reason: "missing evidence cells" });
      continue;
    }
    const checkable = [...impl, ...tests].filter((p) => looksLikeRepoPath(p));
    if (checkable.length === 0) continue;
    const missing = checkable.filter((p) => !p.includes("*") && !pathExists(p));
    if (missing.length > 0) {
      invalidTested.push({ row, reason: `missing paths: ${missing.slice(0, 3).join(", ")}` });
    }
  }
}

const sectionRollup = {};
for (const row of p0p1Open) {
  const key = row.source || `§${row.section}`;
  if (!sectionRollup[key]) {
    sectionRollup[key] = { TODO: 0, PARTIAL: 0, BLOCKED: 0, scheduled: index.sectionToMilestone[String(row.section)] ?? "?" };
  }
  sectionRollup[key][row.status] += 1;
}

const report = {
  audit: "M17",
  generatedAt: new Date().toISOString(),
  totalRequirements: rows.length,
  summary,
  byPriority,
  closedM00M16SectionCount: closedM00M16.size,
  m00m16TodoCount: m00m16Open.length,
  unexplainedCount: unexplained.length,
  invalidTestedCount: invalidTested.length,
  p0p1OpenCount: p0p1Open.length,
  sectionRollupP0P1Open: sectionRollup,
};

const auditsDir = path.join(root, "docs/audits");
fs.mkdirSync(auditsDir, { recursive: true });
fs.writeFileSync(path.join(auditsDir, "M17-compliance-report.json"), `${JSON.stringify(report, null, 2)}\n`);

const md = [
  "# M17 compliance audit snapshot",
  "",
  `Generated: ${report.generatedAt}`,
  "",
  "## Totals",
  "",
  `- Requirements parsed: **${report.totalRequirements}**`,
  `- TESTED: ${summary.TESTED} · TODO: ${summary.TODO} · PARTIAL: ${summary.PARTIAL} · DEFERRED: ${summary.DEFERRED}`,
  "",
  "## M00–M16 closure check",
  "",
  `- Sections owned by milestones M00–M16: ${closedM00M16.size}`,
  `- TODO rows inside that section set: **${m00m16Open.length}** (must be 0)`,
  `- PARTIAL in that set: ${rows.filter((r) => closedM00M16.has(r.section) && r.status === "PARTIAL").length} (documented in milestone closures)`,
  "",
  "## Gate inputs",
  "",
  `- Unexplained TODO/PARTIAL/BLOCKED (missing schedule note): **${unexplained.length}**`,
  `- TESTED rows with missing evidence paths: **${invalidTested.length}**`,
  "",
  "## P0/P1 still open (scheduled to later milestones)",
  "",
  "See `docs/audits/M17-P0-P1-by-section.md` for the section rollup.",
  "",
  "Full machine report: `docs/audits/M17-compliance-report.json`.",
  "",
].join("\n");

fs.writeFileSync(path.join(auditsDir, "M17-compliance-report.md"), md);

const bySecLines = Object.entries(sectionRollup)
  .sort((a, b) => b[1].TODO + b[1].PARTIAL - (a[1].TODO + a[1].PARTIAL))
  .slice(0, 80)
  .map(
    ([sec, v]) =>
      `| ${sec} | ${v.scheduled} | ${v.TODO} | ${v.PARTIAL} | ${v.BLOCKED} |`,
  );

fs.writeFileSync(
  path.join(auditsDir, "M17-P0-P1-by-section.md"),
  [
    "# M17 — P0/P1 open requirements by section",
    "",
    "Open here means status TODO/PARTIAL/BLOCKED with an explicit **scheduled:Mxx** note (post-M17 work).",
    "",
    "| Section | Target milestone | TODO | PARTIAL | BLOCKED |",
    "|---------|------------------|------|---------|---------|",
    ...bySecLines,
    "",
  ].join("\n"),
);

let failed = false;
if (unexplained.length > 0) {
  console.error(`M17 audit FAIL: ${unexplained.length} unexplained open requirement(s)`);
  failed = true;
}
if (m00m16Open.length > 0) {
  console.error(`M17 audit FAIL: ${m00m16Open.length} TODO in M00–M16 closed sections`);
  for (const r of m00m16Open.slice(0, 10)) {
    console.error(`  ${r.id} ${r.source}`);
  }
  failed = true;
}
if (invalidTested.length > 0) {
  console.error(`M17 audit FAIL: ${invalidTested.length} TESTED row(s) with missing evidence paths`);
  for (const { row, reason } of invalidTested.slice(0, 5)) {
    console.error(`  ${row.id}: ${reason}`);
  }
  failed = true;
}

if (failed) process.exit(1);
console.log(
  `M17 audit OK — ${rows.length} requirements accounted (${summary.TESTED} TESTED, ${p0p1Open.length} P0/P1 scheduled open)`,
);
