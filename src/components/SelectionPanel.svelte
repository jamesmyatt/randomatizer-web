<script lang="ts">
  import {
    DiceLimits,
    STANDARD_DICE,
    canDecrement,
    canIncrement,
    dieLabel,
    selectionSummary,
    withCount,
    type StandardDie,
  } from '../lib/dice'
  import type { AppSettings } from '../lib/settings'
  import CountButton from './CountButton.svelte'
  import Icon from './Icon.svelte'

  let {
    settings,
    onupdate,
  }: {
    settings: AppSettings
    onupdate: (transform: (settings: AppSettings) => AppSettings) => void
  } = $props()

  const summary = $derived(
    settings.mode === 'basic'
      ? String(settings.basicCount)
      : selectionSummary(settings.advancedSelection),
  )

  const setBasic = (delta: number) =>
    onupdate((s) => ({
      ...s,
      basicCount: Math.min(
        Math.max(s.basicCount + delta, DiceLimits.BASIC_MIN),
        DiceLimits.BASIC_MAX,
      ),
    }))

  const setAdvanced = (die: StandardDie, delta: number) =>
    onupdate((s) => {
      const selection = s.advancedSelection
      const allowed = delta > 0 ? canIncrement(selection, die) : canDecrement(selection, die)
      return allowed
        ? { ...s, advancedSelection: withCount(selection, die, selection[die] + delta) }
        : s
    })
</script>

<section class="panel">
  <button
    type="button"
    class="header"
    aria-expanded={settings.selectionExpanded}
    aria-controls="dice-selector"
    onclick={() => onupdate((s) => ({ ...s, selectionExpanded: !s.selectionExpanded }))}
  >
    <span class="title">Dice</span>
    <span class="summary">{summary}</span>
    <Icon name={settings.selectionExpanded ? 'expandLess' : 'expandMore'} />
  </button>

  {#if settings.selectionExpanded}
    <div id="dice-selector">
      {#if settings.mode === 'basic'}
        <div class="basic">
          <CountButton
            icon="remove"
            label="Fewer dice"
            size={48}
            disabled={settings.basicCount <= DiceLimits.BASIC_MIN}
            onclick={() => setBasic(-1)}
          />
          <output class="basic-count" aria-live="polite">{settings.basicCount}</output>
          <CountButton
            icon="add"
            label="More dice"
            size={48}
            disabled={settings.basicCount >= DiceLimits.BASIC_MAX}
            onclick={() => setBasic(1)}
          />
        </div>
      {:else}
        <div class="advanced">
          {#each STANDARD_DICE as die (die)}
            {@const label = dieLabel(die)}
            <div class="counter">
              <span class="die-label">{label}</span>
              <CountButton
                icon="remove"
                label="Remove {label}"
                size={40}
                disabled={!canDecrement(settings.advancedSelection, die)}
                onclick={() => setAdvanced(die, -1)}
              />
              <output class="die-count" aria-label="{label} count"
                >{settings.advancedSelection[die]}</output
              >
              <CountButton
                icon="add"
                label="Add {label}"
                size={40}
                disabled={!canIncrement(settings.advancedSelection, die)}
                onclick={() => setAdvanced(die, 1)}
              />
            </div>
          {/each}
        </div>
      {/if}
    </div>
  {/if}
</section>

<style>
  .panel {
    margin: 0 16px;
    border-radius: 16px;
    background: var(--surface-container);
    container-type: inline-size;
  }

  .header {
    display: flex;
    align-items: center;
    gap: 12px;
    width: 100%;
    min-height: 48px;
    padding: 0 12px 0 16px;
    border-radius: 16px;
    text-align: start;
  }

  .title {
    font-size: 0.875rem;
    font-weight: 500;
  }

  .summary {
    flex: 1;
    color: var(--on-surface-variant);
  }

  .basic {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 16px;
    padding-bottom: 12px;
  }

  .basic-count {
    width: 56px;
    font-size: 1.375rem;
    text-align: center;
  }

  .advanced {
    display: grid;
    grid-template-columns: 1fr;
    column-gap: 20px;
    row-gap: 4px;
    padding: 0 16px 12px;
  }

  @container (min-width: 320px) {
    .advanced {
      grid-template-columns: 1fr 1fr;
    }
  }

  .counter {
    display: flex;
    align-items: center;
    justify-content: space-between;
    min-height: 44px;
  }

  .die-label {
    width: 44px;
    font-weight: 500;
  }

  .die-count {
    width: 28px;
    text-align: center;
  }
</style>
