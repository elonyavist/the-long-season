import {
  fixtureId,
  type ClubId,
  type FixtureId,
  type MatchTacticsCalibrationConfig,
  type PlayerId,
} from "@game/domain";
import type { RngKeyPart } from "@game/shared";

import type { LineupSlot, TeamStrength } from "./team-strength.ts";
import { isValidMatchEngineConfig, type MatchEngineConfig } from "./match-engine-config.ts";
import { assertValidTacticalShapeProfile, TacticalShapeError, type TacticalShapeProfile } from "./tactical-shape.ts";

/**
 * Stable RNG derivation key for one match.
 *
 * Future match simulation should call `deriveRng(seed, streamName, ...keyParts)`
 * with this data, but this step intentionally does not create or consume RNG.
 */
export interface MatchRngKey {
  /** Run seed used to derive the match stream. */
  readonly seed: string;
  /** Stable stream name for all match simulations. */
  readonly streamName: "match";
  /** Stable key parts, currently only the fixture ID. */
  readonly keyParts: readonly [FixtureId];
}

/**
 * Tactical distribution inputs for one team.
 *
 * Values are caller-supplied and validated against `MatchEngineConfig` caps.
 */
export interface MatchTacticalDistributionInput {
  /** Directness or route-one tendency. */
  readonly directness: number;
  /** Pressing intensity. */
  readonly pressing: number;
  /** Width tendency. */
  readonly width: number;
  /** Attacking risk tendency. */
  readonly risk: number;
}

/** Player attributes consumed by deterministic discipline and injury policies. */
export interface MatchPlayerIncidentProfile {
  readonly playerId: PlayerId;
  readonly tackling: number;
  readonly composure: number;
  readonly determination: number;
  readonly stamina: number;
  readonly agility: number;
  readonly strength: number;
  readonly penalties: number;
  readonly goalkeeperReflexes: number;
  readonly goalkeeperHandling: number;
  readonly startingFitness: number;
}

/**
 * Serializable team context for one side of a match.
 */
export interface MatchTeamContext {
  /** Club taking part in the match. */
  readonly clubId: ClubId;
  /** Explicit ordered lineup used by the match. */
  readonly lineup: readonly LineupSlot[];
  /** Precomputed team strength for this lineup. */
  readonly strength: TeamStrength;
  /** Tactical distribution inputs for this team. */
  readonly tacticalDistribution: MatchTacticalDistributionInput;
  /** True player inputs used by incident policies when a full squad built this context. */
  readonly incidentProfiles?: readonly MatchPlayerIncidentProfile[];
  /**
   * Intrinsic tactical shape of this lineup.
   *
   * This is a derived fact recomputed from the lineup, never a second career
   * ledger. It is required because the minute loop reads it: opportunity routes,
   * possession, and chance type all come from it, so a context without a shape
   * could not be simulated at all. Every producer therefore needs the versioned
   * calibration, which is why the engine has no default one - a default would
   * silently decide football balance that content owns.
   */
  readonly shape: TacticalShapeProfile;
}

/**
 * Serializable input needed to simulate one match later.
 *
 * A complete `MatchContext` must be sufficient without reading `GameState`,
 * content files, storage, UI preferences, or global runtime state.
 */
export interface MatchContext {
  /** Stable fixture identifier, for example `fixture:000001`. */
  readonly fixtureId: FixtureId;
  /** Run seed used to derive the match RNG stream. */
  readonly seed: string;
  /** Home team context. Home/away order is explicit and never inferred. */
  readonly home: MatchTeamContext;
  /** Away team context. Home/away order is explicit and never inferred. */
  readonly away: MatchTeamContext;
  /** Match engine tuning supplied by caller data. */
  readonly engineConfig: MatchEngineConfig;
  /**
   * Versioned match-tactics calibration for this match.
   *
   * The minute loop reads these numbers directly - how hard a bottleneck bites,
   * how far each tactic knob may move a route - so they belong to the context
   * for the same reason `engineConfig` does: a context must be enough to
   * simulate a match without reaching for content. Both team shapes must carry
   * this exact version, which is checked rather than assumed.
   */
  readonly matchTacticsCalibration: MatchTacticsCalibrationConfig;
}

