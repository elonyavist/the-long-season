import { assertNonEmptyString } from "../assert.ts";
import { toUint32 } from "../number-utils.ts";
import { sfc32, type Rng, type Sfc32Seed } from "./sfc32.ts";

/**
 * Stable RNG stream derivation from seed, stream name, and key parts.
 *
 * Engine code should derive one stream per logical unit, for example a match,
 * schedule, or player-growth calculation. The save stores the seed and
 * algorithm version, not a process-global RNG state.
 */

/** Current deterministic RNG derivation algorithm identifier. */
export const RNG_ALGORITHM_VERSION = "sfc32-cyrb128-v1";

/** Primitive values accepted in a deterministic RNG key. */
export type RngKeyPart = string | number | boolean;

/**
 * Creates a deterministic RNG stream for one stable logical key.
 *
 * @example
 * const rng = deriveRng("demo-001", "match", "fixture:000001");
 */
export function deriveRng(seed: string, streamName: string, ...keyParts: readonly RngKeyPart[]): Rng {
  assertNonEmptyString(seed, "seed");
  assertNonEmptyString(streamName, "streamName");

  return sfc32(hashStringToSeedWords(buildDerivationKey(seed, streamName, keyParts)));
}

/**
 * Hashes a string into the four unsigned 32-bit words required by sfc32.
 *
 * @example
 * const words = hashStringToSeedWords("demo-001|match|fixture:000001");
 */
export function hashStringToSeedWords(value: string): Sfc32Seed {
  let h1 = 1_779_033_703;
  let h2 = 3_144_134_277;
  let h3 = 1_013_904_242;
  let h4 = 2_773_480_762;

  for (let index = 0; index < value.length; index += 1) {
    const char = value.charCodeAt(index);
    h1 = h2 ^ Math.imul(h1 ^ char, 597_399_067);
    h2 = h3 ^ Math.imul(h2 ^ char, 2_869_860_233);
    h3 = h4 ^ Math.imul(h3 ^ char, 951_274_213);
    h4 = h1 ^ Math.imul(h4 ^ char, 2_716_044_179);
  }

  h1 = Math.imul(h3 ^ (h1 >>> 18), 597_399_067);
  h2 = Math.imul(h4 ^ (h2 >>> 22), 2_869_860_233);
  h3 = Math.imul(h1 ^ (h3 >>> 17), 951_274_213);
  h4 = Math.imul(h2 ^ (h4 >>> 19), 2_716_044_179);

  return [
    toUint32((h1 ^ h2 ^ h3 ^ h4) >>> 0),
    toUint32((h2 ^ h1) >>> 0),
    toUint32((h3 ^ h1) >>> 0),
    toUint32((h4 ^ h1) >>> 0),
  ];
}

/**
 * Builds a collision-resistant text key using type and length prefixes.
 */
function buildDerivationKey(
  seed: string,
  streamName: string,
  keyParts: readonly RngKeyPart[],
): string {
  return [seed, streamName, ...keyParts].map(encodeKeyPart).join("|");
}

/**
 * Encodes one key part so adjacent values cannot accidentally collide.
 */
function encodeKeyPart(value: RngKeyPart): string {
  const type = typeof value;
  const text = String(value);

  return `${type}:${text.length}:${text}`;
}
