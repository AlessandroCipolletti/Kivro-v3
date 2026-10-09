export { PROTOCOL_VERSION } from "@kivro/contracts";
export { buildJobAcceptedMessage, buildWorkerHeartbeatBody } from "./application.js";
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
  "job",
] as const;
export type WorkerCommand = (typeof WORKER_COMMANDS)[number];
