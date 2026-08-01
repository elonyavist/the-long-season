import {
  createPlayer,
  gameDate,
  stateValue,
  type CreatedPlayer,
  type GameDate,
  type PersonIdentity,
  type PlayerAbilities,
  type PlayerId,
  type PlayerPosition,
} from "@game/domain";
import { addCivilYears } from "@game/shared";

import { generatedRoleIdentityForPosition } from "./player-role-identity.ts";

/** Explicit generated facts shared by senior, intake, and youth assemblers. */
export interface GeneratedPlayerAssemblyInput {
  /** Stable ID already selected by the owning producer. */
  readonly id: PlayerId;
  /** Fictional person identity already selected by the owning producer. */
  readonly identity: PersonIdentity;
  /** Career date against which generated age is applied. */
  readonly referenceDate: GameDate;
  /** Whole generated age in years. */
  readonly ageYears: number;
  /** Stable 0-364 offset that prevents identical birthdays. */
  readonly birthDateJitterDays: number;
  /** Primary natural pitch position selected by producer policy. */
  readonly position: PlayerPosition;
  /** Current abilities selected by division, tier, age, and rarity policy. */
  readonly abilities: PlayerAbilities;
  /** Proposed potential abilities selected by the owning producer policy. */
  readonly potential: PlayerAbilities;
}

/** Stable reasons why generated assembly facts can fail before construction. */
export type GeneratedPlayerAssemblyErrorCode = "invalid_age" | "invalid_birth_date_jitter";

/** Typed content-policy error for malformed generated age facts. */
export class GeneratedPlayerAssemblyError extends Error {
  /** Stable machine-readable failure reason. */
  public readonly code: GeneratedPlayerAssemblyErrorCode;

  /** Creates a generated-player assembly error. */
  public constructor(code: GeneratedPlayerAssemblyErrorCode, message: string) {
    super(message);
    this.name = "GeneratedPlayerAssemblyError";
    this.code = code;
  }
}

/**
 * Assembles explicit generated facts through the validated domain constructor.
 *
 * Producer-specific RNG, division bands, archetypes, rarity, nationality, and
 * slot composition stay outside. This seam derives only shared identity, birth,
 * and initial-state facts. It deliberately passes current and potential
 * abilities through unchanged: `createPlayer` is the typed validation boundary
 * for the 1..20 scale, canonical role caps, and potential-at-least-current
 * invariant. A producer bug must therefore fail loudly instead of being repaired
 * into a different player here.
 */
export function assembleGeneratedPlayer(input: GeneratedPlayerAssemblyInput): CreatedPlayer {
  assertGeneratedAge(input.ageYears);
  assertBirthDateJitter(input.birthDateJitterDays);

  const roleIdentity = generatedRoleIdentityForPosition(input.position);

  return createPlayer({
    id: input.id,
    firstName: input.identity.firstName,
    lastName: input.identity.lastName,
    birthDate: generatedBirthDate(
      input.referenceDate,
      input.ageYears,
      input.birthDateJitterDays,
    ),
    referenceDate: input.referenceDate,
    naturalPositions: [input.position],
    ...roleIdentity,
    abilities: input.abilities,
    potential: input.potential,
    dynamicState: {
      fitness: stateValue(100),
      form: stateValue(50),
      morale: stateValue(50),
    },
  });
}

/**
 * Builds a birthday whose completed civil age equals the generated age.
 *
 * The jitter walks backwards from the exact birthday anniversary but never
 * leaves that completed-age year. This avoids the former `age * 365`
 * approximation, which could place a nominal 17-year-old on the 16-year-old
 * side of a Gregorian birthday after leap years accumulated. The shared civil
 * calendar owner supplies the canonical leap-day clamp.
 */
function generatedBirthDate(
  referenceDate: GameDate,
  ageYears: number,
  birthDateJitterDays: number,
): GameDate {
  return gameDate(
    addCivilYears(Number(referenceDate), -ageYears) - birthDateJitterDays,
  );
}

function assertGeneratedAge(ageYears: number): void {
  if (!Number.isSafeInteger(ageYears) || ageYears < 1) {
    throw new GeneratedPlayerAssemblyError("invalid_age", `Generated player age must be a positive integer: ${ageYears}`);
  }
}

function assertBirthDateJitter(jitterDays: number): void {
  if (!Number.isSafeInteger(jitterDays) || jitterDays < 0 || jitterDays > 364) {
    throw new GeneratedPlayerAssemblyError(
      "invalid_birth_date_jitter",
      `Generated player birth-date jitter must be between 0 and 364: ${jitterDays}`,
    );
  }
}
