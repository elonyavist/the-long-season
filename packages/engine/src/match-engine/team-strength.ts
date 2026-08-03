import {
  canonicalRoleTacticalFacts,
  type CanonicalPlayerRole,
  type FormationSide,
  type Player,
  type PlayerDynamicState,
  type PlayerId,
} from "@game/domain";

/**
 * Ability paths accepted by role weight profiles.
 *
 * Role weights are caller-supplied data. The engine only knows how to read the
 * stable domain ability shape and combine numeric weights deterministically.
 */
export type AbilityWeightKey =
  | "technical.finishing"
  | "technical.passing"
  | "technical.longPassing"
  | "technical.crossing"
  | "technical.dribbling"
  | "technical.technique"
  | "technical.tackling"
  | "technical.penalties"
  | "technical.freeKicks"
  | "physical.pace"
  | "physical.strength"
  | "physical.stamina"
  | "physical.agility"
  | "physical.heading"
  | "mental.positioning"
  | "mental.vision"
  | "mental.anticipation"
  | "mental.composure"
  | "mental.determination"
  | "mental.leadership"
  | "goalkeeping.reflexes"
  | "goalkeeping.handling"
  | "goalkeeping.rushingOut"
  | "goalkeeping.goalkeeperPositioning"
  | "goalkeeping.footwork";

/** Team strength department names excluding the aggregate `overall`. */
export type TeamStrengthDepartment = "attack" | "midfield" | "defense" | "goalkeeper";

/**
 * Final deterministic strength values for one lineup.
 *
 * Values keep the same rough scale as player abilities: a lineup of 10-rated
 * players with normalized role weights will produce department scores near 10.
 */
export interface TeamStrength {
  /** Attacking department strength. */
  readonly attack: number;
  /** Midfield department strength. */
  readonly midfield: number;
  /** Defensive outfield department strength. */
  readonly defense: number;
  /** Goalkeeper department strength. */
  readonly goalkeeper: number;
  /** Average score across all explicit lineup slots. */
  readonly overall: number;
}

/**
 * Role-specific ability weighting supplied by content or callers.
 *
 * The engine does not contain role constants like "striker" or "centre-back".
 * It only consumes the `roleKey` strings and weights passed in this profile.
 */
export interface RoleWeightProfile {
  /** Stable role key referenced by lineup slots. */
  readonly roleKey: string;
  /** Department where this role contributes. */
  readonly department: TeamStrengthDepartment;
  /** Ability weights used to compute this role's player score. */
  readonly abilityWeights: Readonly<Partial<Record<AbilityWeightKey, number>>>;
}

/**
 * One explicit ordered lineup slot.
 *
 * The array order is the only traversal order used by `deriveTeamStrength`.
 *
 * The slot stores only what cannot be derived from something else.
 *
 * `slotId` is identity and carries no tactical meaning - the manager can put any
 * canonical role in any slot, so nothing about the key survives that choice.
 * `canonicalRole` is the choice itself. `side` is the formation's explicit
 * channel, which distinguishes `cb-left` from `cb-right` and is real input
 * rather than a copy of anything.
 *
 * Line, position family, and the role-weight key are *not* stored. They follow
 * from the canonical role, so `canonicalRoleTacticalFacts(...)` and
 * `roleWeightKeyForCanonicalRole(...)` are the one place each is written down
 * and there is no second copy that can drift.
 */
export interface LineupSlot {
  /** Stable slot identifier for caller diagnostics. Carries no tactical meaning. */
  readonly slotId: string;
  /** Player assigned to this slot. */
  readonly playerId: PlayerId;
  /** Canonical football role the manager assigned to this slot. */
  readonly canonicalRole: CanonicalPlayerRole;
  /** Horizontal channel, from the formation slot when stated and the role otherwise. */
  readonly side: FormationSide;
}

