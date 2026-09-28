import type { RandomSource } from './random'

/** Deterministic, unbiased {@link RandomSource} for tests (mulberry32 with rejection sampling). */
export function seededRandomSource(seed: number): RandomSource {
  let state = seed >>> 0
  const next = () => {
    state = (state + 0x6d2b79f5) >>> 0
    let t = state
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return (t ^ (t >>> 14)) >>> 0
  }
  return {
    nextInt(bound) {
      const limit = 2 ** 32 - (2 ** 32 % bound)
      for (;;) {
        const value = next()
        if (value < limit) return value % bound
      }
    },
  }
}

/** Minimal in-memory Storage. */
export function memoryStorage(): Storage {
  const items = new Map<string, string>()
  return {
    get length() {
      return items.size
    },
    clear: () => items.clear(),
    getItem: (key) => items.get(key) ?? null,
    key: (i) => [...items.keys()][i] ?? null,
    removeItem: (key) => void items.delete(key),
    setItem: (key, value) => void items.set(key, value),
  }
}
