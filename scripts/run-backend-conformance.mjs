#!/usr/bin/env node
/** ARCH-UNI-009 — execute provider-neutral conformance against both composition roots. */
import { spawnSync } from "node:child_process";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");

const res = spawnSync(
  "pnpm",
  [
    "exec",
    "vitest",
    "run",
    "packages/worker-transport/src/conformance.test.ts",
    "security/tests/acceptance-m19.test.ts",
  ],
  { cwd: root, stdio: "inherit" },
);
process.exit(res.status ?? 1);
