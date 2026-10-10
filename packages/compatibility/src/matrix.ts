import matrixJson from "../matrix.json" with { type: "json" };
import type { KivroCompatibilityMatrix } from "./types.js";

export const KIVRO_COMPATIBILITY_MATRIX = matrixJson as KivroCompatibilityMatrix;

export function parseCompatibilityMatrix(raw: unknown): KivroCompatibilityMatrix {
  if (!raw || typeof raw !== "object") {
    throw new Error("Invalid compatibility matrix");
  }
  const m = raw as KivroCompatibilityMatrix;
  if (!m.apiContractVersion || typeof m.workerProtocolMin !== "number") {
    throw new Error("Compatibility matrix missing required version surfaces");
  }
  return m;
}
