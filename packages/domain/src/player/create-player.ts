import {
  createPlayerRoleIdentity,
  PLAYER_ROLES,
  type Player,
  type PlayerArchetype,
  type PlayerDynamicState,
  type PlayerPosition,
  type PlayerRole,
  type PlayerRoleFamiliarityLevel,
  type PlayerRoleIdentity,
  type RoleIdentifiedPlayer,
} from "../entities/player.entity.ts";
import { playerId } from "../types/ids.ts";
import { gameDate, type GameDate } from "../value-objects/game-date.ts";
import { stateValue } from "../value-objects/rating.ts";
import { PLAYER_ABILITY_KEYS, readPlayerAbility } from "./player-abilities.ts";
import { hardCapForRoleAbility } from "./player-role-profile.ts";

/**
 * Every position a new player may declare.
 *
 * `satisfies` rather than a bare annotation, and every member of
 * `PlayerPosition` is required: this list is the *runtime* guard, so a position
 * added to the type and forgotten here is a position the constructor silently
 * refuses. Only a test caught that when `rm`/`lm` arrived, because an
 * incomplete `readonly PlayerPosition[]` is a perfectly valid array.
 *
 * Exported because anything that has to visit every position - a suitability
 * sweep, a squad generator, a report - would otherwise hand-write the list, and
 * a hand-written copy is one that stops at `lw` after `rm`/`lm` arrive.
 */
export const PLAYER_POSITIONS = [
  "gk",
  "rb",
  "cb",
  "lb",
  "rwb",
  "lwb",
  "dm",
  "cm",
  "am",
  "rm",
  "lm",
  "rw",
  "lw",
  "st",
] as const satisfies readonly PlayerPosition[];

// A build failure the moment a position exists in the type but not in the list
// above. The assignment runs that way round on purpose: `satisfies` already
// proves every entry is a real position, and the gap that actually bites is the
// opposite one - a position the type allows and the constructor rejects.
const _everyPositionIsConstructible: (typeof PLAYER_POSITIONS)[number] =
  null as unknown as PlayerPosition;
void _everyPositionIsConstructible;

const POSITION_BY_ROLE: Readonly<Record<PlayerRole, readonly PlayerPosition[]>> = {
  goalkeeper: ["gk"],
  center_back: ["cb"],
  full_back: ["rb", "lb"],
  wing_back: ["rwb", "lwb"],
  defensive_midfielder: ["dm"],
  central_midfielder: ["cm"],
  attacking_midfielder: ["am"],
  wide_midfielder: ["rm", "lm"],
  winger: ["rw", "lw"],
  striker: ["st"],
};

/**
 * Returns every pitch position that naturally represents one generation role.
 *
 * Player construction already owns this mapping to reject mismatched role
 * identities. Exposing the same immutable positions lets content plan a role
 * before constructing the player without maintaining a second reverse table.
 */
export function naturalPositionsForPlayerRole(
  role: PlayerRole,
): readonly PlayerPosition[] {
  return POSITION_BY_ROLE[role];
}

const ROLE_FAMILIARITY_LEVELS: readonly PlayerRoleFamiliarityLevel[] = ["natural", "adapted", "weak"];

/** Complete generated player facts plus the date and volatile state used for validation. */
export type CreatePlayerInput = RoleIdentifiedPlayer & {
  /** Date against which the birth date is validated. */
  readonly referenceDate: GameDate;
  /** Initial volatile state persisted alongside the stable player. */
  readonly dynamicState: PlayerDynamicState;
};

/** Validated stable player and its validated initial dynamic state. */
export interface CreatedPlayer {
  /** Complete stable player identity and football attributes. */
  readonly player: RoleIdentifiedPlayer;
  /** Volatile values validated on their 0-100 scale. */
  readonly dynamicState: PlayerDynamicState;
}

/** Stable reasons why new player construction can fail. */
export type PlayerConstructionErrorCode =
  | "invalid_player_id"
  | "invalid_name"
  | "invalid_birth_date"
  | "birth_date_not_before_reference"
  | "missing_natural_position"
  | "invalid_natural_position"
  | "duplicate_natural_position"
  | "incomplete_role_identity"
  | "invalid_role_identity"
  | "role_position_mismatch"
  | "invalid_current_ability"
  | "invalid_potential_ability"
  | "potential_below_current"
  | "ability_exceeds_role_cap"
  | "invalid_dynamic_state";

