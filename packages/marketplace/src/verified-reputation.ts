/** §153 — reputation comes from completed paid jobs, not unverified claims. */
export function verifiedReputation(
  reviews: Array<{ stars: number; fromCompletedJob: boolean }>,
): { average: number | null; count: number } {
  const verified = reviews.filter((review) => review.fromCompletedJob && review.stars >= 1 && review.stars <= 5);
  if (verified.length === 0) {
    return { average: null, count: 0 };
  }
  const total = verified.reduce((sum, review) => sum + review.stars, 0);
  return { average: Math.round((total / verified.length) * 10) / 10, count: verified.length };
}
