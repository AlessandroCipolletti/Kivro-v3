import fs from "node:fs";
import path from "node:path";
import { loadCoverageFromRepo } from "./parse-coverage.mjs";

function closedSectionsThroughMilestone(root, maxMilestone) {
  const closed = new Set();
  const plan = fs.readFileSync(path.join(root, "spec/IMPLEMENTATION-PLAN.md"), "utf8");
  for (const chunk of plan.split(/^### M|^## M/m)) {
    const head = chunk.match(/^(\d+)\s/);
    if (!head || Number(head[1]) > maxMilestone) continue;
    for (const sec of chunk.matchAll(/§(\d+)/g)) closed.add(Number(sec[1]));
  }
  return closed;
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
  return (
    /^(apps|packages|docs|scripts|security|tests|\.github)\//.test(t) ||
    t.endsWith(".md") ||
    t.endsWith(".ts")
  );
}

function scheduledTargetMilestone(notes) {
  const m = notes.match(/scheduled:(M\d+|post-MVP)/i);
  return m ? m[1].toUpperCase() : null;
}

function milestoneOrder(m) {
  if (!m || m === "POST-MVP") return 999;
  const n = Number(m.replace(/^M/, ""));
  return Number.isFinite(n) ? n : 999;
}

function pathExists(root, rel) {
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

/**
 * @param {object} input
 * @param {string} input.auditId e.g. M17, M23
 * @param {number} input.maxClosedMilestone inclusive (16 for M17, 22 for M23)
 */
export function runComplianceAudit(input) {
  const root = path.resolve(import.meta.dirname, "../..");
  const rows = loadCoverageFromRepo(root);
  const index = JSON.parse(
    fs.readFileSync(path.join(root, "spec/compliance/section-milestone-index.json"), "utf8"),
  );
  const closedSections = closedSectionsThroughMilestone(root, input.maxClosedMilestone);

  const summary = { TESTED: 0, TODO: 0, PARTIAL: 0, BLOCKED: 0, DEFERRED: 0, IMPLEMENTED: 0 };
  const byPriority = { P0: {}, P1: {}, P2: {} };
  const unexplained = [];
  const invalidTested = [];
  const closedScopeOpen = [];
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
        /scheduled:|post-MVP|M\d{2}|bounded|deferred|IMPLEMENTATION-PLAN|M17|M23/i.test(n);
      if (!ok) unexplained.push(row);
      if (row.priority === "P0" || row.priority === "P1") {
        p0p1Open.push(row);
      }
      if (closedSections.has(row.section) && row.status === "TODO") {
        const sched = scheduledTargetMilestone(row.notes);
        if (sched && milestoneOrder(sched) > input.maxClosedMilestone) {
          continue;
        }
        closedScopeOpen.push(row);
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
      const missing = checkable.filter((p) => !p.includes("*") && !pathExists(root, p));
      if (missing.length > 0) {
        invalidTested.push({ row, reason: `missing paths: ${missing.slice(0, 3).join(", ")}` });
      }
    }
  }

  const sectionRollup = {};
  for (const row of p0p1Open) {
    const key = row.source || `§${row.section}`;
    if (!sectionRollup[key]) {
      sectionRollup[key] = {
        TODO: 0,
        PARTIAL: 0,
        BLOCKED: 0,
        scheduled: index.sectionToMilestone[String(row.section)] ?? "?",
      };
    }
    sectionRollup[key][row.status] += 1;
  }

  const closedLabel = `M00–M${String(input.maxClosedMilestone).padStart(2, "0")}`;

  const report = {
    audit: input.auditId,
    generatedAt: new Date().toISOString(),
    totalRequirements: rows.length,
    summary,
    byPriority,
    maxClosedMilestone: input.maxClosedMilestone,
    closedScopeSectionCount: closedSections.size,
    closedScopeTodoCount: closedScopeOpen.length,
    ...(input.maxClosedMilestone === 16
      ? {
          closedM00M16SectionCount: closedSections.size,
          m00m16TodoCount: closedScopeOpen.length,
        }
      : {}),
    unexplainedCount: unexplained.length,
    invalidTestedCount: invalidTested.length,
    p0p1OpenCount: p0p1Open.length,
    p0OpenCount: rows.filter((r) => r.priority === "P0" && r.status === "TODO").length,
    p1OpenCount: rows.filter((r) => r.priority === "P1" && r.status === "TODO").length,
    p2OpenCount: rows.filter((r) => r.priority === "P2" && r.status === "TODO").length,
    sectionRollupP0P1Open: sectionRollup,
  };

  const auditsDir = path.join(root, "docs/audits");
  fs.mkdirSync(auditsDir, { recursive: true });
  const jsonPath = path.join(auditsDir, `${input.auditId}-compliance-report.json`);
  fs.writeFileSync(jsonPath, `${JSON.stringify(report, null, 2)}\n`);

  const md = [
    `# ${input.auditId} compliance audit snapshot`,
    "",
    `Generated: ${report.generatedAt}`,
    "",
    "## Totals",
    "",
    `- Requirements parsed: **${report.totalRequirements}**`,
    `- TESTED: ${summary.TESTED} · TODO: ${summary.TODO} · PARTIAL: ${summary.PARTIAL} · DEFERRED: ${summary.DEFERRED}`,
    "",
    `## ${closedLabel} closure check`,
    "",
    `- Sections referenced by milestones through M${String(input.maxClosedMilestone).padStart(2, "0")}: ${closedSections.size}`,
    `- TODO rows inside that section set: **${closedScopeOpen.length}** (must be 0)`,
    `- PARTIAL in that set: ${rows.filter((r) => closedSections.has(r.section) && r.status === "PARTIAL").length}`,
    "",
    "## Gate inputs",
    "",
    `- Unexplained TODO/PARTIAL/BLOCKED: **${unexplained.length}**`,
    `- TESTED rows with missing evidence paths: **${invalidTested.length}**`,
    "",
    "## P0/P1 still open (scheduled later)",
    "",
    `See \`docs/audits/${input.auditId}-P0-P1-by-section.md\`.`,
    "",
    `Full machine report: \`docs/audits/${input.auditId}-compliance-report.json\`.`,
    "",
  ].join("\n");

  fs.writeFileSync(path.join(auditsDir, `${input.auditId}-compliance-report.md`), md);

  const bySecLines = Object.entries(sectionRollup)
    .sort((a, b) => b[1].TODO + b[1].PARTIAL - (a[1].TODO + a[1].PARTIAL))
    .slice(0, 100)
    .map(
      ([sec, v]) =>
        `| ${sec} | ${v.scheduled} | ${v.TODO} | ${v.PARTIAL} | ${v.BLOCKED} |`,
    );

  fs.writeFileSync(
    path.join(auditsDir, `${input.auditId}-P0-P1-by-section.md`),
    [
      `# ${input.auditId} — P0/P1 open requirements by section`,
      "",
      "Open = TODO/PARTIAL/BLOCKED with explicit schedule note (post-closure milestones).",
      "",
      "| Section | Target milestone | TODO | PARTIAL | BLOCKED |",
      "|---------|------------------|------|---------|---------|",
      ...bySecLines,
      "",
    ].join("\n"),
  );

  let failed = false;
  if (unexplained.length > 0) {
    console.error(`${input.auditId} audit FAIL: ${unexplained.length} unexplained open requirement(s)`);
    failed = true;
  }
  if (closedScopeOpen.length > 0) {
    console.error(
      `${input.auditId} audit FAIL: ${closedScopeOpen.length} TODO in ${closedLabel} closed sections`,
    );
    for (const r of closedScopeOpen.slice(0, 10)) {
      console.error(`  ${r.id} ${r.source}`);
    }
    failed = true;
  }
  if (invalidTested.length > 0) {
    console.error(
      `${input.auditId} audit FAIL: ${invalidTested.length} TESTED row(s) with missing evidence paths`,
    );
    for (const { row, reason } of invalidTested.slice(0, 5)) {
      console.error(`  ${row.id}: ${reason}`);
    }
    failed = true;
  }

  return {
    failed,
    report,
    summary,
    p0p1OpenCount: p0p1Open.length,
    rows,
  };
}
