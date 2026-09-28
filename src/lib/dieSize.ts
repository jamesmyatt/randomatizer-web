/** Gap between dice, horizontally and vertically, in CSS px. */
export const DIE_SPACING = 20

/** Smallest die: 4 across a typical phone (~412 px wide). More dice wrap onto further rows. */
export const MIN_DIE_SIZE = 75

/** Largest die: about 2 across a typical phone. */
export const MAX_DIE_SIZE = 152

/**
 * Size of each die so that `count` dice fill `availableWidth` in one row, clamped to
 * {@link MIN_DIE_SIZE}..{@link MAX_DIE_SIZE}. Depends only on the number of dice, not the mode.
 */
export function dieSize(availableWidth: number, count: number): number {
  if (count <= 0) throw new RangeError('Need at least one die')
  // Whole px, with 1 px of slack, so subpixel rounding never pushes the last die onto a new row.
  const fit = Math.floor((availableWidth - DIE_SPACING * (count - 1) - 1) / count)
  return Math.min(Math.max(fit, MIN_DIE_SIZE), MAX_DIE_SIZE)
}
