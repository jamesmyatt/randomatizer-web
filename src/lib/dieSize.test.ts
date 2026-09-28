import { describe, expect, it } from 'vitest'
import { DIE_SPACING, MAX_DIE_SIZE, MIN_DIE_SIZE, dieSize } from './dieSize'

// A 412 px wide phone with 24 px padding each side.
const phone = 364

describe('dieSize', () => {
  it('uses the maximum size for one or two dice', () => {
    expect(dieSize(phone, 1)).toBe(MAX_DIE_SIZE)
    expect(dieSize(phone, 2)).toBe(MAX_DIE_SIZE)
  })

  it('fills the width with three dice', () => {
    expect(dieSize(phone, 3)).toBe(107) // (364 - 40 - 1) / 3 = 107.7
  })

  it('just fits four dice and uses the minimum size for more', () => {
    expect(dieSize(phone, 4)).toBe(MIN_DIE_SIZE) // (364 - 60 - 1) / 4 = 75.75
    expect(dieSize(phone, 5)).toBe(MIN_DIE_SIZE)
    expect(dieSize(phone, 84)).toBe(MIN_DIE_SIZE)
  })

  it('fits more dice on wider screens before reaching the minimum', () => {
    expect(dieSize(752, 7)).toBe(90) // (752 - 120 - 1) / 7 = 90.1
  })

  it('always fits in one row', () => {
    for (let count = 1; count <= 4; count++) {
      const size = dieSize(phone, count)
      expect(size * count + DIE_SPACING * (count - 1)).toBeLessThan(phone)
    }
  })

  it('needs at least one die', () => {
    expect(() => dieSize(phone, 0)).toThrow(RangeError)
  })
})
