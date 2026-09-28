<script lang="ts">
  import { dieStyle, lowPipsContrast, pipsContrast, toCss, type Rgb } from '../lib/color'
  import { DICE_PALETTE } from '../lib/palette'
  import { THEME_MODES, withMode, type AppSettings, type DiceFace } from '../lib/settings'
  import { DARK, LIGHT, type ColorScheme } from '../lib/theme'
  import Die from './Die.svelte'
  import Icon from './Icon.svelte'

  let {
    open = $bindable(),
    settings,
    scheme,
    onupdate,
  }: {
    open: boolean
    settings: AppSettings
    /** The scheme in use, for the dice color previews. */
    scheme: ColorScheme
    onupdate: (transform: (settings: AppSettings) => AppSettings) => void
  } = $props()

  let dialog: HTMLDialogElement

  $effect(() => {
    if (open && !dialog.open) dialog.showModal()
    else if (!open && dialog.open) dialog.close()
  })

  const FACES: { face: DiceFace; label: string }[] = [
    { face: 'background', label: 'Background' },
    { face: 'foreground', label: 'Foreground' },
    { face: 'custom', label: 'Custom' },
  ]

  const THEME_LABELS = { system: 'System', light: 'Light', dark: 'Dark' } as const

  const styleOn = (face: DiceFace, s: ColorScheme, customFace: Rgb = settings.customFace) =>
    dieStyle(face, customFace, s.surface, s.onSurface)

  const onLight = $derived(styleOn('custom', LIGHT))
  const onDark = $derived(styleOn('custom', DARK))
  const worstContrast = $derived(Math.min(pipsContrast(onLight), pipsContrast(onDark)))

  /** Closes when the backdrop (the dialog element itself, outside the sheet) is clicked. */
  function onBackdropClick(event: MouseEvent) {
    if (event.target === dialog) open = false
  }
</script>

<dialog
  bind:this={dialog}
  aria-labelledby="settings-title"
  onclose={() => (open = false)}
  onclick={onBackdropClick}
