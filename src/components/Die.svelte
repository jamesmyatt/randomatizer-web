<script lang="ts" module>
  const LOW = 28
  const MID = 50
  const HIGH = 72

  /** Pip centers, as percentages of the die size, by face value. */
  const PIPS: Record<number, [number, number][]> = {
    1: [[MID, MID]],
    2: [
      [LOW, LOW],
      [HIGH, HIGH],
    ],
    3: [
      [LOW, LOW],
      [MID, MID],
      [HIGH, HIGH],
    ],
    4: [
      [LOW, LOW],
      [HIGH, LOW],
      [LOW, HIGH],
      [HIGH, HIGH],
    ],
    5: [
      [LOW, LOW],
      [HIGH, LOW],
      [MID, MID],
      [LOW, HIGH],
      [HIGH, HIGH],
    ],
    6: [
      [LOW, LOW],
      [HIGH, LOW],
      [LOW, MID],
      [HIGH, MID],
      [LOW, HIGH],
      [HIGH, HIGH],
    ],
  }
</script>

<script lang="ts">
  import { toCss, type DieStyle } from '../lib/color'
  import { dieLabel, type StandardDie } from '../lib/dice'

  let {
    die,
    value,
    style,
    size,
    pips = false,
  }: {
    die: StandardDie
    value: number
    style: DieStyle
    /** Width and height in CSS px. */
    size: number
    /** Draw a d6 with pips instead of a number. */
    pips?: boolean
  } = $props()

  const pipsColor = $derived(toCss(style.pips))
</script>

<!-- Drawn in a 100 × 100 box so all proportions are percentages of the die size. -->
<svg
  width={size}
  height={size}
  viewBox="0 0 100 100"
  role="img"
  aria-label="{dieLabel(die)} showing {value}"
>
  <rect width="100" height="100" rx="19" fill={toCss(style.face)} />
  {#if style.outline !== null}
    <rect
      x="1.5"
      y="1.5"
      width="97"
      height="97"
      rx="17.5"
      fill="none"
      stroke={toCss(style.outline)}
      stroke-width="3"
    />
  {/if}
  {#if pips && die === 6}
    {#each PIPS[value] as [cx, cy], i (i)}
      <circle {cx} {cy} r="9" fill={pipsColor} />
    {/each}
  {:else}
    <text
      x="50"
      y="50"
      text-anchor="middle"
      dominant-baseline="central"
      font-size="40"
      font-weight="600"
      fill={pipsColor}>{value}</text
    >
  {/if}
</svg>

<style>
  svg {
    display: block;
    flex: none;
  }
</style>
