/** §220 — file size is platform telemetry. It does not change the buyer price. */
export function platformStorageTelemetry(input: {
  inputBytes: number;
  outputBytes: number;
  retentionDays: number;
}): {
  inputBytes: number;
  outputBytes: number;
  storageByteDays: number;
  buyerChargeCents: 0;
} {
  const inputBytes = Math.max(0, Math.floor(input.inputBytes));
  const outputBytes = Math.max(0, Math.floor(input.outputBytes));
  const days = Math.max(0, input.retentionDays);
  return {
    inputBytes,
    outputBytes,
    storageByteDays: (inputBytes + outputBytes) * days,
    buyerChargeCents: 0,
  };
}
