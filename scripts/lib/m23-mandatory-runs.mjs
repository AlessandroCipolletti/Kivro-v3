import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

function runScript(root, rel) {
  const started = Date.now();
  const res = spawnSync("node", [rel], { cwd: root, stdio: "pipe", encoding: "utf8" });
  return {
    script: rel,
    pass: res.status === 0,
    durationMs: Date.now() - started,
    stderr: res.stderr?.slice(0, 500) ?? "",
    stdout: res.stdout?.slice(0, 200) ?? "",
  };
}

/** IMPLEMENTATION-PLAN M23 — automatable mandatory audit runs (direct evidence, not COVERAGE claims). */
export function runM23MandatoryChecks(root) {
  const checks = [];

  checks.push({
    id: "single-migration-history",
    pass:
      fs.existsSync(path.join(root, "packages/database/prisma/schema.prisma")) &&
      fs.readdirSync(path.join(root, "packages/database/prisma/migrations")).some((f) =>
        /^\d/.test(f),
      ),
    detail: "packages/database/prisma/migrations",
  });

  checks.push({
    id: "shared-api-contract-source",
    pass: fs.existsSync(path.join(root, "packages/contracts/src/index.ts")),
    detail: "packages/contracts single public contract package",
  });

  const scripted = [
    { id: "architecture-deps", script: "scripts/check-architecture.mjs" },
    { id: "composition-thinness", script: "scripts/check-composition-thinness.mjs" },
    { id: "no-bullmq-production", script: "scripts/check-no-bullmq-production.mjs" },
    { id: "api-contract-mvp", script: "scripts/verify-api-contract-mvp.mjs" },
    { id: "security-release-gate-files", script: "scripts/verify-release-gate-evidence.mjs" },
  ];

  for (const item of scripted) {
    if (!fs.existsSync(path.join(root, item.script))) {
      checks.push({ id: item.id, pass: false, detail: `missing ${item.script}` });
      continue;
    }
    const run = runScript(root, item.script);
    checks.push({
      id: item.id,
      pass: run.pass,
      detail: run.pass ? item.script : `${item.script}: ${run.stderr || run.stdout}`,
    });
  }

  return checks;
}

export function runM23CompositionParityCheck(root) {
  if (!fs.existsSync(path.join(root, "apps/api/dist/cloud-composition.js"))) {
    return {
      id: "both-composition-roots",
      pass: false,
      detail: "apps/api/dist not built — run verify:m19 build first",
    };
  }
  const run = runScript(root, "scripts/verify-both-composition-roots.mjs");
  return {
    id: "both-composition-roots",
    pass: run.pass,
    detail: run.pass ? "verify-both-composition-roots.mjs" : run.stderr || run.stdout,
  };
}
