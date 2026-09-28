import type { RandomSource } from './random'

/** Standard polyhedral dice, numbered `1..sides`, in standard order. */
export const STANDARD_DICE = [4, 6, 8, 10, 12, 20, 100] as const

/** A standard die, identified by its number of sides. */
export type StandardDie = (typeof STANDARD_DICE)[number]

/** Conventional short name, e.g. "d20". */
export const dieLabel = (die: StandardDie): string => `d${die}`

/** Limits on how many dice can be selected. */
export const DiceLimits = {
  BASIC_MIN: 1,
  BASIC_MAX: 12,
  ADVANCED_MAX_PER_DIE: 12,
} as const

/** The face shown by one die after rolling. */
export interface DieResult {
  readonly die: StandardDie
  readonly value: number
}

/** The results of rolling one or more dice together. */
export interface Roll {
  readonly results: readonly DieResult[]
  readonly total: number
}

export function dieResult(die: StandardDie, value: number): DieResult {
  if (!Number.isInteger(value) || value < 1 || value > die) {
    throw new RangeError(`${value} is not a face of ${dieLabel(die)}`)
  }
  return { die, value }
}

export function makeRoll(results: readonly DieResult[]): Roll {
  if (results.length === 0) throw new RangeError('A roll needs at least one die')
  return { results, total: results.reduce((sum, r) => sum + r.value, 0) }
}

/** Rolls dice using `random`. All roll randomness must go through this class. */
export class DiceRoller {
  constructor(private readonly random: RandomSource) {}

  rollOne(die: StandardDie): DieResult {
    return dieResult(die, this.random.nextInt(die) + 1)
  }

  /** Rolls `dice` together, keeping their order. */
  roll(dice: readonly StandardDie[]): Roll {
    return makeRoll(dice.map((die) => this.rollOne(die)))
  }
}

/** Number of each die to roll in Advanced mode. Always holds at least one die. */
export type AdvancedSelection = Readonly<Record<StandardDie, number>>

const emptyCounts = (): Record<StandardDie, number> =>
  Object.fromEntries(STANDARD_DICE.map((die) => [die, 0])) as Record<StandardDie, number>

export function advancedSelection(counts: Partial<Record<StandardDie, number>>): AdvancedSelection {
  const selection = { ...emptyCounts(), ...counts }
  const values = Object.values(selection)
  if (!values.every((n) => Number.isInteger(n) && n >= 0 && n <= DiceLimits.ADVANCED_MAX_PER_DIE)) {
    throw new RangeError(`Count out of range: ${JSON.stringify(counts)}`)
  }
  if (selectionTotal(selection) === 0)
    throw new RangeError('Selection must contain at least one die')
  return Object.freeze(selection)
}

export const selectionTotal = (selection: AdvancedSelection): number =>
  STANDARD_DICE.reduce((sum, die) => sum + selection[die], 0)

export const canIncrement = (selection: AdvancedSelection, die: StandardDie): boolean =>
  selection[die] < DiceLimits.ADVANCED_MAX_PER_DIE

export const canDecrement = (selection: AdvancedSelection, die: StandardDie): boolean =>
  selection[die] > 0 && selectionTotal(selection) > 1

export const withCount = (
  selection: AdvancedSelection,
  die: StandardDie,
  count: number,
): AdvancedSelection => advancedSelection({ ...selection, [die]: count })

/** The dice to roll, grouped by type in standard order. */
export const selectionDice = (selection: AdvancedSelection): StandardDie[] =>
  STANDARD_DICE.flatMap((die) => Array<StandardDie>(selection[die]).fill(die))

/** Short description such as "2d6 + d8 + d20". */
export const selectionSummary = (selection: AdvancedSelection): string =>
  STANDARD_DICE.filter((die) => selection[die] > 0)
    .map((die) => (selection[die] === 1 ? dieLabel(die) : `${selection[die]}${dieLabel(die)}`))
    .join(' + ')

/** Clamps `counts` into range, falling back to the default if nothing is selected. */
export function sanitizedSelection(
  counts: Partial<Record<StandardDie, unknown>>,
): AdvancedSelection {
  const clamped = emptyCounts()
  for (const die of STANDARD_DICE) {
    const n = counts[die]
    clamped[die] =
      typeof n === 'number' && Number.isFinite(n)
        ? clamp(Math.trunc(n), 0, DiceLimits.ADVANCED_MAX_PER_DIE)
        : 0
  }
  return selectionTotal(clamped) === 0 ? DEFAULT_ADVANCED_SELECTION : advancedSelection(clamped)
}

export const clamp = (value: number, min: number, max: number): number =>
  Math.min(Math.max(value, min), max)

export const DEFAULT_ADVANCED_SELECTION = advancedSelection({ 6: 2 })
