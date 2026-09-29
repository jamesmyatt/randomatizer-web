import type { Rgb } from './color'

export interface Swatch {
  readonly rgb: Rgb
  readonly name: string
}

/** Preset custom face colors, in rows of six: strong, light, then neutrals and extras. */
export const DICE_PALETTE: readonly Swatch[] = [
  { rgb: 0xd32f2f, name: 'Red' },
  { rgb: 0xf57c00, name: 'Orange' },
  { rgb: 0xffd600, name: 'Yellow' },
  { rgb: 0x388e3c, name: 'Green' },
  { rgb: 0x1976d2, name: 'Blue' },
  { rgb: 0x7b1fa2, name: 'Purple' },

  { rgb: 0xf48fb1, name: 'Pink' },
  { rgb: 0xffcc80, name: 'Peach' },
  { rgb: 0xfff59d, name: 'Lemon' },
  { rgb: 0xa5d6a7, name: 'Mint' },
  { rgb: 0x90caf9, name: 'Sky blue' },
  { rgb: 0xce93d8, name: 'Lavender' },

  { rgb: 0xffffff, name: 'White' },
  { rgb: 0x9e9e9e, name: 'Gray' },
  { rgb: 0x000000, name: 'Black' },
  { rgb: 0x6d4c41, name: 'Brown' },
  { rgb: 0x00897b, name: 'Teal' },
  { rgb: 0xc2185b, name: 'Magenta' },
]
