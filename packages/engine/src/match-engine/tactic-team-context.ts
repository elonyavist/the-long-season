import {
  createSelectedLineup,
  createTacticSetup,
  TacticContractError,
  type MatchTacticsCalibrationConfig,
  type Player,
  type PlayerDynamicState,
  type PlayerId,
  type SelectedLineup,
  type TacticContractErrorCode,
  type TacticSetup,
} from "@game/domain";

import type {
  MatchPlayerIncidentProfile,
  MatchTacticalDistributionInput,
  MatchTeamContext,
} from "./match-context.ts";
import {
  createLineupSlot,
  deriveLineupSlotScores,
  roleWeightKeyForCanonicalRole,
  teamStrengthFromSlotScores,
  TeamStrengthError,
  type DeriveTeamStrengthInput,
  type LineupSlot,
  type PlayerStateMultiplierCurves,
  type RoleWeightProfile,
  type TeamStrength,
} from "./team-strength.ts";
import { deriveTacticalShapeProfile, type TacticalShapeProfile } from "./tactical-shape.ts";

/** Error categories exposed by selected tactic/team context building. */
export type TacticTeamContextErrorCode =
  | "invalid_required_lineup_size"
  | "invalid_lineup_size"
  | "empty_lineup"
  | "missing_player"
  | "unknown_player"
  | "duplicate_player"
  | "missing_slot_key"
  | "duplicate_slot_key"
  | "invalid_canonical_role"
  | "missing_role_weight"
  | "invalid_mentality"
  | "invalid_tactic_value"
  | "team_strength_error";

/**
 * Input for building one engine match-team context from selected setup data.
 */
export interface BuildTacticTeamContextInput {
  /** User/content selected lineup for one club. */
  readonly lineup: SelectedLineup;
  /** User/content tactical setup for one club. */
  readonly tactic: TacticSetup;
  /** Explicit expected lineup size for this match or competition context. */
  readonly requiredLineupSize: number;
  /** Player lookup available to this selected setup. */
  readonly players: Readonly<Record<PlayerId, Player>>;
  /** Role profile lookup available to the selected lineup. */
  readonly roleWeights: Readonly<Record<string, RoleWeightProfile>>;
  /** Optional dynamic state lookup for future state multiplier curves. */
  readonly playerStates?: Readonly<Record<PlayerId, PlayerDynamicState>>;
  /** Optional caller-supplied dynamic state multiplier curves. */
  readonly stateMultiplierCurves?: PlayerStateMultiplierCurves;
  /**
   * Versioned match-tactics calibration, supplied by a composition root.
   *
   * The engine imports no content, so the numbers arrive here. It is required
   * because the minute loop simulates from the intrinsic shape this produces.
   * There is no default calibration, because a default would silently decide
   * football balance that content owns.
   */
  readonly matchTacticsCalibration: MatchTacticsCalibrationConfig;
}

/** Input for deriving both readings of one lineup's per-slot quality. */
export interface DeriveTeamShapeAndStrengthInput extends DeriveTeamStrengthInput {
  /** Versioned match-tactics calibration, supplied by a composition root. */
  readonly matchTacticsCalibration: MatchTacticsCalibrationConfig;
}

/** Department strength and intrinsic shape for one lineup. */
export interface TeamShapeAndStrength {
  /** Aggregate department strength consumed by resolution policies. */
  readonly strength: TeamStrength;
  /** Intrinsic tactical shape consumed by the route model. */
  readonly shape: TacticalShapeProfile;
}

/**
 * Derives department strength and intrinsic shape from one scoring pass.
 *
 * Every producer of a `MatchTeamContext` needs both, and both are readings of
 * the same per-slot quality. Scoring the lineup twice would be two places one
 * number could drift - and worse, the two readings could end up describing
 * different lineups. This helper exists so no caller can do that by accident.
 *
 * @example
 * const { strength, shape } = deriveTeamShapeAndStrength({
 *   lineup,
 *   players,
 *   roleWeights,
 *   matchTacticsCalibration,
 * });
 */
export function deriveTeamShapeAndStrength(input: DeriveTeamShapeAndStrengthInput): TeamShapeAndStrength {
  const { matchTacticsCalibration, ...strengthInput } = input;
  const slotScores = deriveLineupSlotScores(strengthInput);

  return {
    strength: teamStrengthFromSlotScores(slotScores),
    shape: deriveTacticalShapeProfile({ slotScores, calibration: matchTacticsCalibration }),
  };
}

/**
 * Typed error thrown when selected lineup/tactic data cannot become a team context.
 *
 * @example
 * if (error instanceof TacticTeamContextError && error.code === "unknown_player") {
 *   // Caller can point to a selected player that is not available.
 * }
 */
export class TacticTeamContextError extends Error {
  /** Machine-readable failure reason. */
  public readonly code: TacticTeamContextErrorCode;

  /** Creates a selected tactic/team context error. */
  public constructor(code: TacticTeamContextErrorCode, message: string) {
    super(message);
    this.name = "TacticTeamContextError";
    this.code = code;
  }
}

/**
 * Builds one current engine `MatchTeamContext` from selected lineup and tactic data.
 *
 * The builder performs only interpretation needed by the match engine: selected
 * slots become ordered `LineupSlot` values, all five tactic inputs become
 * `MatchTacticalDistributionInput`, and quality is derived with existing
 * role-weight logic.
 *
 * Slots are scored exactly once. Department strength and intrinsic tactical
 * shape are two readings of the same per-slot quality, so deriving that quality
 * twice would be two places one number could drift.
 *
 * A club the manager has not selected is an ordinary caller of this builder,
 * not a special case: it supplies its own squad, lineup, and tactic and gets
 * the same context back.
 *
 * @example
 * const team = buildTacticTeamContext({
 *   lineup,
 *   tactic,
 *   requiredLineupSize: 11,
 *   players,
 *   roleWeights,
 * });
 */
