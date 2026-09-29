import { toCss, type Rgb } from './color'
import {
  DEFAULT_ADVANCED_SELECTION,
  DiceLimits,
  STANDARD_DICE,
  advancedSelection,
  clamp,
  sanitizedSelection,
  selectionTotal,
  type AdvancedSelection,
} from './dice'

export type Mode = 'basic' | 'advanced'

/**
 * The dice face color: the app's background or foreground, or a custom color.
 * Pips, numbers and outline are derived from it.
 */
export type DiceFace = 'background' | 'foreground' | 'custom'

/** Light or dark app theme. System follows the browser or OS setting. */
export type ThemeMode = 'system' | 'light' | 'dark'

const MODES: readonly Mode[] = ['basic', 'advanced']
const DICE_FACES: readonly DiceFace[] = ['background', 'foreground', 'custom']
export const THEME_MODES: readonly ThemeMode[] = ['system', 'light', 'dark']

/** Persisted settings, including the last dice selection. Never holds roll results. */
export interface AppSettings {
  readonly mode: Mode
  readonly diceFace: DiceFace
  /** Custom face color, used when `diceFace` is `custom`. */
  readonly customFace: Rgb
  readonly basicCount: number
  readonly advancedSelection: AdvancedSelection
  readonly selectionExpanded: boolean
  readonly historyExpanded: boolean
  /** Show the total on the main screen and in the history. */
  readonly showTotal: boolean
  /** Keep a session history of rolls. When off, the history is discarded and no rolls are added. */
  readonly historyEnabled: boolean
  readonly themeMode: ThemeMode
}

export const DEFAULT_CUSTOM_FACE: Rgb = 0xd32f2f

export const DEFAULT_SETTINGS: AppSettings = Object.freeze({
  mode: 'basic',
  diceFace: 'background',
  customFace: DEFAULT_CUSTOM_FACE,
  basicCount: 2,
  advancedSelection: DEFAULT_ADVANCED_SELECTION,
  selectionExpanded: true,
  historyExpanded: true,
  showTotal: true,
  historyEnabled: true,
  themeMode: 'system',
})

/**
 * Switches mode, carrying the dice over: Basic to Advanced keeps the same d6s;
 * Advanced to Basic keeps the number of dice, up to the Basic maximum.
 */
export function withMode(settings: AppSettings, mode: Mode): AppSettings {
  if (mode === settings.mode) return settings
  if (mode === 'advanced') {
    return { ...settings, mode, advancedSelection: advancedSelection({ 6: settings.basicCount }) }
  }
  return {
    ...settings,
    mode,
    basicCount: clamp(
      selectionTotal(settings.advancedSelection),
      DiceLimits.BASIC_MIN,
      DiceLimits.BASIC_MAX,
    ),
  }
}

/** Key in `localStorage`. Only settings are stored: never roll results or history. */
export const STORAGE_KEY = 'randomatizer:settings'

/** Stored form of {@link AppSettings}. */
interface StoredSettings {
  mode: Mode
  diceFace: DiceFace
  customFace: string
  basicCount: number
  advancedCounts: Record<string, number>
  selectionExpanded: boolean
  historyExpanded: boolean
  showTotal: boolean
  historyEnabled: boolean
  themeMode: ThemeMode
}

export function serializeSettings({
  customFace,
  advancedSelection: selection,
  ...rest
}: AppSettings): string {
  const stored: StoredSettings = {
    ...rest,
    customFace: toCss(customFace),
    advancedCounts: Object.fromEntries(STANDARD_DICE.map((die) => [`d${die}`, selection[die]])),
  }
  return JSON.stringify(stored)
}

/** Reads stored settings, replacing missing or invalid values with defaults. */
export function parseSettings(json: string | null): AppSettings {
  let raw: unknown = null
  try {
    raw = json === null ? null : JSON.parse(json)
  } catch {
    // Corrupt: use defaults.
  }
  const stored: Partial<Record<keyof StoredSettings, unknown>> =
    raw !== null && typeof raw === 'object' ? raw : {}
  const d = DEFAULT_SETTINGS
  const oneOf = <T>(values: readonly T[], value: unknown, fallback: T): T =>
    values.includes(value as T) ? (value as T) : fallback
  const bool = (value: unknown, fallback: boolean) =>
    typeof value === 'boolean' ? value : fallback
  const counts = stored.advancedCounts
  return {
    mode: oneOf(MODES, stored.mode, d.mode),
    diceFace: oneOf(DICE_FACES, stored.diceFace, d.diceFace),
    customFace:
      typeof stored.customFace === 'string' && /^#[0-9a-f]{6}$/i.test(stored.customFace)
        ? parseInt(stored.customFace.slice(1), 16)
        : d.customFace,
    basicCount:
      typeof stored.basicCount === 'number' && Number.isFinite(stored.basicCount)
        ? clamp(Math.trunc(stored.basicCount), DiceLimits.BASIC_MIN, DiceLimits.BASIC_MAX)
        : d.basicCount,
    advancedSelection:
      counts !== null && typeof counts === 'object'
        ? sanitizedSelection(
            Object.fromEntries(
              STANDARD_DICE.map((die) => [die, (counts as Record<string, unknown>)[`d${die}`]]),
            ),
          )
        : d.advancedSelection,
    selectionExpanded: bool(stored.selectionExpanded, d.selectionExpanded),
    historyExpanded: bool(stored.historyExpanded, d.historyExpanded),
    showTotal: bool(stored.showTotal, d.showTotal),
    historyEnabled: bool(stored.historyEnabled, d.historyEnabled),
    themeMode: oneOf(THEME_MODES, stored.themeMode, d.themeMode),
  }
}

/** Loads settings from `storage`, falling back to defaults if storage is unavailable. */
export function loadSettings(storage: () => Storage = () => localStorage): AppSettings {
  try {
    return parseSettings(storage().getItem(STORAGE_KEY))
  } catch {
    return DEFAULT_SETTINGS
  }
}

/** Saves settings to `storage`. Ignores failures (private mode, quota, blocked storage). */
export function saveSettings(
  settings: AppSettings,
  storage: () => Storage = () => localStorage,
): void {
  try {
    storage().setItem(STORAGE_KEY, serializeSettings(settings))
  } catch {
    // Settings then last only for this page load.
  }
}
