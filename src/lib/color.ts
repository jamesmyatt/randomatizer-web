import type { DiceFace } from './settings'

/** An opaque color as a 24-bit RGB integer, e.g. 0xd32f2f. */
export type Rgb = number

const BLACK: Rgb = 0x000000
const WHITE: Rgb = 0xffffff

/** Minimum ratio for graphical objects and large text (WCAG 1.4.11 / 1.4.3). */
export const MINIMUM_CONTRAST = 3.0

/** WCAG 2 relative luminance. */
export function relativeLuminance(rgb: Rgb): number {
  const channel = (shift: number) => {
    const c = ((rgb >> shift) & 0xff) / 255
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  }
  return 0.2126 * channel(16) + 0.7152 * channel(8) + 0.0722 * channel(0)
}

/** Contrast ratio from 1.0 (identical) to 21.0 (black on white). */
export function contrastRatio(a: Rgb, b: Rgb): number {
  const la = relativeLuminance(a)
  const lb = relativeLuminance(b)
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05)
}

export const isLowContrast = (a: Rgb, b: Rgb): boolean => contrastRatio(a, b) < MINIMUM_CONTRAST

/** CSS hex notation, e.g. "#d32f2f". */
export const toCss = (rgb: Rgb): string => `#${rgb.toString(16).padStart(6, '0')}`

/** Colors used to draw a die. `outline` is null when the die needs no outline. */
export interface DieStyle {
  readonly face: Rgb
  readonly pips: Rgb
  readonly outline: Rgb | null
}

export const pipsContrast = (style: DieStyle): number => contrastRatio(style.face, style.pips)
export const lowPipsContrast = (style: DieStyle): boolean => isLowContrast(style.face, style.pips)

/**
 * Resolves the die colors against the app's `background` and `foreground`.
 *
 * Pips are the darker or lighter of `foreground` and `background`. Which one depends only on the face
 * (whichever of black and white contrasts more with it), so a face gets the same kind of pips in light and dark.
 * The die gets an outline in the pips color when the face is too close to the background.
 */
export function dieStyle(
  face: DiceFace,
  customFace: Rgb,
  background: Rgb,
  foreground: Rgb,
): DieStyle {
  const faceColor =
    face === 'background' ? background : face === 'foreground' ? foreground : customFace
  const foregroundIsDarker = relativeLuminance(foreground) < relativeLuminance(background)
  const darker = foregroundIsDarker ? foreground : background
  const lighter = foregroundIsDarker ? background : foreground
  const pips = contrastRatio(faceColor, BLACK) >= contrastRatio(faceColor, WHITE) ? darker : lighter
  return { face: faceColor, pips, outline: isLowContrast(faceColor, background) ? pips : null }
}