/** Typed domain error returned by the one new-player construction boundary. */
export class PlayerConstructionError extends Error {
  /** Stable machine-readable failure reason. */
  public readonly code: PlayerConstructionErrorCode;
  /** Optional field path that caused the failure. */
  public readonly field: string | undefined;

  /** Creates one typed construction failure. */
  public constructor(code: PlayerConstructionErrorCode, message: string, field?: string) {
    super(message);
    this.name = "PlayerConstructionError";
    this.code = code;
    this.field = field;
  }
}

/**
 * Constructs one complete new player after validating every durable invariant.
 *
 * This function does not normalize historical data and never uses randomness.
 * Legacy compatibility belongs at the save-loading boundary; generation must
 * provide explicit, already-decided facts here.
 */
export function createPlayer(input: CreatePlayerInput): CreatedPlayer {
  const id = validatedPlayerId(input.id);
  const firstName = validatedName(input.firstName, "firstName");
  const lastName = validatedName(input.lastName, "lastName");
  const birthDate = validatedGameDate(input.birthDate, "birthDate");
  const referenceDate = validatedGameDate(input.referenceDate, "referenceDate");

  if (Number(birthDate) >= Number(referenceDate)) {
    fail(
      "birth_date_not_before_reference",
      `Player birth date must be before reference date: ${String(birthDate)} >= ${String(referenceDate)}`,
      "birthDate",
    );
  }

  const naturalPositions = validatedNaturalPositions(input.naturalPositions);
  const roleIdentity = validatedRoleIdentity(input);
  assertRolePositionMatch(roleIdentity.primaryRole, naturalPositions);
  assertAbilities(input.abilities, input.potential, roleIdentity.primaryRole);
  const dynamicState = validatedDynamicState(input.dynamicState);

  const player: RoleIdentifiedPlayer = {
    id,
    firstName,
    lastName,
    birthDate,
    naturalPositions,
    ...roleIdentity,
    abilities: input.abilities,
    potential: input.potential,
  };

  return { player, dynamicState };
}

function validatedPlayerId(value: unknown): RoleIdentifiedPlayer["id"] {
  try {
    return playerId(typeof value === "string" ? value : "");
  } catch {
    return fail("invalid_player_id", `Invalid player ID: ${String(value)}`, "id");
  }
}

function validatedName(value: unknown, field: "firstName" | "lastName"): string {
  if (typeof value !== "string" || value.trim().length === 0) {
    return fail("invalid_name", `Player ${field} must not be blank`, field);
  }

  return value;
}

function validatedGameDate(value: unknown, field: "birthDate" | "referenceDate"): GameDate {
  try {
    return gameDate(typeof value === "number" ? value : Number.NaN);
  } catch {
    return fail("invalid_birth_date", `Invalid ${field}: ${String(value)}`, field);
  }
}

function validatedNaturalPositions(value: unknown): readonly PlayerPosition[] {
  if (!Array.isArray(value) || value.length === 0) {
    return fail("missing_natural_position", "A new player needs at least one natural position", "naturalPositions");
  }

  const positions: PlayerPosition[] = [];
  const seen = new Set<PlayerPosition>();

  for (const candidate of value) {
    if (!PLAYER_POSITIONS.includes(candidate as PlayerPosition)) {
      return fail(
        "invalid_natural_position",
        `Unknown natural position: ${String(candidate)}`,
        "naturalPositions",
      );
    }

    const position = candidate as PlayerPosition;
    if (seen.has(position)) {
      return fail(
        "duplicate_natural_position",
        `Duplicate natural position: ${position}`,
        "naturalPositions",
      );
    }

    seen.add(position);
    positions.push(position);
  }

  return positions;
}

function validatedRoleIdentity(input: CreatePlayerInput): PlayerRoleIdentity {
  const candidate = input as unknown as Partial<PlayerRoleIdentity>;
  const requiredFields: readonly (keyof PlayerRoleIdentity)[] = [
    "primaryRole",
    "archetype",
    "naturalRoles",
    "adaptedRoles",
    "weakRoles",
    "roleFamiliarity",
  ];

  if (requiredFields.some((field) => candidate[field] === undefined || candidate[field] === null)) {
    return fail("incomplete_role_identity", "New players need a complete role identity", "primaryRole");
  }

  if (!PLAYER_ROLES.includes(candidate.primaryRole as PlayerRole)) {
    return fail("invalid_role_identity", `Unknown primary role: ${String(candidate.primaryRole)}`, "primaryRole");
  }

  const primaryRole = candidate.primaryRole as PlayerRole;
  if (typeof candidate.archetype !== "string") {
    return fail("invalid_role_identity", "Player archetype must be a known string value", "archetype");
  }

  const naturalRoles = validatedRoleList(candidate.naturalRoles, "naturalRoles");
  const adaptedRoles = validatedRoleList(candidate.adaptedRoles, "adaptedRoles");
  const weakRoles = validatedRoleList(candidate.weakRoles, "weakRoles");
  const roleFamiliarity = validatedRoleFamiliarity(candidate.roleFamiliarity);

  try {
    return createPlayerRoleIdentity({
      primaryRole,
      archetype: candidate.archetype as PlayerArchetype,
      naturalRoles,
      adaptedRoles,
      weakRoles,
      roleFamiliarity,
    });
  } catch (error) {
    return fail(
      "invalid_role_identity",
      error instanceof Error ? error.message : "Invalid player role identity",
      "primaryRole",
    );
  }
}

