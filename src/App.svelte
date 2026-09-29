<script lang="ts">
  import { untrack } from 'svelte'
  import { MediaQuery } from 'svelte/reactivity'
  import HistoryPanel from './components/HistoryPanel.svelte'
  import Icon from './components/Icon.svelte'
  import SelectionPanel from './components/SelectionPanel.svelte'
  import SettingsDialog from './components/SettingsDialog.svelte'
  import Die from './components/Die.svelte'
  import { dieStyle, toCss } from './lib/color'
  import { selectionTotal, type DieResult } from './lib/dice'
  import { DIE_SPACING, dieSize } from './lib/dieSize'
  import type { HistoryEntry } from './lib/history'
  import { RollerState } from './lib/roller.svelte'
  import { DARK, LIGHT, cssVariables } from './lib/theme'

  const ROLL_FRAMES = 7
  const ROLL_FRAME_MS = 40

  const roller = new RollerState()
  const settings = $derived(roller.settings)
  const update = roller.updateSettings.bind(roller)

  let settingsOpen = $state(false)

  const prefersDark = new MediaQuery('(prefers-color-scheme: dark)')
  const reducedMotion = new MediaQuery('(prefers-reduced-motion: reduce)')
  const dark = $derived(
    settings.themeMode === 'dark' || (settings.themeMode === 'system' && prefersDark.current),
  )
  const scheme = $derived(dark ? DARK : LIGHT)
  const style = $derived(
    dieStyle(settings.diceFace, settings.customFace, scheme.surface, scheme.onSurface),
  )

  $effect.pre(() => {
    const root = document.documentElement
    for (const [name, value] of cssVariables(scheme)) root.style.setProperty(name, value)
    root.style.colorScheme = dark ? 'dark' : 'light'
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute('content', toCss(scheme.surface))
  })

  // Roll animation: random faces briefly before the real result. Cosmetic only, so it uses Math.random.
  let faces: DieResult[] = $state.raw([])
  let settledId = $state(-1)
  const animating = $derived(roller.current !== null && roller.current.id !== settledId)

  const randomFaces = (entry: HistoryEntry): DieResult[] =>
    entry.roll.results.map(({ die }) => ({ die, value: 1 + Math.floor(Math.random() * die) }))

  $effect(() => {
    const entry = roller.current
    if (entry === null) return
    if (untrack(() => reducedMotion.current)) {
      settledId = entry.id
      return
    }
    let frame = 0
    faces = randomFaces(entry)
    const timer = setInterval(() => {
      if (++frame < ROLL_FRAMES) {
        faces = randomFaces(entry)
      } else {
        clearInterval(timer)
        settledId = entry.id
      }
    }, ROLL_FRAME_MS)
    return () => clearInterval(timer)
  })

  const results = $derived(animating ? faces : roller.current?.roll.results)
  // Hide the newest history row until its roll animation has finished.
  const history = $derived(
    animating ? roller.history.filter((e) => e.id !== roller.current?.id) : roller.history,
  )
  const total = $derived(results?.reduce((sum, r) => sum + r.value, 0))

  let diceWidth = $state(0)
  const size = $derived(results?.length ? dieSize(diceWidth, results.length) : 0)

  const rollLabel = $derived.by(() => {
    if (settings.mode === 'basic') return 'Roll'
    const n = selectionTotal(settings.advancedSelection)
    return `Roll ${n} ${n === 1 ? 'die' : 'dice'}`
  })
</script>

<svelte:window onstorage={(e) => roller.reloadSettings(e.key)} />

<div class="app" class:history-expanded={settings.historyExpanded && history.length > 0}>
  <header class="top-bar">
    <h1>Randomatizer Web</h1>
    <button
      type="button"
      class="icon"
      aria-label="Settings"
      title="Settings"
      aria-haspopup="dialog"
      onclick={() => (settingsOpen = true)}
    >
      <Icon name="settings" />
    </button>
  </header>

  <main>
    <SelectionPanel {settings} onupdate={update} />

    <div class="dice-area">
      <div class="dice" bind:clientWidth={diceWidth} style:--gap="{DIE_SPACING}px">
        {#if results}
          {#each results as result, i (i)}
            {#if roller.current?.mode === 'basic'}
              <Die die={result.die} value={result.value} {style} {size} pips />
            {:else}
              <figure>
                <Die die={result.die} value={result.value} {style} {size} />
                <figcaption aria-hidden="true">d{result.die}</figcaption>
              </figure>
            {/if}
          {/each}
        {:else}
          <p class="ready">Ready to roll</p>
        {/if}
      </div>
    </div>

    {#if settings.showTotal}
      <div class="total">
        <span class="total-label">Total</span>
        <output class="total-value" aria-live="polite">{animating ? '' : (total ?? '–')}</output>
      </div>
    {/if}

    <button type="button" class="roll" onclick={() => roller.roll()}>{rollLabel}</button>
  </main>

  {#if history.length > 0}
    <HistoryPanel
      {history}
      expanded={settings.historyExpanded}
      showTotal={settings.showTotal}
      ontoggle={() => update((s) => ({ ...s, historyExpanded: !s.historyExpanded }))}
      onclear={() => roller.clearHistory()}
    />
  {/if}
</div>

<SettingsDialog bind:open={settingsOpen} {settings} {scheme} onupdate={update} />

<style>
  .app {
    display: flex;
    flex-direction: column;
    max-width: 720px;
    height: 100dvh;
    margin: 0 auto;
  }

  .top-bar {
    display: flex;
    flex: none;
    align-items: center;
    justify-content: space-between;
    height: 64px;
    padding: 0 4px 0 16px;
  }

  h1 {
    margin: 0;
    font-size: 1.375rem;
    font-weight: 400;
  }

  .icon {
    display: grid;
    place-items: center;
    width: 48px;
    height: 48px;
    border-radius: 50%;
    color: var(--on-surface-variant);
  }

  /* Main gets the space above collapsed history. Expanded history fills the space below main,
     which is capped at 60% of the height (and scrolls) so the history always has room. */
  main {
    flex: 1 1 auto;
    min-height: 0;
    overflow-y: auto;
  }

  .history-expanded main {
    flex: 0 1 auto;
    max-height: 60%;
  }

  .history-expanded :global(.history) {
    flex: 1 1 0;
  }

  .dice-area {
    padding: 16px 24px;
  }

  .dice {
    display: flex;
    flex-wrap: wrap;
    align-items: flex-start;
    justify-content: center;
    gap: var(--gap);
  }

  figure {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
    margin: 0;
  }

  figcaption {
    color: var(--on-surface-variant);
    font-size: 0.875rem;
    font-weight: 500;
  }

  .ready {
    width: 100%;
    margin: 0;
    padding: 48px 0;
    color: var(--on-surface-variant);
    text-align: center;
  }

  .total {
    display: flex;
    align-items: baseline;
    justify-content: center;
    gap: 12px;
  }

  .total-label {
    color: var(--on-surface-variant);
    font-weight: 500;
  }

  .total-value {
    min-width: 1ch;
    font-size: 2.25rem;
    font-weight: 600;
    font-variant-numeric: tabular-nums;
  }

  .roll {
    display: block;
    width: calc(100% - 48px);
    height: 56px;
    margin: 20px 24px;
    border-radius: 28px;
    background: var(--on-surface);
    color: var(--surface);
    font-weight: 500;
  }
</style>
