import { describe, expect, it } from 'vitest'
import { contrastRatio, dieStyle, lowPipsContrast, toCss } from './color'
import { DICE_PALETTE } from './palette'
import { DARK, LIGHT, cssVariables } from './theme'

const black = 0x000000
const white = 0xffffff
const red = 0xb71c1c
const orange = 0xe65100
const darkSurface = 0x111318
const lightSurface = 0xf9f9ff
const cream = 0xfff8e1
const midGray = 0x757575
const teal = 0x00897b
const blue = 0x1976d2
const lightGray = 0xb0b0b0
const darkGray = 0x505050

describe('contrast', () => {
  it('matches WCAG reference values', () => {
    expect(contrastRatio(black, white)).toBeCloseTo(21, 9)
    expect(contrastRatio(red, red)).toBeCloseTo(1, 9)
    expect(contrastRatio(red, orange)).toBeCloseTo(contrastRatio(orange, red), 12)
    expect(Math.abs(contrastRatio(red, orange) - 1.7)).toBeLessThan(0.05)
    expect(Math.abs(contrastRatio(red, darkSurface) - 2.8)).toBeLessThan(0.05)
  })

  it('formats CSS hex colors', () => {
    expect(toCss(0x0a0b0c)).toBe('#0a0b0c')
    expect(toCss(black)).toBe('#000000')
  })
})

describe('dieStyle', () => {
  it('uses the foreground for pips and outline on background dice', () => {
    expect(dieStyle('background', red, white, black)).toEqual({
      face: white,
      pips: black,
      outline: black,
    })
  })

  it('uses the background for pips without an outline on foreground dice', () => {
    expect(dieStyle('foreground', red, white, black)).toEqual({
      face: black,
      pips: white,
      outline: null,
    })
  })

  it('picks the darker or lighter theme color for custom pips, chosen by the face', () => {
    expect(dieStyle('custom', red, lightSurface, darkSurface).pips).toBe(lightSurface)
    expect(dieStyle('custom', cream, lightSurface, darkSurface).pips).toBe(darkSurface)
    expect(dieStyle('custom', red, darkSurface, lightSurface).pips).toBe(lightSurface)
    expect(dieStyle('custom', cream, darkSurface, lightSurface).pips).toBe(darkSurface)
  })

  it('gives mid-tone faces the same kind of pips in light and dark', () => {
    const light = [0xfff8f6, 0x231918] as const
    const dark = [0x1a110f, 0xf1dfda] as const
    expect(dieStyle('custom', teal, ...light).pips).toBe(light[1])
    expect(dieStyle('custom', teal, ...dark).pips).toBe(dark[0])
    expect(dieStyle('custom', blue, ...light).pips).toBe(light[0])
    expect(dieStyle('custom', blue, ...dark).pips).toBe(dark[1])
  })

  it('outlines custom dice in the pips color only when the face is close to the background', () => {
    const onDark = dieStyle('custom', red, darkSurface, lightSurface)
    expect(onDark.outline).toBe(onDark.pips)
    expect(dieStyle('custom', red, lightSurface, darkSurface).outline).toBeNull()
    expect(dieStyle('custom', cream, lightSurface, darkSurface).outline).toBe(darkSurface)
  })

  it('warns about low pips contrast only when neither theme color contrasts with the face', () => {
    expect(lowPipsContrast(dieStyle('custom', midGray, lightSurface, darkSurface))).toBe(false)
    expect(lowPipsContrast(dieStyle('custom', midGray, darkSurface, lightSurface))).toBe(false)
    expect(lowPipsContrast(dieStyle('custom', midGray, lightGray, darkGray))).toBe(true)
  })
})

describe('theme', () => {
  it.each([
    ['light', LIGHT],
    ['dark', DARK],
  ] as const)('%s scheme has readable text and pips for every palette color', (_, scheme) => {
    expect(contrastRatio(scheme.surface, scheme.onSurface)).toBeGreaterThanOrEqual(7)
    expect(contrastRatio(scheme.surface, scheme.onSurfaceVariant)).toBeGreaterThanOrEqual(4.5)
    expect(contrastRatio(scheme.errorContainer, scheme.onErrorContainer)).toBeGreaterThanOrEqual(
      4.5,
    )
    for (const { rgb } of DICE_PALETTE) {
      expect(lowPipsContrast(dieStyle('custom', rgb, scheme.surface, scheme.onSurface))).toBe(false)
    }
  })

  it('maps roles to CSS custom properties', () => {
    expect(cssVariables(LIGHT)).toContainEqual([
      '--on-surface-variant',
      toCss(LIGHT.onSurfaceVariant),
    ])
  })
})
