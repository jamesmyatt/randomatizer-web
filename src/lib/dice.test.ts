import { describe, expect, it } from 'vitest'
import {
  DEFAULT_ADVANCED_SELECTION,
  DiceLimits,
  DiceRoller,
  STANDARD_DICE,
  advancedSelection,
  canDecrement,
  canIncrement,
  dieLabel,
  dieResult,
  sanitizedSelection,
  selectionDice,
  selectionSummary,
  selectionTotal,
  withCount,
  type StandardDie,
} from './dice'
import { secureRandomSource, type RandomSource } from './random'
import { seededRandomSource } from './testing'

/** Records every bound requested and returns a scripted value. */
function recordingSource(answer: (bound: number) => number): RandomSource & { bounds: number[] } {
  const bounds: number[] = []
  return {
    bounds,
    nextInt(bound) {
      bounds.push(bound)
      return answer(bound)
    },
  }
}

describe('DiceRoller', () => {
  it('keeps every die within 1 to sides', () => {
    const roller = new DiceRoller(seededRandomSource(42))
    for (const die of STANDARD_DICE) {
      for (let i = 0; i < 10_000; i++) {
        const { value } = roller.rollOne(die)
        expect(value >= 1 && value <= die, `${dieLabel(die)} rolled ${value}`).toBe(true)
      }
    }
  })

  it('asks the source for exactly one value per die using the side count as the bound', () => {
    const source = recordingSource(() => 0)
    new DiceRoller(source).roll(STANDARD_DICE)
    expect(source.bounds).toEqual([...STANDARD_DICE])
  })

  it('maps source extremes to the lowest and highest faces', () => {
    for (const die of STANDARD_DICE) {
      expect(new DiceRoller(recordingSource(() => 0)).rollOne(die).value).toBe(1)
      expect(new DiceRoller(recordingSource((b) => b - 1)).rollOne(die).value).toBe(die)
    }
  })

  it('reaches every face', () => {
    for (const die of STANDARD_DICE) {
      const faces = Array.from(
        { length: die },
        (_, n) => new DiceRoller(recordingSource(() => n)).rollOne(die).value,
      )
      expect(faces).toEqual(Array.from({ length: die }, (_, i) => i + 1))
    }
  })

  it('gives the same rolls for the same seed', () => {
    const dice: StandardDie[] = [
      ...Array<StandardDie>(20).fill(20),
      ...Array<StandardDie>(20).fill(6),
    ]
    expect(new DiceRoller(seededRandomSource(7)).roll(dice)).toEqual(
      new DiceRoller(seededRandomSource(7)).roll(dice),
    )
  })

  it('keeps the order of a mixed roll and totals the results', () => {
    const dice: StandardDie[] = [4, 100, 6, 6]
    const roll = new DiceRoller(seededRandomSource(1)).roll(dice)
    expect(roll.results.map((r) => r.die)).toEqual(dice)
    expect(roll.total).toBe(roll.results.reduce((sum, r) => sum + r.value, 0))
  })

  it('rejects an empty roll', () => {
    expect(() => new DiceRoller(seededRandomSource(1)).roll([])).toThrow(RangeError)
  })

  it('rejects an impossible die result', () => {
    expect(() => dieResult(6, 7)).toThrow(RangeError)
    expect(() => dieResult(6, 0)).toThrow(RangeError)
  })

  it('stays within bounds with the secure source', () => {
    const roller = new DiceRoller(secureRandomSource)
    for (const die of STANDARD_DICE) {
      for (let i = 0; i < 1_000; i++) {
        const { value } = roller.rollOne(die)
        expect(value >= 1 && value <= die).toBe(true)
      }
    }
  })
})

describe('distribution', () => {
  const chiSquared = (counts: number[], expected: number) =>
    counts.reduce((sum, n) => sum + (n - expected) ** 2 / expected, 0)

  /** Wilson–Hilferty approximation of the chi-squared critical value at p = 0.001. */
  const criticalValue = (k: number) => {
    const z = 3.09
    return k * (1 - 2 / (9 * k) + z * Math.sqrt(2 / (9 * k))) ** 3
  }

  it.each([
    ['seeded', seededRandomSource(2026)],
    ['secure', secureRandomSource],
  ] as const)('is uniform for every die (%s source)', (_, source) => {
    const roller = new DiceRoller(source)
    const rollsPerFace = 1_000
    for (const die of STANDARD_DICE) {
      const counts = Array<number>(die).fill(0)
      for (let i = 0; i < die * rollsPerFace; i++) counts[roller.rollOne(die).value - 1]!++
      const statistic = chiSquared(counts, rollsPerFace)
      expect(statistic, `${dieLabel(die)}: chi² = ${statistic}`).toBeLessThan(
        criticalValue(die - 1),
      )
    }
  })
})

describe('AdvancedSelection', () => {
  const selection = advancedSelection({ 20: 1, 6: 2, 8: 1 })

  it('lists dice in standard order in the summary', () => {
    expect(selectionSummary(selection)).toBe('2d6 + d8 + d20')
  })

  it('groups dice in standard order', () => {
    expect(selectionDice(selection)).toEqual([6, 6, 8, 20])
    expect(selectionTotal(selection)).toBe(4)
  })

  it('cannot remove the last die', () => {
    const single = advancedSelection({ 12: 1 })
    expect(canDecrement(single, 12)).toBe(false)
    expect(canDecrement(single, 4)).toBe(false)
    expect(() => withCount(single, 12, 0)).toThrow(RangeError)
  })

  it('cannot exceed the per-die limit', () => {
    const full = advancedSelection({ 6: DiceLimits.ADVANCED_MAX_PER_DIE })
    expect(canIncrement(full, 6)).toBe(false)
    expect(canIncrement(full, 8)).toBe(true)
    expect(() => withCount(full, 6, DiceLimits.ADVANCED_MAX_PER_DIE + 1)).toThrow(RangeError)
  })

  it('clamps counts when sanitized and falls back to the default when empty', () => {
    expect(sanitizedSelection({ 4: 99, 6: -3 })).toEqual(
      advancedSelection({ 4: DiceLimits.ADVANCED_MAX_PER_DIE }),
    )
    expect(sanitizedSelection({})).toEqual(DEFAULT_ADVANCED_SELECTION)
    expect(sanitizedSelection({ 6: 'x', 8: 2.7 })).toEqual(advancedSelection({ 8: 2 }))
  })
})
