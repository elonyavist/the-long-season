import { brand, type Brand } from "../types/brand.ts";

/**
 * Monetary amount stored as integer minor units.
 *
 * For EUR this means cents; for GBP this means pence. Currency is contextual and
 * belongs to formatting/presentation, not to this core value object.
 */
export type Money = Brand<number, "Money">;

/**
 * Percentage stored as basis points.
 *
 * `1250` means `12.50%`. Basis points avoid floating-point percentages in
 * economy calculations.
 */
export type BasisPoints = Brand<number, "BasisPoints">;

/**
 * Builds a money value from integer minor units.
 *
 * Negative values are allowed because a club balance may go below zero. Use
 * `nonNegativeMoney` for prices, wages, and other values that cannot be
 * negative.
 *
 * @example
 * const balance = money(-25_000_00);
 */
export function money(minorUnits: number): Money {
  if (!Number.isSafeInteger(minorUnits)) {
    throw new Error(`Money must be a safe integer minor-unit amount: ${minorUnits}`);
  }

  return brand<number, "Money">(minorUnits);
}

/**
 * Builds a money value that must be zero or positive.
 *
 * @example
 * const transferFee = nonNegativeMoney(100_000_00);
 */
export function nonNegativeMoney(minorUnits: number): Money {
  if (minorUnits < 0) {
    throw new Error(`Money must not be negative: ${minorUnits}`);
  }

  return money(minorUnits);
}

/** Adds two money values and validates the result as a safe integer. */
export function addMoney(left: Money, right: Money): Money {
  return money(left + right);
}

/** Subtracts one money value from another and validates the result. */
export function subtractMoney(left: Money, right: Money): Money {
  return money(left - right);
}

/**
 * Compares two money values.
 *
 * @returns `-1` when left is lower, `1` when left is higher, `0` when equal.
 */
export function compareMoney(left: Money, right: Money): -1 | 0 | 1 {
  if (left < right) {
    return -1;
  }

  if (left > right) {
    return 1;
  }

  return 0;
}

/**
 * Builds a basis-point percentage.
 *
 * @example
 * const sellOn = basisPoints(1250); // 12.5%
 */
export function basisPoints(value: number): BasisPoints {
  if (!Number.isSafeInteger(value)) {
    throw new Error(`BasisPoints must be a safe integer: ${value}`);
  }

  if (value < 0 || value > 10_000) {
    throw new Error(`BasisPoints must be between 0 and 10000: ${value}`);
  }

  return brand<number, "BasisPoints">(value);
}

/**
 * Applies a basis-point percentage to a money value using explicit floor
 * rounding.
 */
export function applyBasisPoints(amount: Money, percentage: BasisPoints): Money {
  return money(Math.floor((amount * percentage) / 10_000));
}

/**
 * Splits money into equal integer shares.
 *
 * The last share absorbs any remainder so no minor units are lost.
 *
 * @example
 * splitMoney(money(10), 3); // [3, 3, 4]
 */
export function splitMoney(amount: Money, parts: number): Money[] {
  if (!Number.isSafeInteger(parts) || parts <= 0) {
    throw new Error(`Money split parts must be a positive safe integer: ${parts}`);
  }

  const baseShare = Math.floor(amount / parts);
  const remainder = amount - baseShare * parts;
  const shares: Money[] = [];

  for (let index = 0; index < parts; index += 1) {
    const isLast = index === parts - 1;
    shares.push(money(baseShare + (isLast ? remainder : 0)));
  }

  return shares;
}
