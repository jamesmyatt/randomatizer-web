/** Source of uniformly distributed random integers. */
export interface RandomSource {
  /** Returns a uniformly distributed integer in `0 until bound`. `bound` must be a positive integer. */
  nextInt(bound: number): number
}

const RANGE = 2 ** 32

/**
 * Production {@link RandomSource} backed by the Web Crypto CSPRNG.
 *
 * Uses rejection sampling: values in the incomplete final block of `bound` are discarded,
 * so the remainder has no modulo bias.
 */
export const secureRandomSource: RandomSource = {
  nextInt(bound) {
    if (!Number.isInteger(bound) || bound <= 0 || bound > RANGE) {
      throw new RangeError(`Invalid bound: ${bound}`)
    }
    const limit = RANGE - (RANGE % bound)
    const buffer = new Uint32Array(1)
    for (;;) {
      crypto.getRandomValues(buffer)
      const value = buffer[0]!
      if (value < limit) return value % bound
    }
  },
}
