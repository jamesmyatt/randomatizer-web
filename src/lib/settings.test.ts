import { describe, expect, it } from 'vitest'
import { DEFAULT_ADVANCED_SELECTION, DiceLimits, advancedSelection } from './dice'
import {
  DEFAULT_CUSTOM_FACE,
  DEFAULT_SETTINGS,
  STORAGE_KEY,
  loadSettings,
  parseSettings,
  saveSettings,
  serializeSettings,
  withMode,
  type AppSettings,
} from './settings'
import { memoryStorage } from './testing'

describe('stored settings', () => {
  it('give defaults when missing or corrupt', () => {
    expect(parseSettings(null)).toEqual(DEFAULT_SETTINGS)
    expect(parseSettings('{not json')).toEqual(DEFAULT_SETTINGS)
    expect(parseSettings('42')).toEqual(DEFAULT_SETTINGS)
  })

  it('survive a round trip', () => {
    const settings: AppSettings = {
      mode: 'advanced',
      diceFace: 'custom',
      customFace: 0x0d47a1,
      basicCount: 7,
      advancedSelection: advancedSelection({ 20: 1, 100: 3 }),
      selectionExpanded: false,
      historyExpanded: false,
      showTotal: false,
      historyEnabled: false,
      themeMode: 'dark',
    }
    expect(parseSettings(serializeSettings(settings))).toEqual(settings)
  })

  it('fall back to safe values when invalid', () => {
    const settings = parseSettings(
      JSON.stringify({
        mode: 'Nonsense',
        themeMode: 'Nonsense',
        basicCount: 99,
        diceFace: 'Nonsense',
        customFace: '#80ff0000',
        advancedCounts: { d6: 0 },
        showTotal: 'yes',
      }),
    )
    expect(settings.mode).toBe('basic')
    expect(settings.themeMode).toBe('system')
    expect(settings.basicCount).toBe(DiceLimits.BASIC_MAX)
    expect(settings.diceFace).toBe('background')
    expect(settings.customFace).toBe(DEFAULT_CUSTOM_FACE)
    expect(settings.advancedSelection).toEqual(DEFAULT_ADVANCED_SELECTION)
    expect(settings.showTotal).toBe(true)
  })

  it('are saved and loaded under one key', () => {
    const storage = memoryStorage()
    const settings = { ...DEFAULT_SETTINGS, basicCount: 5 }
    saveSettings(settings, () => storage)
    expect(storage.length).toBe(1)
    expect(storage.getItem(STORAGE_KEY)).not.toBeNull()
    expect(loadSettings(() => storage)).toEqual(settings)
  })

  it('fall back to defaults when storage is unavailable', () => {
    const blocked = () => {
      throw new DOMException('Blocked', 'SecurityError')
    }
    expect(loadSettings(blocked)).toEqual(DEFAULT_SETTINGS)
    expect(() => saveSettings(DEFAULT_SETTINGS, blocked)).not.toThrow()
  })
})

describe('withMode', () => {
  it('keeps the same d6s from basic to advanced', () => {
    const advanced = withMode({ ...DEFAULT_SETTINGS, mode: 'basic', basicCount: 4 }, 'advanced')
    expect(advanced.mode).toBe('advanced')
    expect(advanced.advancedSelection).toEqual(advancedSelection({ 6: 4 }))
  })

  it('keeps the number of dice up to the basic maximum from advanced to basic', () => {
    const mixed = {
      ...DEFAULT_SETTINGS,
      mode: 'advanced' as const,
      advancedSelection: advancedSelection({ 4: 1, 20: 2 }),
    }
    expect(withMode(mixed, 'basic').basicCount).toBe(3)
    const many = { ...mixed, advancedSelection: advancedSelection({ 6: 12, 8: 5 }) }
    expect(withMode(many, 'basic').basicCount).toBe(DiceLimits.BASIC_MAX)
  })

  it('changes nothing when switching to the same mode', () => {
    const settings = { ...DEFAULT_SETTINGS, basicCount: 5 }
    expect(withMode(settings, 'basic')).toBe(settings)
  })
})
