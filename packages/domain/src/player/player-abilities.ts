import type { PlayerAbilities } from "../entities/player.entity.ts";
import { brand, type Brand } from "../types/brand.ts";
import { abilityValue, type AbilityValue } from "../value-objects/rating.ts";

/** Stable path metadata for every ability stored on a player. */
const PLAYER_ABILITY_PATHS = [
  ["technical.finishing", "technical", "finishing"],
  ["technical.passing", "technical", "passing"],
  ["technical.longPassing", "technical", "longPassing"],
  ["technical.crossing", "technical", "crossing"],
  ["technical.dribbling", "technical", "dribbling"],
  ["technical.technique", "technical", "technique"],
  ["technical.tackling", "technical", "tackling"],
  ["technical.penalties", "technical", "penalties"],
  ["technical.freeKicks", "technical", "freeKicks"],
  ["physical.pace", "physical", "pace"],
  ["physical.strength", "physical", "strength"],
  ["physical.stamina", "physical", "stamina"],
  ["physical.agility", "physical", "agility"],
  ["physical.heading", "physical", "heading"],
  ["mental.positioning", "mental", "positioning"],
  ["mental.vision", "mental", "vision"],
  ["mental.anticipation", "mental", "anticipation"],
  ["mental.composure", "mental", "composure"],
  ["mental.determination", "mental", "determination"],
  ["mental.leadership", "mental", "leadership"],
  ["goalkeeping.reflexes", "goalkeeping", "reflexes"],
  ["goalkeeping.handling", "goalkeeping", "handling"],
  ["goalkeeping.rushingOut", "goalkeeping", "rushingOut"],
  ["goalkeeping.goalkeeperPositioning", "goalkeeping", "goalkeeperPositioning"],
  ["goalkeeping.footwork", "goalkeeping", "footwork"],
] as const;

/** Canonical path key for one of the 25 player abilities. */
export type PlayerAbilityKey = (typeof PLAYER_ABILITY_PATHS)[number][0];

/** Deterministic traversal order shared by generation, engine, and storage. */
export const PLAYER_ABILITY_KEYS: readonly PlayerAbilityKey[] = PLAYER_ABILITY_PATHS.map(([key]) => key);

/** Unweighted diagnostic over all 25 attributes; it is not football quality. */
export type RawDiagnosticAbilityAverage = Brand<number, "RawDiagnosticAbilityAverage">;

/** Current football ability evaluated for one explicit role profile. */
export type RoleCurrentAbility = Brand<number, "RoleCurrentAbility">;

/** Potential football ability evaluated with the same explicit role profile. */
export type RolePotentialAbility = Brand<number, "RolePotentialAbility">;

/** Minimal weight contract consumed by current and potential role evaluation. */
export interface AbilityWeightProfile {
  /** Non-negative weights by canonical ability key. Omitted keys weigh zero. */
  readonly weights: Readonly<Partial<Record<PlayerAbilityKey, number>>>;
}

/** Error raised when a role profile cannot produce a meaningful weighted value. */
export class InvalidAbilityWeightProfileError extends Error {
  public constructor(message: string) {
    super(message);
    this.name = "InvalidAbilityWeightProfileError";
  }
}

/** Reads one ability through its canonical path key. */
export function readPlayerAbility(abilities: PlayerAbilities, key: PlayerAbilityKey): AbilityValue {
  const path = PLAYER_ABILITY_PATHS.find(([candidate]) => candidate === key);
  if (path === undefined) {
    throw new RangeError(`Unknown player ability key: ${String(key)}`);
  }

  const [, group, field] = path;
  return (abilities[group] as unknown as Readonly<Record<string, AbilityValue>>)[field] as AbilityValue;
}

/**
 * Maps all 25 abilities in canonical order and rebuilds the complete shape.
 *
 * The internal records are populated only from the closed canonical path list;
 * the final cast keeps that proof local instead of leaking partial structures.
 */
export function mapPlayerAbilities(
  abilities: PlayerAbilities,
  mapper: (value: AbilityValue, key: PlayerAbilityKey, index: number) => AbilityValue,
): PlayerAbilities {
  const mapped: Record<keyof PlayerAbilities, Record<string, AbilityValue>> = {
    technical: {},
    physical: {},
    mental: {},
    goalkeeping: {},
  };

  PLAYER_ABILITY_PATHS.forEach(([key, group, field], index) => {
    mapped[group][field] = mapper(readPlayerAbility(abilities, key), key, index);
  });

  return mapped as unknown as PlayerAbilities;
}

/** Folds all 25 abilities in canonical order without allocating a flat copy. */
export function foldPlayerAbilities<Result>(
  abilities: PlayerAbilities,
  initial: Result,
  reducer: (result: Result, value: AbilityValue, key: PlayerAbilityKey, index: number) => Result,
): Result {
  return PLAYER_ABILITY_KEYS.reduce(
    (result, key, index) => reducer(result, readPlayerAbility(abilities, key), key, index),
    initial,
  );
}

/** Returns the unweighted 25-attribute diagnostic average without rounding. */
export function rawDiagnosticAbilityAverage(abilities: PlayerAbilities): RawDiagnosticAbilityAverage {
  const total = foldPlayerAbilities(abilities, 0, (sum, value) => sum + Number(value));
  return brand<number, "RawDiagnosticAbilityAverage">(total / PLAYER_ABILITY_KEYS.length);
}

/** Returns current ability evaluated by an explicit role weight profile. */
export function roleCurrentAbility(
  abilities: PlayerAbilities,
  profile: AbilityWeightProfile,
): RoleCurrentAbility {
  return brand<number, "RoleCurrentAbility">(weightedAbility(abilities, profile));
}

/** Returns potential ability evaluated with the same role weight contract. */
export function rolePotentialAbility(
  potential: PlayerAbilities,
  profile: AbilityWeightProfile,
): RolePotentialAbility {
  return brand<number, "RolePotentialAbility">(weightedAbility(potential, profile));
}

/** Raises every potential attribute below current while preserving higher values. */
export function potentialAtLeastCurrent(current: PlayerAbilities, potential: PlayerAbilities): PlayerAbilities {
  return mapPlayerAbilities(potential, (value, key) =>
    abilityValue(Math.max(Number(value), Number(readPlayerAbility(current, key)))),
  );
}

/** Returns whether every potential attribute is at least its current counterpart. */
export function isPotentialAtLeastCurrent(current: PlayerAbilities, potential: PlayerAbilities): boolean {
  return foldPlayerAbilities(
    potential,
    true,
    (valid, value, key) => valid && Number(value) >= Number(readPlayerAbility(current, key)),
  );
}

function weightedAbility(abilities: PlayerAbilities, profile: AbilityWeightProfile): number {
  let weightedTotal = 0;
  let totalWeight = 0;

  for (const key of PLAYER_ABILITY_KEYS) {
    const weight = profile.weights[key] ?? 0;
    if (!Number.isFinite(weight) || weight < 0) {
      throw new InvalidAbilityWeightProfileError(`Ability weight must be finite and non-negative: ${key}=${weight}`);
    }

    weightedTotal += Number(readPlayerAbility(abilities, key)) * weight;
    totalWeight += weight;
  }

  if (totalWeight <= 0) {
    throw new InvalidAbilityWeightProfileError("Ability weight profile must contain at least one positive weight");
  }

  return weightedTotal / totalWeight;
}
