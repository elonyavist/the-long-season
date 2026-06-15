/**
 * Public entrypoint for small technical utilities.
 *
 * Shared must stay free of football, economy, and gameplay concepts. Utilities
 * such as deterministic RNG and pure date conversion are exported here when
 * their documented step is implemented.
 */
export { assertNonEmptyString, assertValue } from "./assert.ts";
export { addDays, diffDays, fromISO, toISO } from "./date-utils.ts";
export { SharedValueError } from "./errors.ts";
export {
  assertIntegerInRange,
  assertSafeInteger,
  toUint32,
  UINT32_MAX,
  UINT32_SIZE,
} from "./number-utils.ts";
export { deriveRng, hashStringToSeedWords, RNG_ALGORITHM_VERSION, type RngKeyPart } from "./rng/derive-rng.ts";
export { sfc32, type Rng, type Sfc32Seed } from "./rng/sfc32.ts";
