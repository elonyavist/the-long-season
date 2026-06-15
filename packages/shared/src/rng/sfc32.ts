import { assertValue } from "../assert.ts";
import { assertIntegerInRange, UINT32_MAX, UINT32_SIZE, toUint32 } from "../number-utils.ts";

/**
 * Deterministic sfc32 pseudo-random number generator.
 *
 * `sfc32` is fast, tiny, and fully deterministic from four unsigned 32-bit seed
 * words. Each returned RNG owns its local mutable state; there is no global
 * stream shared across simulations.
 */

/** Four unsigned 32-bit words used to initialize an sfc32 stream. */
export type Sfc32Seed = readonly [number, number, number, number];

/**
 * Minimal random source used by engine code.
 *
 * `nextFloat` is the primitive operation. Other helpers consume the same local
 * stream in a deterministic order.
 */
export interface Rng {
  /** Returns a number in the half-open range `[0, 1)`. */
  nextFloat(): number;

  /** Returns an integer in the half-open range `[minInclusive, maxExclusive)`. */
  nextInt(minInclusive: number, maxExclusive: number): number;

  /** Returns one item from a non-empty readonly list. */
  pick<T>(items: readonly T[]): T;
}

/**
 * Creates a deterministic sfc32 RNG from four unsigned 32-bit seed words.
 *
 * @example
 * const rng = sfc32([1, 2, 3, 4]);
 * const roll = rng.nextInt(1, 7);
 */
export function sfc32(seed: Sfc32Seed): Rng {
  const [first, second, third, fourth] = seed;
  let a = validateSeedWord(first, "seed[0]");
  let b = validateSeedWord(second, "seed[1]");
  let c = validateSeedWord(third, "seed[2]");
  let d = validateSeedWord(fourth, "seed[3]");

  /**
   * Advances the local sfc32 state once and returns a 32-bit fraction.
   */
  function nextFloat(): number {
    a = toUint32(a);
    b = toUint32(b);
    c = toUint32(c);
    d = toUint32(d);

    const result = toUint32(a + b + d);
    d = toUint32(d + 1);
    a = toUint32(b ^ (b >>> 9));
    b = toUint32(c + (c << 3));
    c = toUint32((c << 21) | (c >>> 11));
    c = toUint32(c + result);

    return result / UINT32_SIZE;
  }

  /**
   * Converts one RNG float to an integer inside a caller-provided range.
   */
  function nextInt(minInclusive: number, maxExclusive: number): number {
    assertIntegerInRange(minInclusive, Number.MIN_SAFE_INTEGER, Number.MAX_SAFE_INTEGER, "minInclusive");
    assertIntegerInRange(maxExclusive, Number.MIN_SAFE_INTEGER, Number.MAX_SAFE_INTEGER, "maxExclusive");
    assertValue(
      maxExclusive > minInclusive,
      `maxExclusive must be greater than minInclusive: ${minInclusive}, ${maxExclusive}`,
    );

    return minInclusive + Math.floor(nextFloat() * (maxExclusive - minInclusive));
  }

  /**
   * Selects a deterministic item from a non-empty readonly list.
   */
  function pick<T>(items: readonly T[]): T {
    assertValue(items.length > 0, "items must not be empty");

    const index = nextInt(0, items.length);
    const item = items[index];
    assertValue(item !== undefined, `picked item must exist at index ${index}`);

    return item;
  }

  return { nextFloat, nextInt, pick };
}

/**
 * Validates and normalizes one unsigned 32-bit seed word.
 */
function validateSeedWord(value: number, label: string): number {
  assertIntegerInRange(value, 0, UINT32_MAX, label);

  return toUint32(value);
}
