const FORBIDDEN_PROGRESS_KEYS = /secret|password|token|api[_-]?key|private|credential|chain/i;

/** BUYERUX-009/010 — buyer-safe progress stages only. */
export function sanitizeBuyerProgressCheckpoints(
  checkpoints: Array<{ stageLabel: string; recordedAt: Date; payload?: unknown }>,
): Array<{ stageLabel: string; recordedAt: string }> {
  return checkpoints
    .filter((cp) => !FORBIDDEN_PROGRESS_KEYS.test(cp.stageLabel))
    .map((cp) => ({
      stageLabel: cp.stageLabel.slice(0, 120),
      recordedAt: cp.recordedAt.toISOString(),
    }));
}