/**
 * Total mapping from canonical role to the role-weight profile key.
 *
 * This is the four-way collapse that used to live in the web and CLI Adapters,
 * duplicated four times with three different vocabularies. It lives here now
 * because deciding which ability weights a role uses is a match-engine
 * question, and `satisfies` makes adding a canonical role a build failure
 * instead of a silent fall-through to `midfielder`.
 *
 * The keys name role-weight profiles the caller must supply; the engine still
 * owns no weights of its own, and `deriveTeamStrength` fails deterministically
 * when a profile is missing.
 */
export const ROLE_WEIGHT_KEY_BY_CANONICAL_ROLE = {
  goalkeeper: "gk",
  right_full_back: "defender",
  center_back: "defender",
  left_full_back: "defender",
  defensive_midfielder: "midfielder",
  central_midfielder: "midfielder",
  right_midfielder: "midfielder",
  left_midfielder: "midfielder",
  attacking_midfielder: "midfielder",
  right_winger: "attacker",
  left_winger: "attacker",
  striker: "attacker",
} as const satisfies Readonly<Record<CanonicalPlayerRole, string>>;

/**
 * Returns the role-weight profile key for one canonical role.
 *
 * @example
 * const key = roleWeightKeyForCanonicalRole("left_winger"); // "attacker"
 */
export function roleWeightKeyForCanonicalRole(role: CanonicalPlayerRole): string {
  return ROLE_WEIGHT_KEY_BY_CANONICAL_ROLE[role];
}

/** Input for the single lineup-slot constructor. */
export interface CreateLineupSlotInput {
  /** Stable slot identifier. Identity only. */
  readonly slotId: string;
  /** Player assigned to this slot. */
  readonly playerId: PlayerId;
  /** Canonical football role the manager assigned. */
  readonly canonicalRole: CanonicalPlayerRole;
  /**
   * Channel stated by the formation slot, when there is one.
   *
   * A formation distinguishes `cb-left` from `cb-right` while the role is
   * simply `center_back`, so an explicit channel wins over the role's implied
   * one. Omit it and the role decides.
   */
  readonly side?: FormationSide;
}

/**
 * Builds one lineup slot, defaulting the channel to the role's own.
 *
 * This is the only supported way to make a `LineupSlot`.
 *
 * @example
 * const slot = createLineupSlot({
 *   slotId: "cb-left",
 *   playerId,
 *   canonicalRole: "center_back",
 *   side: "left_center",
 * });
 */
export function createLineupSlot(input: CreateLineupSlotInput): LineupSlot {
  return {
    slotId: input.slotId,
    playerId: input.playerId,
    canonicalRole: input.canonicalRole,
    side: input.side ?? canonicalRoleTacticalFacts(input.canonicalRole).channel,
  };
}

/**
 * Optional multiplier curve for one player dynamic state value.
 *
 * Points are scanned in caller-provided order. The first point whose
 * `maxValueInclusive` contains the state value is used.
 */
export interface StateMultiplierCurve {
  /** Upper inclusive state value bound, normally in the 0-100 range. */
  readonly maxValueInclusive: number;
  /** Multiplier applied when the state value is inside this point. */
  readonly multiplier: number;
}

/**
 * Optional dynamic state multiplier curves.
 *
 * If omitted, fitness/form/morale do not affect strength in this step.
 */
export interface PlayerStateMultiplierCurves {
  /** Fitness curve supplied by caller data. */
  readonly fitness?: readonly StateMultiplierCurve[];
  /** Form curve supplied by caller data. */
  readonly form?: readonly StateMultiplierCurve[];
  /** Morale curve supplied by caller data. */
  readonly morale?: readonly StateMultiplierCurve[];
}

/**
 * Input for deterministic team strength derivation.
 */
export interface DeriveTeamStrengthInput {
  /** Explicit ordered lineup slots. */
  readonly lineup: readonly LineupSlot[];
  /** Player lookup by ID. */
  readonly players: Readonly<Record<PlayerId, Player>>;
  /** Dynamic state lookup by player ID. Required only when curves are supplied. */
  readonly playerStates?: Readonly<Record<PlayerId, PlayerDynamicState>>;
  /** Role profile lookup by role key. */
  readonly roleWeights: Readonly<Record<string, RoleWeightProfile>>;
  /** Optional caller-supplied state multiplier curves. */
  readonly stateMultiplierCurves?: PlayerStateMultiplierCurves;
}

