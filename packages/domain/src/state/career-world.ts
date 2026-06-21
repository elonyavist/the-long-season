/** Current deterministic generator version for new career worlds. */
export const CAREER_WORLD_GENERATOR_VERSION = 1;

/**
 * Durable metadata for the generated football world inside one career save.
 *
 * This metadata is separate from `GameState.meta.seed`: the game seed can drive
 * schedule and match simulation, while `worldSeed` identifies the generated
 * people/squad world that must stay stable once a career is created.
 */
export interface CareerWorldMetadata {
  /** Seed used to generate the career world, squads, identities, and prospects. */
  readonly worldSeed: string;
  /** Version of the content generator used for this world. */
  readonly generatorVersion: number;
  /** Stable source key for the creation path, for example `career:cli-new-world`. */
  readonly creationSourceKey: string;
}

/** Machine-readable career-world validation failure. */
export type CareerWorldMetadataErrorCode =
  | "empty_world_seed"
  | "invalid_generator_version"
  | "empty_creation_source_key";

/**
 * Typed error thrown when career-world metadata is not safe to persist.
 */
export class CareerWorldMetadataError extends Error {
  /** Stable machine-readable validation code. */
  public readonly code: CareerWorldMetadataErrorCode;

  /** Creates a career-world metadata validation error. */
  public constructor(code: CareerWorldMetadataErrorCode, message: string) {
    super(message);
    this.name = "CareerWorldMetadataError";
    this.code = code;
  }
}

/**
 * Builds validated durable metadata for one generated career world.
 *
 * The helper trims string inputs and validates only metadata shape. It does not
 * generate players, write saves, or infer any gameplay decisions.
 *
 * @example
 * const world = createCareerWorldMetadata({
 *   worldSeed: "scalata-001",
 *   generatorVersion: CAREER_WORLD_GENERATOR_VERSION,
 *   creationSourceKey: "career:cli-new-world",
 * });
 */
export function createCareerWorldMetadata(input: CareerWorldMetadata): CareerWorldMetadata {
  const worldSeed = input.worldSeed.trim();
  const creationSourceKey = input.creationSourceKey.trim();

  if (worldSeed.length === 0) {
    throw new CareerWorldMetadataError("empty_world_seed", "career world seed must not be empty");
  }

  if (!Number.isSafeInteger(input.generatorVersion) || input.generatorVersion <= 0) {
    throw new CareerWorldMetadataError(
      "invalid_generator_version",
      `career world generator version must be a positive safe integer: ${input.generatorVersion}`,
    );
  }

  if (creationSourceKey.length === 0) {
    throw new CareerWorldMetadataError("empty_creation_source_key", "career world creation source key must not be empty");
  }

  return {
    worldSeed,
    generatorVersion: input.generatorVersion,
    creationSourceKey,
  };
}
