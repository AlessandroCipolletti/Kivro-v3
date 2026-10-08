import { OpenClawAdapterStub } from "./openclaw-adapter.stub.js";
import { OpenClawCliAdapter } from "./openclaw-cli.adapter.js";
import type { AgentRuntimeAdapter } from "./types.js";

export async function createOpenClawAdapter(): Promise<AgentRuntimeAdapter> {
  const cli = new OpenClawCliAdapter();
  const detection = await cli.detect();
  if (detection.installed) {
    return cli;
  }
  return new OpenClawAdapterStub();
}