/** Error categories exposed by team-strength calculation. */
export type TeamStrengthErrorCode =
  | "empty_lineup"
  | "missing_player"
  | "missing_player_state"
  | "missing_role_weight"
  | "invalid_role_weight";

/**
 * Typed error thrown when team-strength input is incomplete or invalid.
 *
 * @example
 * if (error instanceof TeamStrengthError && error.code === "missing_player") {
 *   // Caller can report a bad lineup fixture.
 * }
 */
export class TeamStrengthError extends Error {
  /** Machine-readable failure reason. */
  public readonly code: TeamStrengthErrorCode;

  /**
   * Creates a team-strength error.
   */
  public constructor(code: TeamStrengthErrorCode, message: string) {
    super(message);
    this.name = "TeamStrengthError";
    this.code = code;
  }
}

/**
 * Calculates deterministic strength for one explicit lineup.
 *
 * @example
 * const strength = deriveTeamStrength({ lineup, players, roleWeights });
 */
export function deriveTeamStrength(input: DeriveTeamStrengthInput): TeamStrength {
  if (input.lineup.length === 0) {
    throw new TeamStrengthError("empty_lineup", "Lineup must include at least one slot");
  }

  const totals = createDepartmentTotals();
  let overallTotal = 0;

  for (const slot of input.lineup) {
    const player = input.players[slot.playerId];
    if (player === undefined) {
      throw new TeamStrengthError("missing_player", `Missing player for lineup slot ${slot.slotId}: ${slot.playerId}`);
    }

    const roleKey = roleWeightKeyForCanonicalRole(slot.canonicalRole);
    const roleWeight = input.roleWeights[roleKey];
    if (roleWeight === undefined) {
      throw new TeamStrengthError(
        "missing_role_weight",
        `Missing role weight profile for ${slot.canonicalRole}: ${roleKey}`,
      );
    }

    const roleScore = deriveRoleScore(player, roleWeight);
    const multiplier = deriveStateMultiplier(slot.playerId, input.playerStates, input.stateMultiplierCurves);
    const slotScore = roleScore * multiplier;

    totals[roleWeight.department].total += slotScore;
    totals[roleWeight.department].count += 1;
    overallTotal += slotScore;
  }

  return {
    attack: averageDepartment(totals.attack),
    midfield: averageDepartment(totals.midfield),
    defense: averageDepartment(totals.defense),
    goalkeeper: averageDepartment(totals.goalkeeper),
    overall: overallTotal / input.lineup.length,
  };
}

/**
 * Calculates one player score for one role profile.
 */
function deriveRoleScore(player: Player, roleWeight: RoleWeightProfile): number {
  let weightedTotal = 0;
  let weightTotal = 0;

  for (const abilityKey of ABILITY_WEIGHT_KEYS) {
    const weight = roleWeight.abilityWeights[abilityKey];
    if (weight === undefined) {
      continue;
    }

    if (!Number.isFinite(weight) || weight < 0) {
      throw new TeamStrengthError(
        "invalid_role_weight",
        `Role weight must be finite and non-negative for ${roleWeight.roleKey}.${abilityKey}: ${weight}`,
      );
    }

    weightedTotal += readAbility(player, abilityKey) * weight;
    weightTotal += weight;
  }

  if (weightTotal === 0) {
    throw new TeamStrengthError("invalid_role_weight", `Role must include at least one positive weight: ${roleWeight.roleKey}`);
  }

  return weightedTotal / weightTotal;
}

/**
 * Applies optional dynamic-state multipliers supplied by caller data.
 */
function deriveStateMultiplier(
  playerId: PlayerId,
  playerStates: Readonly<Record<PlayerId, PlayerDynamicState>> | undefined,
  curves: PlayerStateMultiplierCurves | undefined,
): number {
  if (curves === undefined) {
    return 1;
  }

  const playerState = playerStates?.[playerId];
  if (playerState === undefined) {
    throw new TeamStrengthError("missing_player_state", `Missing player state for multiplier curves: ${playerId}`);
  }

  return (
    resolveCurveMultiplier(Number(playerState.fitness), curves.fitness) *
    resolveCurveMultiplier(Number(playerState.form), curves.form) *
    resolveCurveMultiplier(Number(playerState.morale), curves.morale)
  );
}

