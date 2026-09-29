import { toCss, type Rgb } from './color'

/** The app's color roles. Monochrome: accents use `onSurface`/`surface`. */
export interface ColorScheme {
  readonly surface: Rgb
  readonly onSurface: Rgb
  readonly onSurfaceVariant: Rgb
  readonly surfaceContainer: Rgb
  readonly outline: Rgb
  readonly outlineVariant: Rgb
  readonly errorContainer: Rgb
  readonly onErrorContainer: Rgb
}

/** Neutral light scheme, in place of Android's dynamic colors. */
export const LIGHT: ColorScheme = {
  surface: 0xfbfbfb,
  onSurface: 0x1b1b1b,
  onSurfaceVariant: 0x474747,
  surfaceContainer: 0xeeeeee,
  outline: 0x777777,
  outlineVariant: 0xc6c6c6,
  errorContainer: 0xffdad6,
  onErrorContainer: 0x410002,
}

/** Neutral dark scheme. */
export const DARK: ColorScheme = {
  surface: 0x131313,
  onSurface: 0xe3e3e3,
  onSurfaceVariant: 0xc6c6c6,
  surfaceContainer: 0x1f1f1f,
  outline: 0x919191,
  outlineVariant: 0x474747,
  errorContainer: 0x93000a,
  onErrorContainer: 0xffdad6,
}

/** CSS custom properties for `scheme`, e.g. `--surface`. */
export const cssVariables = (scheme: ColorScheme): [string, string][] =>
  Object.entries(scheme).map(([role, rgb]) => [
    `--${role.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`)}`,
    toCss(rgb as Rgb),
  ])
