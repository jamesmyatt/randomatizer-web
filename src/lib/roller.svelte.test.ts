import { describe, expect, it } from 'vitest'
import { DiceRoller } from './dice'
import { RollerState } from './roller.svelte'
import { STORAGE_KEY } from './settings'
import { memoryStorage, seededRandomSource } from './testing'

const create = (storage = memoryStorage()) => ({
  storage,
  state: new RollerState(new DiceRoller(seededRandomSource(1)), () => storage),
})

describe('RollerState', () => {
  it('rolls the basic dice and records history, newest first', () => {
    const { state } = create()
    state.roll()
    state.roll()
    expect(state.current?.roll.results).toHaveLength(2)
    expect(state.current?.roll.results.every((r) => r.die === 6)).toBe(true)
    expect(state.history.map((e) => e.id)).toEqual([1, 0])
  })

  it('rolls the advanced selection', () => {
    const { state } = create()
    state.updateSettings((s) => ({ ...s, mode: 'advanced' }))
    state.roll()
    expect(state.current?.mode).toBe('advanced')
  })

  it('persists settings but never history', () => {
    const { state, storage } = create()
    state.updateSettings((s) => ({ ...s, basicCount: 6 }))
    state.roll()
    expect(storage.length).toBe(1)
    const stored = storage.getItem(STORAGE_KEY)!
    expect(JSON.parse(stored).basicCount).toBe(6)
    expect(stored).not.toMatch(/history"?\s*:\s*\[|results/)
    expect(create(storage).state.settings.basicCount).toBe(6)
    expect(create(storage).state.history).toEqual([])
  })

  it('discards history when history is turned off and adds no rolls', () => {
    const { state } = create()
    state.roll()
    state.updateSettings((s) => ({ ...s, historyEnabled: false }))
    state.roll()
    state.updateSettings((s) => ({ ...s, historyEnabled: true }))
    expect(state.history).toEqual([])
  })

  it('clears history', () => {
    const { state } = create()
    state.roll()
    state.clearHistory()
    expect(state.history).toEqual([])
    expect(state.current).not.toBeNull()
  })

  it('picks up settings changed in another tab', () => {
    const { state, storage } = create()
    const other = create(storage).state
    other.updateSettings((s) => ({ ...s, themeMode: 'dark' }))
    state.reloadSettings(STORAGE_KEY)
    expect(state.settings.themeMode).toBe('dark')
  })
})
