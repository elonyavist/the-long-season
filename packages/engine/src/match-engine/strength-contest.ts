/** Opponent-centred values used when two football departments contest a task. */
export interface StrengthContestPair {
  readonly own: number;
  readonly opponent: number;
}

/**
 * Exposes more or less of a real department gap without changing its midpoint.
 *
 * Team strength remains the raw quality of the selected players. The match
 * reads this pair only where two opposing departments actually meet, so equal
 * teams are unchanged and neither side receives a context-free bonus.
 */
export function strengthContestPair(
  own: number,
  opponent: number,
  gapMultiplier: number,
): StrengthContestPair {
  const midpoint = (own + opponent) / 2;
  const halfGap = (own - opponent) * gapMultiplier / 2;
  return {
    own: midpoint + halfGap,
    opponent: midpoint - halfGap,
  };
}
