import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { runM23CompositionParityCheck, runM23MandatoryChecks } from "./m23-mandatory-runs.mjs";

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

function readExitHarness(root, file, key) {
  const p = path.join(root, file);
  if (!fs.existsSync(p)) {
    return { pass: false, detail: `missing ${file}` };
  }
  const doc = JSON.parse(fs.readFileSync(p, "utf8"));
  return {
    pass: doc[key] === true,
    detail: `${file} → ${key}=${doc[key]}`,
  };
}

/** M28 — terminal mandatory runs (extends M23 + M24–M27 harness evidence). */
export function runM28MandatoryChecks(root) {
  const checks = [...runM23MandatoryChecks(root), runM23CompositionParityCheck(root)];

  for (const item of [
    { id: "golden-registry", script: "scripts/verify-golden-registry.mjs" },
    { id: "fault-injection-matrix", script: "scripts/verify-fault-injection-matrix.mjs" },
    { id: "unified-release-evidence", script: "scripts/verify-unified-release-evidence.mjs" },
    { id: "release-activation-gate", script: "scripts/verify-release-activation-gate.mjs" },
    { id: "backend-conformance", script: "scripts/run-backend-conformance.mjs" },
    { id: "redis-non-authoritative", script: "scripts/check-redis-non-authoritative.mjs" },
    { id: "isolated-restore-evidence", script: "scripts/verify-isolated-restore-evidence.mjs" },
    { id: "threat-control-evidence", script: "scripts/verify-m28-threat-control-evidence.mjs" },
    {
      id: "dual-control-plane-evidence",
      script: "scripts/verify-m28-dual-control-plane-evidence.mjs",
    },
  ]) {
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

  for (const [id, file, key] of [
    ["m24-exit", "docs/audits/M24-exit-criteria.json", "m24HarnessComplete"],
    ["m25-exit", "docs/audits/M25-exit-criteria.json", "m25HarnessComplete"],
    ["m26-exit", "docs/audits/M26-exit-criteria.json", "m26HarnessComplete"],
    ["m27-exit", "docs/audits/M27-exit-criteria.json", "m27HarnessComplete"],
  ]) {
    const r = readExitHarness(root, file, key);
    checks.push({ id, pass: r.pass, detail: r.detail });
  }

  checks.push({
    id: "threat-model-doc",
    pass: fs.existsSync(path.join(root, "security/THREAT_MODEL.md")),
    detail: "HARD-017 threat→control matrix source",
  });

  checks.push({
    id: "section-milestone-index",
    pass: fs.existsSync(path.join(root, "spec/compliance/section-milestone-index.json")),
    detail: "spec/compliance/section-milestone-index.json",
  });

  return checks;
}
