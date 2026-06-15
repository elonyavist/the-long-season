import { fixtureId, type ClubId, type FixtureId } from "@game/domain";
import type { RngKeyPart } from "@game/shared";

import type { LineupSlot, TeamStrength } from "./team-strength.ts";
import { isValidMatchEngineConfig, type MatchEngineConfig } from "./match-engine-config.ts";

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
  | "invalid_tactical_distribution";

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
  assertValidTeamContext(context.home, "home");
  assertValidTeamContext(context.away, "away");

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
function assertValidTeamContext(team: MatchTeamContext | undefined, side: "home" | "away"): void {
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