function validatedRoleList(value: unknown, field: keyof PlayerRoleIdentity): readonly PlayerRole[] {
  if (!Array.isArray(value) || value.some((role) => !PLAYER_ROLES.includes(role as PlayerRole))) {
    return fail("invalid_role_identity", `Invalid role list: ${field}`, field);
  }

  return [...value] as PlayerRole[];
}

function validatedRoleFamiliarity(
  value: unknown,
): Readonly<Partial<Record<PlayerRole, PlayerRoleFamiliarityLevel>>> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return fail("invalid_role_identity", "Role familiarity must be a role map", "roleFamiliarity");
  }

  for (const [role, familiarity] of Object.entries(value)) {
    if (
      !PLAYER_ROLES.includes(role as PlayerRole) ||
      !ROLE_FAMILIARITY_LEVELS.includes(familiarity as PlayerRoleFamiliarityLevel)
    ) {
      return fail("invalid_role_identity", `Invalid role familiarity: ${role}=${String(familiarity)}`, "roleFamiliarity");
    }
  }

  return { ...(value as Readonly<Partial<Record<PlayerRole, PlayerRoleFamiliarityLevel>>>) };
}

function assertRolePositionMatch(role: PlayerRole, naturalPositions: readonly PlayerPosition[]): void {
  if (!naturalPositions.some((position) => POSITION_BY_ROLE[role].includes(position))) {
    fail(
      "role_position_mismatch",
      `Primary role ${role} does not match natural positions: ${naturalPositions.join(", ")}`,
      "naturalPositions",
    );
  }
}

function assertAbilities(
  current: Player["abilities"],
  potential: Player["potential"],
  role: PlayerRole,
): void {
  for (const key of PLAYER_ABILITY_KEYS) {
    const currentValue = safeAbilityNumber(current, key, "invalid_current_ability");
    const potentialValue = safeAbilityNumber(potential, key, "invalid_potential_ability");

    if (potentialValue < currentValue) {
      fail(
        "potential_below_current",
        `Potential ability cannot be below current ability: ${key}=${potentialValue}<${currentValue}`,
        `potential.${key}`,
      );
    }

    const cap = hardCapForRoleAbility(role, key);
    if (cap !== undefined && (currentValue > cap || potentialValue > cap)) {
      fail(
        "ability_exceeds_role_cap",
        `Ability exceeds ${role} hard cap: ${key} max ${cap}`,
        currentValue > cap ? `abilities.${key}` : `potential.${key}`,
      );
    }
  }
}

function safeAbilityNumber(
  abilities: Player["abilities"],
  key: (typeof PLAYER_ABILITY_KEYS)[number],
  errorCode: "invalid_current_ability" | "invalid_potential_ability",
): number {
  let value: number;
  try {
    value = Number(readPlayerAbility(abilities, key));
  } catch {
    return fail(errorCode, `Missing or malformed ability: ${key}`, key);
  }

  if (!Number.isFinite(value) || value < 1 || value > 20) {
    return fail(errorCode, `New player ability must be between 1 and 20: ${key}=${value}`, key);
  }

  return value;
}

function validatedDynamicState(value: PlayerDynamicState): PlayerDynamicState {
  try {
    return {
      fitness: stateValue(Number(value?.fitness)),
      form: stateValue(Number(value?.form)),
      morale: stateValue(Number(value?.morale)),
    };
  } catch (error) {
    return fail(
      "invalid_dynamic_state",
      error instanceof Error ? error.message : "Invalid player dynamic state",
      "dynamicState",
    );
  }
}

function fail(code: PlayerConstructionErrorCode, message: string, field?: string): never {
  throw new PlayerConstructionError(code, message, field);
}
