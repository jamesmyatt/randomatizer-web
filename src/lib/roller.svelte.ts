import { DiceRoller, selectionDice, type StandardDie } from './dice'
import { addToHistory, type HistoryEntry } from './history'
import { secureRandomSource } from './random'
import {
  DEFAULT_SETTINGS,
  loadSettings,
  saveSettings,
  STORAGE_KEY,
  type AppSettings,
} from './settings'

/**
 * App state: settings (persisted per browser) plus the current roll and session history (memory only).
 *
 * History must never be written to storage.
 */
export class RollerState {
  readonly #roller: DiceRoller
  readonly #storage: () => Storage
  settings: AppSettings = $state.raw(DEFAULT_SETTINGS)
  current: HistoryEntry | null = $state.raw(null)
  #history: HistoryEntry[] = $state.raw([])
  #nextId = 0

  constructor(
    roller = new DiceRoller(secureRandomSource),
    storage: () => Storage = () => localStorage,
  ) {
    this.#roller = roller
    this.#storage = storage
    this.settings = loadSettings(storage)
  }

  /** Session history, newest first. Empty when history is off. */
  get history(): HistoryEntry[] {
    return this.settings.historyEnabled ? this.#history : []
  }

  roll(): void {
    const { mode, basicCount, advancedSelection, historyEnabled } = this.settings
    const dice: StandardDie[] =
      mode === 'basic' ? Array<StandardDie>(basicCount).fill(6) : selectionDice(advancedSelection)
    const entry: HistoryEntry = { id: this.#nextId++, roll: this.#roller.roll(dice), mode }
    this.current = entry
    this.#history = historyEnabled ? addToHistory(this.#history, entry) : []
  }

  clearHistory(): void {
    this.#history = []
  }

  updateSettings(transform: (settings: AppSettings) => AppSettings): void {
    this.#apply(transform(this.settings))
    saveSettings(this.settings, this.#storage)
  }

  /** Picks up settings changed in another tab. */
  reloadSettings(key: string | null): void {
    if (key === STORAGE_KEY || key === null) this.#apply(loadSettings(this.#storage))
  }

  #apply(settings: AppSettings): void {
    this.settings = settings
    // Turning history off discards what is already there.
    if (!settings.historyEnabled) this.clearHistory()
  }
}