/** Error categories exposed by match-context validation. */
export type MatchContextErrorCode =
  | "missing_fixture_id"
  | "invalid_fixture_id"
  | "missing_seed"
  | "missing_home_team"
  | "missing_away_team"
  | "missing_team_strength"
  | "missing_lineup"
  | "invalid_engine_config"
  | "invalid_tactical_distribution"
  | "invalid_incident_profile"
  | "invalid_tactical_shape"
  | "mismatched_tactics_policy_version";

/**
 * Typed error thrown when a match context is incomplete or invalid.
 *
 * @example
 * assertValidMatchContext(context);
 */
export class MatchContextError extends Error {
  /** Machine-readable failure reason. */
  public readonly code: MatchContextErrorCode;

  /**
   * Creates a match-context validation error.
   */
  public constructor(code: MatchContextErrorCode, message: string) {
    super(message);
    this.name = "MatchContextError";
    this.code = code;
  }
}

/**
 * Builds the stable RNG key for one match context.
 *
 * @example
 * const key = buildMatchRngKey(context);
 * // deriveRng(key.seed, key.streamName, ...key.keyParts)
 */
export function buildMatchRngKey(context: Pick<MatchContext, "fixtureId" | "seed">): MatchRngKey {
  assertNonEmptySeed(context.seed);
  assertValidFixtureId(context.fixtureId);

  return {
    seed: context.seed,
    streamName: "match",
    keyParts: [context.fixtureId],
  };
}

/**
 * Validates a match context and throws a typed error when incomplete.
 */
export function assertValidMatchContext(context: MatchContext): void {
  if (context.fixtureId === undefined || String(context.fixtureId).length === 0) {
    throw new MatchContextError("missing_fixture_id", "MatchContext.fixtureId is required");
  }

  assertValidFixtureId(context.fixtureId);
  assertNonEmptySeed(context.seed);
  assertValidTeamContext(context.home, "home", context.matchTacticsCalibration);
  assertValidTeamContext(context.away, "away", context.matchTacticsCalibration);

  if (!isValidMatchEngineConfig(context.engineConfig)) {
    throw new MatchContextError("invalid_engine_config", "MatchContext.engineConfig is invalid");
  }

  assertTacticalDistributionWithinCaps(context.home.tacticalDistribution, context.engineConfig, "home");
  assertTacticalDistributionWithinCaps(context.away.tacticalDistribution, context.engineConfig, "away");
}

/**
 * Reports whether a context passes validation.
 */
export function isValidMatchContext(context: MatchContext): boolean {
  try {
    assertValidMatchContext(context);
    return true;
  } catch (error) {
    if (error instanceof MatchContextError) {
      return false;
    }

    throw error;
  }
}

/**
 * Returns RNG key parts in a form accepted by `deriveRng`.
 */
export function matchRngKeyParts(key: MatchRngKey): readonly RngKeyPart[] {
  return key.keyParts;
}

/**
 * Validates the fixture ID using the domain constructor rules.
 */
function assertValidFixtureId(value: FixtureId): void {
  try {
    fixtureId(String(value));
  } catch (error) {
    throw new MatchContextError("invalid_fixture_id", `Fixture ID must use fixture: namespace: ${String(value)}`);
  }
}

/**
 * Validates the run seed field.
 */
function assertNonEmptySeed(seed: string): void {
  if (seed.length === 0) {
    throw new MatchContextError("missing_seed", "MatchContext.seed is required");
  }
}

/**
 * Validates one side of the match context.
 */