export function buildTacticTeamContext(input: BuildTacticTeamContextInput): MatchTeamContext {
  assertValidRequiredLineupSize(input.requiredLineupSize);

  const selectedLineup = createSelectedLineupOrThrow(input.lineup);
  const tactic = createTacticSetupOrThrow(input.tactic);

  if (selectedLineup.slots.length !== input.requiredLineupSize) {
    throw new TacticTeamContextError(
      "invalid_lineup_size",
      `Selected lineup must include exactly ${input.requiredLineupSize} slots: ${selectedLineup.slots.length}`,
    );
  }

  const lineup = selectedLineup.slots.map((slot): LineupSlot => {
    if (input.players[slot.playerId] === undefined) {
      throw new TacticTeamContextError("unknown_player", `Selected player is not available: ${slot.playerId}`);
    }

    const roleKey = roleWeightKeyForCanonicalRole(slot.canonicalRole);
    if (input.roleWeights[roleKey] === undefined) {
      throw new TacticTeamContextError(
        "missing_role_weight",
        `Missing role weight profile for ${slot.canonicalRole}: ${roleKey}`,
      );
    }

    return createLineupSlot({
      slotId: slot.slotKey,
      playerId: slot.playerId,
      canonicalRole: slot.canonicalRole,
    });
  });

  try {
    const { strength, shape } = deriveTeamShapeAndStrength({
      lineup,
      players: input.players,
      roleWeights: input.roleWeights,
      matchTacticsCalibration: input.matchTacticsCalibration,
      ...(input.playerStates === undefined ? {} : { playerStates: input.playerStates }),
      ...(input.stateMultiplierCurves === undefined ? {} : { stateMultiplierCurves: input.stateMultiplierCurves }),
    });

    return {
      clubId: selectedLineup.clubId,
      lineup,
      strength,
      shape,
      tacticalDistribution: tacticToMatchDistribution(tactic),
      incidentProfiles: lineup.map((slot) =>
        createMatchPlayerIncidentProfile(
          input.players[slot.playerId] as Player,
          input.playerStates?.[slot.playerId],
        ),
      ),
    };
  } catch (error) {
    if (error instanceof TeamStrengthError) {
      throw new TacticTeamContextError("team_strength_error", error.message);
    }

    throw error;
  }
}

/** Maps canonical player facts into the compact incident-policy input. */
export function createMatchPlayerIncidentProfile(
  player: Player,
  state?: PlayerDynamicState,
): MatchPlayerIncidentProfile {
  return {
    playerId: player.id,
    tackling: Number(player.abilities.technical.tackling),
    composure: Number(player.abilities.mental.composure),
    determination: Number(player.abilities.mental.determination),
    stamina: Number(player.abilities.physical.stamina),
    agility: Number(player.abilities.physical.agility),
    strength: Number(player.abilities.physical.strength),
    penalties: Number(player.abilities.technical.penalties),
    goalkeeperReflexes: Number(player.abilities.goalkeeping.reflexes),
    goalkeeperHandling: Number(player.abilities.goalkeeping.handling),
    startingFitness: Number(state?.fitness ?? 100),
  };
}

/**
 * Converts the tactic setup into match tactical distribution inputs.
 *
 * All five inputs cross this seam. `mentality` keeps its own key rather than
 * being folded into the four numeric knobs, because it is a ladder the engine
 * reads against score and minute state.
 */
export function tacticToMatchDistribution(tactic: TacticSetup): MatchTacticalDistributionInput {
  const validTactic = createTacticSetupOrThrow(tactic);

  return {
    directness: validTactic.directness,
    pressing: validTactic.pressing,
    width: validTactic.width,
    risk: validTactic.risk,
    mentality: validTactic.mentality,
  };
}

/**
 * Validates the explicit required lineup size used by the builder.
 */
function assertValidRequiredLineupSize(requiredLineupSize: number): void {
  if (!Number.isInteger(requiredLineupSize) || requiredLineupSize <= 0) {
    throw new TacticTeamContextError(
      "invalid_required_lineup_size",
      `Required lineup size must be a positive integer: ${requiredLineupSize}`,
    );
  }
}

/**
 * Validates selected lineup data and maps domain contract errors to builder errors.
 */
function createSelectedLineupOrThrow(lineup: SelectedLineup): SelectedLineup {
  try {
    return createSelectedLineup(lineup);
  } catch (error) {
    if (error instanceof TacticContractError) {
      throw new TacticTeamContextError(mapDomainContractErrorCode(error.code), error.message);
    }

    throw error;
  }
}

/**
 * Validates tactic setup data and maps domain contract errors to builder errors.
 */
function createTacticSetupOrThrow(tactic: TacticSetup): TacticSetup {
  try {
    return createTacticSetup(tactic);
  } catch (error) {
    if (error instanceof TacticContractError) {
      throw new TacticTeamContextError(mapDomainContractErrorCode(error.code), error.message);
    }

    throw error;
  }
}

/**
 * Maps shared domain tactic-contract error codes onto builder error codes.
 */
function mapDomainContractErrorCode(code: TacticContractErrorCode): TacticTeamContextErrorCode {
  switch (code) {
    case "empty_lineup":
    case "missing_player":
    case "duplicate_player":
    case "missing_slot_key":
    case "duplicate_slot_key":
    case "invalid_canonical_role":
    case "invalid_mentality":
    case "invalid_tactic_value":
      return code;
  }
}
