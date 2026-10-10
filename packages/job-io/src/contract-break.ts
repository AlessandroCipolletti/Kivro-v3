/** §222 — a breaking contract change belongs on a new capability version. */
export type ContractFieldShape = {
  key: string;
  required?: boolean;
  type?: string;
};

export function contractBreakReasons(
  previous: { inputs: ContractFieldShape[]; outputs: ContractFieldShape[] },
  next: { inputs: ContractFieldShape[]; outputs: ContractFieldShape[] },
): string[] {
  const reasons: string[] = [];
  const previousInputs = new Map(previous.inputs.map((field) => [field.key, field]));
  for (const field of next.inputs) {
    const prior = previousInputs.get(field.key);
    if (!prior && field.required) {
      reasons.push(`new required field ${field.key}`);
      continue;
    }
    if (prior && field.type && prior.type && field.type !== prior.type) {
      reasons.push(`input type changed ${field.key}`);
    }
  }
  const previousOutputs = new Map(previous.outputs.map((field) => [field.key, field]));
  for (const field of next.outputs) {
    const prior = previousOutputs.get(field.key);
    if (prior && !prior.required && field.required) {
      reasons.push(`making optional output required ${field.key}`);
    }
  }
  return reasons;
}