function assertValidTeamContext(
  team: MatchTeamContext | undefined,
  side: "home" | "away",
  calibration: MatchTacticsCalibrationConfig | undefined,
): void {
  if (team === undefined) {
    throw new MatchContextError(side === "home" ? "missing_home_team" : "missing_away_team", `${side} team is required`);
  }

  if (team.lineup.length === 0) {
    throw new MatchContextError("missing_lineup", `${side} lineup must include at least one slot`);
  }

  if (team.strength === undefined) {
    throw new MatchContextError("missing_team_strength", `${side} team strength is required`);
  }

  if (
    !Number.isFinite(team.strength.attack) ||
    !Number.isFinite(team.strength.midfield) ||
    !Number.isFinite(team.strength.defense) ||
    !Number.isFinite(team.strength.goalkeeper) ||
    !Number.isFinite(team.strength.overall)
  ) {
    throw new MatchContextError("missing_team_strength", `${side} team strength must contain finite numbers`);
  }

  if (team.incidentProfiles !== undefined) {
    const lineupPlayerIds = new Set(team.lineup.map((slot) => slot.playerId));
    const seenPlayerIds = new Set<PlayerId>();
    for (const profile of team.incidentProfiles) {
      if (!lineupPlayerIds.has(profile.playerId) || seenPlayerIds.has(profile.playerId)) {
        throw new MatchContextError(
          "invalid_incident_profile",
          `${side} incident profile must belong to one unique lineup player: ${profile.playerId}`,
        );
      }
      if (!incidentProfileValues(profile).every((value) => Number.isFinite(value) && value >= 0 && value <= 100)) {
        throw new MatchContextError(
          "invalid_incident_profile",
          `${side} incident profile values must be finite and inside 0..100: ${profile.playerId}`,
        );
      }
      seenPlayerIds.add(profile.playerId);
    }
  }

  // A match context is serializable, so it can arrive rebuilt from persisted or
  // foreign data where the type is no guarantee. An absent shape is reported as
  // a typed context error rather than crashing inside the shape validator.
  if (team.shape === undefined) {
    throw new MatchContextError("invalid_tactical_shape", `${side} tactical shape is required`);
  }

  try {
    assertValidTacticalShapeProfile(team.shape);
  } catch (error) {
    if (error instanceof TacticalShapeError) {
      throw new MatchContextError("invalid_tactical_shape", `${side} tactical shape is invalid: ${error.message}`);
    }

    throw error;
  }

  // A shape derived under an older calibration is silently wrong rather than
  // obviously broken: its numbers still look valid. Comparing the stamp is the
  // only cheap way to catch a context assembled from two different policies.
  if (calibration !== undefined && team.shape.policyVersion !== calibration.version) {
    throw new MatchContextError(
      "mismatched_tactics_policy_version",
      `${side} tactical shape was derived under ${team.shape.policyVersion}, not ${calibration.version}`,
    );
  }
}

function incidentProfileValues(profile: MatchPlayerIncidentProfile): readonly number[] {
  return [
    profile.tackling,
    profile.composure,
    profile.determination,
    profile.stamina,
    profile.agility,
    profile.strength,
    profile.penalties,
    profile.goalkeeperReflexes,
    profile.goalkeeperHandling,
    profile.startingFitness,
  ];
}

/**
 * Ensures tactical inputs are inside config caps.
 */
function assertTacticalDistributionWithinCaps(
  tactical: MatchTacticalDistributionInput,
  config: MatchEngineConfig,
  side: "home" | "away",
): void {
  assertKnobWithinCap(tactical.directness, config.tacticalDistributionCaps.directness, side, "directness");
  assertKnobWithinCap(tactical.pressing, config.tacticalDistributionCaps.pressing, side, "pressing");
  assertKnobWithinCap(tactical.width, config.tacticalDistributionCaps.width, side, "width");
  assertKnobWithinCap(tactical.risk, config.tacticalDistributionCaps.risk, side, "risk");
}

/**
 * Ensures one tactical knob is inside its cap.
 */
function assertKnobWithinCap(
  value: number,
  cap: { readonly minInclusive: number; readonly maxInclusive: number },
  side: "home" | "away",
  knob: keyof MatchTacticalDistributionInput,
): void {
  if (!Number.isFinite(value) || value < cap.minInclusive || value > cap.maxInclusive) {
    throw new MatchContextError(
      "invalid_tactical_distribution",
      `${side}.${knob} must be between ${cap.minInclusive} and ${cap.maxInclusive}: ${value}`,
    );
  }
}
