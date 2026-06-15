import { assertValue } from "./assert.ts";

/**
 * Small deterministic number helpers shared by RNG and date modules.
 *
 * These functions validate primitive technical values only. Football-specific
 * ranges, money, ratings, and IDs stay in domain.
 */

/** Number of distinct values representable by an unsigned 32-bit integer. */
export const UINT32_SIZE = 0x1_0000_0000;

/** Highest unsigned 32-bit integer value. */
export const UINT32_MAX = UINT32_SIZE - 1;

/**
 * Requires a value to be a safe integer.
 *
 * @example
 * assertSafeInteger(42, "day offset");
 */
export function assertSafeInteger(value: number, label: string): void {
  assertValue(Number.isSafeInteger(value), `${label} must be a safe integer: ${value}`);
}

/**
 * Requires a value to be an integer inside an inclusive range.
 *
 * @example
 * assertIntegerInRange(12, 0, 20, "ability");
 */
export function assertIntegerInRange(
  value: number,
  minInclusive: number,
  maxInclusive: number,
  label: string,
): void {
  assertSafeInteger(value, label);
  assertValue(
    value >= minInclusive && value <= maxInclusive,
    `${label} must be between ${minInclusive} and ${maxInclusive}: ${value}`,
  );
}

/**
 * Converts a JavaScript number to unsigned 32-bit representation.
 *
 * @example
 * const word = toUint32(-1); // 4294967295
 */
export function toUint32(value: number): number {
  return value >>> 0;
}
