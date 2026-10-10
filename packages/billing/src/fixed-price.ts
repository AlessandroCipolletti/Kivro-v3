/** §232 — MVP price is the published job price. File counts do not multiply it. */
export function mvpJobPriceCents(
  priceSnapshotCents: number,
  _dimensions: { imageCount?: number; durationSeconds?: number; fileBytes?: number } = {},
): number {
  return Math.max(0, Math.floor(priceSnapshotCents));
}
