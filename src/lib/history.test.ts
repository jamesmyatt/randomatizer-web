import { describe as group, expect, it } from 'vitest'
import { dieResult, makeRoll, type DieResult } from './dice'
import { HISTORY_CAPACITY, addToHistory, describe, type HistoryEntry } from './history'
import type { Mode } from './settings'

const entry = (id: number, results: DieResult[], mode: Mode = 'advanced'): HistoryEntry => ({
  id,
  roll: makeRoll(results),
  mode,
})

group('history', () => {
  it('puts the newest entry first', () => {
    const history = addToHistory(
      addToHistory([], entry(1, [dieResult(6, 1)])),
      entry(2, [dieResult(6, 2)]),
    )
    expect(history.map((e) => e.id)).toEqual([2, 1])
  })

  it('drops the oldest entries at capacity', () => {
    let history: HistoryEntry[] = []
    for (let id = 1; id <= 150; id++) history = addToHistory(history, entry(id, [dieResult(4, 1)]))
    expect(history).toHaveLength(HISTORY_CAPACITY)
    expect(history[0]!.id).toBe(150)
    expect(history.at(-1)!.id).toBe(51)
  })

  it('lists values only for basic entries', () => {
    const e = entry(1, [dieResult(6, 4), dieResult(6, 2), dieResult(6, 5)], 'basic')
    expect(describe(e)).toBe('4 · 2 · 5')
  })

  it('groups advanced entries by die type', () => {
    const e = entry(1, [dieResult(20, 14), dieResult(6, 3), dieResult(8, 7), dieResult(6, 5)])
    expect(describe(e)).toBe('[2d6] 3 5 · [d8] 7 · [d20] 14')
  })
})
