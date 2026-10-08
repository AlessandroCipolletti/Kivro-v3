export { PROTOCOL_VERSION } from "@kivro/contracts";
export const WORKER_COMMANDS = [
  "doctor",
  "scan",
  "pair",
  "workers",
  "start",
  "stop",
  "logs",
  "version",
  "update",
] as const;
export type WorkerCommand = (typeof WORKER_COMMANDS)[number];
