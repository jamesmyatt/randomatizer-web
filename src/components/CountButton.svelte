<script lang="ts">
  import Icon, { type IconName } from './Icon.svelte'

  let {
    icon,
    label,
    disabled,
    size,
    onclick,
  }: { icon: IconName; label: string; disabled: boolean; size: number; onclick: () => void } =
    $props()
</script>

<button
  type="button"
  class="count"
  aria-label={label}
  title={label}
  {disabled}
  {onclick}
  style:--size="{size}px"
>
  <Icon name={icon} />
</button>

<style>
  .count {
    display: grid;
    place-items: center;
    flex: none;
    width: var(--size);
    height: var(--size);
    border: 1.5px solid var(--outline);
    border-radius: 50%;
    color: var(--on-surface);
  }

  .count:disabled {
    border-color: color-mix(in srgb, var(--outline) 38%, transparent);
    color: color-mix(in srgb, var(--on-surface) 38%, transparent);
  }
</style>
