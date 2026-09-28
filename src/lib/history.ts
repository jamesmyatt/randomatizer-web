import { STANDARD_DICE, dieLabel, type Roll, type StandardDie } from './dice'
import type { Mode } from './settings'

/** One roll in the session history. `id` is unique within the session. */
export interface HistoryEntry {
  readonly id: number
  readonly roll: Roll
  readonly mode: Mode
}

export const HISTORY_CAPACITY = 100

/**
 * Adds `entry` to the in-memory session history, newest first, dropping the oldest beyond `capacity`.
 *
 * Never persist history: it must not be written to storage.
 */
export const addToHistory = (
  history: readonly HistoryEntry[],
  entry: HistoryEntry,
  capacity: number = HISTORY_CAPACITY,
): HistoryEntry[] => [entry, ...history].slice(0, capacity)

/**
 * Compact description of the dice in an entry, without the total.
 *
 * Basic: "4 · 2 · 5". Advanced: "[2d6] 3 5 · [d8] 7 · [d20] 14".
 */
export function describe(entry: HistoryEntry): string {
  const { results } = entry.roll
  if (entry.mode === 'basic') return results.map((r) => r.value).join(' · ')
  const byDie = new Map<StandardDie, number[]>()
  for (const r of results) byDie.set(r.die, [...(byDie.get(r.die) ?? []), r.value])
  return STANDARD_DICE.filter((die) => byDie.has(die))
    .map((die) => {
      const values = byDie.get(die)!
      const prefix = values.length === 1 ? dieLabel(die) : `${values.length}${dieLabel(die)}`
      return `[${prefix}] ${values.join(' ')}`
    })
    .join(' · ')
}
