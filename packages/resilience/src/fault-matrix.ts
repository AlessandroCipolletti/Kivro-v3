import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export type FaultScenario = {
  id: string;
  name: string;
  assert: string;
};

export function loadFaultInjectionMatrix(): { version: number; scenarios: FaultScenario[] } {
  const matrixPath = path.join(
    path.dirname(fileURLToPath(import.meta.url)),
    "..",
    "fault-injection-matrix.json",
  );
  return JSON.parse(fs.readFileSync(matrixPath, "utf8")) as {
    version: number;
    scenarios: FaultScenario[];
  };
}
