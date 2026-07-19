import {
  abilityValue,
  createPlayer,
  gameDate,
  mapPlayerAbilities,
  potentialAtLeastCurrent,
  stateValue,
  type CreatedPlayer,
  type GameDate,
  type PersonIdentity,
  type PlayerAbilities,
  type PlayerId,
  type PlayerPosition,
} from "@game/domain";

import { generatedRoleIdentityForPosition } from "./player-role-identity.ts";
import { capPlayerAbilitiesForRole } from "./player-role-templates.ts";

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
 * slot composition stay outside. This seam only applies shared construction
 * policy: generated attributes use 1..20, role-incoherent values obey canonical
 * caps, potential never trails current, role identity follows the natural
 * position, and initial state is 100/50/50.
 */
export function assembleGeneratedPlayer(input: GeneratedPlayerAssemblyInput): CreatedPlayer {
  assertGeneratedAge(input.ageYears);
  assertBirthDateJitter(input.birthDateJitterDays);

  const roleIdentity = generatedRoleIdentityForPosition(input.position);
  const abilities = capPlayerAbilitiesForRole(generatedScaleAbilities(input.abilities), roleIdentity.primaryRole);
  const potential = potentialAtLeastCurrent(
    abilities,
    capPlayerAbilitiesForRole(generatedScaleAbilities(input.potential), roleIdentity.primaryRole),
  );

  return createPlayer({
    id: input.id,
    firstName: input.identity.firstName,
    lastName: input.identity.lastName,
    birthDate: gameDate(Number(input.referenceDate) - input.ageYears * 365 - input.birthDateJitterDays),
    referenceDate: input.referenceDate,
    naturalPositions: [input.position],
    ...roleIdentity,
    abilities,
    potential,
    dynamicState: {
      fitness: stateValue(100),
      form: stateValue(50),
      morale: stateValue(50),
    },
  });
}

function generatedScaleAbilities(abilities: PlayerAbilities): PlayerAbilities {
  return mapPlayerAbilities(abilities, (value) => abilityValue(Math.max(1, Number(value))));
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
