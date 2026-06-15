import { SharedValueError } from "./errors.ts";

/**
 * Assertion helpers for shared deterministic utilities.
 *
 * Keep these helpers technical and dependency-free. Domain-specific validation
 * still belongs in `packages/domain`.
 */

/**
 * Throws a shared value error when a condition is not met.
 *
 * @example
 * assertValue(items.length > 0, "items must not be empty");
 */
export function assertValue(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new SharedValueError(message);
  }
}

/**
 * Requires a string to contain at least one character.
 *
 * @example
 * assertNonEmptyString("demo-001", "seed");
 */
export function assertNonEmptyString(value: string, label: string): void {
  assertValue(value.length > 0, `${label} must not be empty`);
}