>
  <div class="sheet">
    <header>
      <h2 id="settings-title">Settings</h2>
      <button type="button" class="icon" aria-label="Close" onclick={() => (open = false)}>
        <Icon name="close" />
      </button>
    </header>

    <label class="row">
      <span>Advanced mode</span>
      <input
        type="checkbox"
        role="switch"
        checked={settings.mode === 'advanced'}
        onchange={(e) =>
          onupdate((s) => withMode(s, e.currentTarget.checked ? 'advanced' : 'basic'))}
      />
    </label>
    <label class="row">
      <span>Show total</span>
      <input
        type="checkbox"
        role="switch"
        checked={settings.showTotal}
        onchange={(e) => onupdate((s) => ({ ...s, showTotal: e.currentTarget.checked }))}
      />
    </label>
    <label class="row">
      <span>Keep history</span>
      <input
        type="checkbox"
        role="switch"
        checked={settings.historyEnabled}
        onchange={(e) => onupdate((s) => ({ ...s, historyEnabled: e.currentTarget.checked }))}
      />
    </label>
    <label class="row">
      <span>Theme</span>
      <select
        value={settings.themeMode}
        onchange={(e) =>
          onupdate((s) => ({
            ...s,
            themeMode: THEME_MODES.find((m) => m === e.currentTarget.value) ?? s.themeMode,
          }))}
      >
        {#each THEME_MODES as mode (mode)}
          <option value={mode}>{THEME_LABELS[mode]}</option>
        {/each}
      </select>
    </label>

    <fieldset>
      <legend>Dice color</legend>
      {#each FACES as { face, label } (face)}
        <label class="row radio">
          <input
            type="radio"
            name="dice-face"
            value={face}
            checked={settings.diceFace === face}
            onchange={() => onupdate((s) => ({ ...s, diceFace: face }))}
          />
          <span>{label}</span>
          <Die die={6} value={5} size={36} style={styleOn(face, scheme)} />
        </label>
      {/each}
    </fieldset>

    {#if settings.diceFace === 'custom'}
      <fieldset class="swatches">
        <legend class="visually-hidden">Custom color</legend>
        {#each DICE_PALETTE as swatch (swatch.rgb)}
          <label class="swatch" title={swatch.name}>
            <input
              type="radio"
              name="custom-face"
              aria-label={swatch.name}
              checked={swatch.rgb === settings.customFace}
              onchange={() => onupdate((s) => ({ ...s, customFace: swatch.rgb }))}
            />
            <span class="chip" style:background={toCss(swatch.rgb)}></span>
          </label>
        {/each}
      </fieldset>

      <div class="previews">
        {#each [{ style: onLight, s: LIGHT, label: 'Light' }, { style: onDark, s: DARK, label: 'Dark' }] as preview (preview.label)}
          <div
            class="preview"
            style:background={toCss(preview.s.surface)}
            style:color={toCss(preview.s.onSurface)}
          >
            <Die die={6} value={5} size={40} style={preview.style} />
            <span>{preview.label}</span>
          </div>
        {/each}
      </div>

      {#if lowPipsContrast(onLight) || lowPipsContrast(onDark)}
        <p class="warning" role="status">
          <Icon name="warning" />
          <span>
            Low contrast between face and pips ({worstContrast.toFixed(1)}:1). Pips and numbers may
            be hard to read. Choose a lighter or darker face.
          </span>
        </p>
      {/if}
    {/if}

    <p class="about">Randomatizer {__APP_VERSION__} · Apache-2.0</p>
  </div>
</dialog>

<style>
  dialog {
    width: 100%;
    max-width: 640px;
    max-height: calc(100dvh - 56px);
    margin: auto auto 0;
    padding: 0;
    border: none;
    border-radius: 28px 28px 0 0;
    background: var(--surface-container);
    color: var(--on-surface);
  }

  @media (min-width: 700px) {
    dialog {
      margin: auto;
      border-radius: 28px;
    }
  }

  dialog::backdrop {
    background: rgb(0 0 0 / 32%);
  }

  .sheet {
    display: flex;
    flex-direction: column;
    gap: 16px;
    padding: 16px 24px 24px;
  }

  header {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  h2 {
    margin: 0;
    font-size: 1.5rem;
    font-weight: 400;
  }

  .icon {
    display: grid;
    place-items: center;
    width: 48px;
    height: 48px;
    margin-right: -12px;
    border-radius: 50%;
  }

  .row {
    display: flex;
    align-items: center;
    gap: 14px;
    min-height: 48px;
    cursor: pointer;
  }

  .row > span {
    flex: 1;
  }

  .radio {
    min-height: 52px;
  }

  fieldset {
    margin: 0;
    padding: 0;
    border: none;
  }

  legend {
    padding: 0;
    font-size: 0.875rem;
    font-weight: 500;
  }

  select {
    padding: 8px 12px;
    border: 1px solid var(--outline);
    border-radius: 8px;
    background: var(--surface-container);
    color: var(--on-surface-variant);
    font: inherit;
  }

  input[type='radio'] {
    width: 20px;
    height: 20px;
    margin: 0;
    accent-color: var(--on-surface);
  }

  input[role='switch'] {
    position: relative;
    flex: none;
    width: 52px;
    height: 32px;
    margin: 0;
    border: 2px solid var(--outline);
    border-radius: 16px;
    background: var(--surface-container);
    cursor: pointer;
    transition: background-color 150ms;
    appearance: none;
  }

  input[role='switch']::before {
    position: absolute;
    top: 6px;
    left: 6px;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: var(--outline);
    content: '';
    transition:
      transform 150ms,
      width 150ms,
      height 150ms,
      top 150ms,
      left 150ms;
  }

  input[role='switch']:checked {
    border-color: var(--on-surface);
    background: var(--on-surface);
  }

  input[role='switch']:checked::before {
    top: 2px;
    left: 2px;
    width: 24px;
    height: 24px;
    background: var(--surface);
    transform: translateX(20px);
  }

  .swatches {
    display: grid;
    grid-template-columns: repeat(6, 48px);
    justify-content: space-between;
    row-gap: 4px;
  }

  .swatch {
    display: grid;
    position: relative;
    place-items: center;
    width: 48px;
    height: 48px;
    cursor: pointer;
  }

  .swatch input {
    position: absolute;
    opacity: 0;
    pointer-events: none;
  }

  .chip {
    width: 40px;
    height: 40px;
    border: 1px solid var(--outline);
    border-radius: 50%;
  }

  .swatch:has(input:checked)::after {
    position: absolute;
    inset: 0;
    border: 3px solid var(--on-surface);
    border-radius: 50%;
    content: '';
  }

  .swatch:has(input:focus-visible) {
    outline: 2px solid var(--on-surface);
    outline-offset: 2px;
    border-radius: 50%;
  }

  .previews {
    display: flex;
    gap: 10px;
  }

  .preview {
    display: flex;
    flex: 1;
    align-items: center;
    justify-content: center;
    gap: 12px;
    height: 64px;
    border: 1px solid var(--outline-variant);
    border-radius: 12px;
    font-size: 0.75rem;
    font-weight: 500;
  }

  .warning {
    display: flex;
    gap: 10px;
    margin: 0;
    padding: 12px;
    border-radius: 12px;
    background: var(--error-container);
    color: var(--on-error-container);
    font-size: 0.875rem;
  }

  .about {
    margin: 0;
    color: var(--on-surface-variant);
    font-size: 0.75rem;
    text-align: center;
  }
</style>
