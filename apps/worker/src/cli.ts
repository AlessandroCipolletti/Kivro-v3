#!/usr/bin/env node
import { Command } from "commander";
import { WORKER_COMMANDS } from "@kivro/job-protocol";
import { OpenClawAdapterStub } from "@kivro/openclaw-adapter";

const program = new Command();
program.name("kivro-worker").description("Kivro seller Worker (M00 bootstrap)");

program
  .command("doctor")
  .description("Environment and security prerequisite checks (§57)")
  .action(async () => {
    const adapter = new OpenClawAdapterStub();
    const detection = await adapter.detect();
    const line = detection.installed ? "PASS" : "WARN";
    console.log(JSON.stringify({ check: "openclaw", status: line, detection }, null, 2));
  });

program
  .command("version")
  .description("Worker version")
  .action(() => {
    console.log("0.0.0-m00");
  });

program
  .command("commands")
  .description("List planned Worker commands (§56)")
  .action(() => {
    console.log(WORKER_COMMANDS.join("\n"));
  });

program.parse();
