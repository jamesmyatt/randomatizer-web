<script lang="ts">
  import { describe, type HistoryEntry } from '../lib/history'
  import Icon from './Icon.svelte'

  let {
    history,
    expanded,
    showTotal,
    ontoggle,
    onclear,
  }: {
    history: readonly HistoryEntry[]
    expanded: boolean
    showTotal: boolean
    ontoggle: () => void
    onclear: () => void
  } = $props()
</script>

<section class="history" aria-label="History">
  <div class="header">
    <button
      type="button"
      class="toggle"
      aria-expanded={expanded}
      aria-controls="history-list"
      onclick={ontoggle}
    >
      History
      <!-- Expanded history collapses down to the bottom; collapsed history expands up. -->
      <Icon name={expanded ? 'expandMore' : 'expandLess'} size={20} />
    </button>
    <button type="button" class="clear" onclick={onclear}>Clear</button>
  </div>
  {#if expanded}
    <ol id="history-list">
      {#each history as entry, index (entry.id)}
        <li class:latest={index === 0}>
          <span class="dice">{describe(entry)}</span>
          {#if showTotal}
            <span class="total">{entry.roll.total}</span>
          {/if}
        </li>
      {/each}
    </ol>
  {/if}
</section>

<style>
  .history {
    display: flex;
    flex-direction: column;
    min-height: 0;
    border-top: 1px solid var(--outline-variant);
  }

  .header {
    display: flex;
    align-items: center;
    min-height: 48px;
    padding-right: 16px;
  }

  .toggle {
    display: flex;
    flex: 1;
    align-items: center;
    gap: 8px;
    align-self: stretch;
    padding-left: 24px;
    font-size: 0.875rem;
    font-weight: 500;
  }

  .clear {
    padding: 10px 12px;
    border-radius: 20px;
    font-size: 0.875rem;
    font-weight: 500;
  }

  ol {
    flex: 1;
    min-height: 0;
    margin: 0;
    padding: 0 0 8px;
    overflow-y: auto;
    list-style: none;
    scrollbar-color: var(--outline) transparent;
    scrollbar-width: thin;
  }

  li {
    display: flex;
    gap: 16px;
    padding: 6px 24px;
    color: var(--on-surface-variant);
  }

  li.latest {
    color: var(--on-surface);
  }

  .dice {
    flex: 1;
  }

  .total {
    font-variant-numeric: tabular-nums;
  }
</style>
