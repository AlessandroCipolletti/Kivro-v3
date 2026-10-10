export type AgentStepProgress = "COMPLETED" | "RUNNING" | "WAITING" | "SEARCHING_ALTERNATIVE";

/** §514 — buyer-visible progress stays at the step, never the model's reasoning. */
export function agentStepProgressLabel(status: AgentStepProgress): string {
  switch (status) {
    case "COMPLETED":
      return "Completed";
    case "RUNNING":
      return "Running";
    case "WAITING":
      return "Waiting for previous step";
    case "SEARCHING_ALTERNATIVE":
      return "Searching for an available alternative";
  }
}