/**
 * Resolves one optional state curve to a multiplier.
 */
function resolveCurveMultiplier(value: number, curve: readonly StateMultiplierCurve[] | undefined): number {
  if (curve === undefined) {
    return 1;
  }

  for (const point of curve) {
    if (value <= point.maxValueInclusive) {
      return point.multiplier;
    }
  }

  return 1;
}

/**
 * Reads one named ability from a player.
 */
function readAbility(player: Player, abilityKey: AbilityWeightKey): number {
  switch (abilityKey) {
    case "technical.finishing":
      return player.abilities.technical.finishing;
    case "technical.passing":
      return player.abilities.technical.passing;
    case "technical.longPassing":
      return player.abilities.technical.longPassing;
    case "technical.crossing":
      return player.abilities.technical.crossing;
    case "technical.dribbling":
      return player.abilities.technical.dribbling;
    case "technical.technique":
      return player.abilities.technical.technique;
    case "technical.tackling":
      return player.abilities.technical.tackling;
    case "technical.penalties":
      return player.abilities.technical.penalties;
    case "technical.freeKicks":
      return player.abilities.technical.freeKicks;
    case "physical.pace":
      return player.abilities.physical.pace;
    case "physical.strength":
      return player.abilities.physical.strength;
    case "physical.stamina":
      return player.abilities.physical.stamina;
    case "physical.agility":
      return player.abilities.physical.agility;
    case "physical.heading":
      return player.abilities.physical.heading;
    case "mental.positioning":
      return player.abilities.mental.positioning;
    case "mental.vision":
      return player.abilities.mental.vision;
    case "mental.anticipation":
      return player.abilities.mental.anticipation;
    case "mental.composure":
      return player.abilities.mental.composure;
    case "mental.determination":
      return player.abilities.mental.determination;
    case "mental.leadership":
      return player.abilities.mental.leadership;
    case "goalkeeping.reflexes":
      return player.abilities.goalkeeping.reflexes;
    case "goalkeeping.handling":
      return player.abilities.goalkeeping.handling;
    case "goalkeeping.rushingOut":
      return player.abilities.goalkeeping.rushingOut;
    case "goalkeeping.goalkeeperPositioning":
      return player.abilities.goalkeeping.goalkeeperPositioning;
    case "goalkeeping.footwork":
      return player.abilities.goalkeeping.footwork;
  }
}

/**
 * Builds zeroed department totals.
 */
function createDepartmentTotals(): Record<TeamStrengthDepartment, { count: number; total: number }> {
  return {
    attack: { count: 0, total: 0 },
    midfield: { count: 0, total: 0 },
    defense: { count: 0, total: 0 },
    goalkeeper: { count: 0, total: 0 },
  };
}

/**
 * Converts one department total to an average score.
 */
function averageDepartment(department: { readonly count: number; readonly total: number }): number {
  return department.count === 0 ? 0 : department.total / department.count;
}

/**
 * Explicit ability traversal order used for deterministic role-score math.
 */
const ABILITY_WEIGHT_KEYS: readonly AbilityWeightKey[] = [
  "technical.finishing",
  "technical.passing",
  "technical.longPassing",
  "technical.crossing",
  "technical.dribbling",
  "technical.technique",
  "technical.tackling",
  "technical.penalties",
  "technical.freeKicks",
  "physical.pace",
  "physical.strength",
  "physical.stamina",
  "physical.agility",
  "physical.heading",
  "mental.positioning",
  "mental.vision",
  "mental.anticipation",
  "mental.composure",
  "mental.determination",
  "mental.leadership",
  "goalkeeping.reflexes",
  "goalkeeping.handling",
  "goalkeeping.rushingOut",
  "goalkeeping.goalkeeperPositioning",
  "goalkeeping.footwork",
];
