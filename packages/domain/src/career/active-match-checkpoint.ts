import type { MatchEvent, MatchEventSide, ShotChanceType, ShotType } from "../entities/match-event.entity.ts";
import type { MatchScore, MatchStats } from "../entities/match.entity.ts";
import type { AppliedMatchSubstitution } from "../match/substitution.ts";
import type { HalfTimeTacticalBenchSlot, HalfTimeTacticalDecisionPlan } from "../match/half-time-tactical-decision.ts";
import type { RegulationMatchPhase } from "../match/match-phase.ts";
import type { ClubId, FixtureId, PlayerId } from "../types/ids.ts";

/** Current schema for a durable in-progress regulation match. */
export const ACTIVE_MATCH_CHECKPOINT_SCHEMA_VERSION = 1;

/** Regulation phases that can still be resumed. */
export type ActiveMatchCheckpointPhase = Exclude<RegulationMatchPhase, "full_time">;

/** One player assignment persisted in the initial match context. */
export interface ActiveMatchLineupSlot {
  readonly slotId: string;
  readonly playerId: PlayerId;
  readonly roleKey: string;
}

/** Aggregate team strength persisted so resuming never depends on current world lookups. */
export interface ActiveMatchTeamStrength {
  readonly attack: number;
  readonly midfield: number;
  readonly defense: number;
  readonly goalkeeper: number;
  readonly overall: number;
}

/** Tactical distribution persisted for one match side. */
export interface ActiveMatchTacticalDistribution {
  readonly directness: number;
  readonly pressing: number;
  readonly width: number;
  readonly risk: number;
}

/** Complete deterministic input for one match side. */
export interface ActiveMatchTeamContext {
  readonly clubId: ClubId;
  readonly lineup: readonly ActiveMatchLineupSlot[];
  readonly strength: ActiveMatchTeamStrength;
  readonly tacticalDistribution: ActiveMatchTacticalDistribution;
}

/** One conversion band used by the match engine. */
export interface ActiveMatchConversionBand {
  readonly bandKey: string;
  readonly minQualityInclusive: number;
  readonly maxQualityExclusive: number;
  readonly goalProbability: number;
}

/** Inclusive bounds for one tactical input. */
export interface ActiveMatchTacticalCap {
  readonly minInclusive: number;
  readonly maxInclusive: number;
}

/** Frozen deterministic tuning used to start and resume the match. */
export interface ActiveMatchEngineConfig {
  readonly minuteCount: number;
  readonly rates: {
    readonly baseOpportunityRatePerMinute: number;
    readonly maxOpportunityRatePerMinute: number;
  };
  readonly conversionBands: readonly ActiveMatchConversionBand[];
  readonly homeAdvantageFactor: number;
  readonly tacticalDistributionCaps: {
    readonly directness: ActiveMatchTacticalCap;
    readonly pressing: ActiveMatchTacticalCap;
    readonly width: ActiveMatchTacticalCap;
    readonly risk: ActiveMatchTacticalCap;
  };
}

/** Immutable input that deterministically identifies and configures the match. */
export interface ActiveMatchInitialContext {
  readonly fixtureId: FixtureId;
  readonly seed: string;
  readonly home: ActiveMatchTeamContext;
  readonly away: ActiveMatchTeamContext;
  readonly engineConfig: ActiveMatchEngineConfig;
}

/** Marker flags required to avoid re-emitting lifecycle events after restore. */
export interface ActiveMatchLocalState {
  readonly hasKickedOff: boolean;
  readonly hasReachedHalfTime: boolean;
  readonly hasReachedFullTime: false;
}

/** Durable accumulated simulation facts at the checkpoint minute. */
export interface ActiveMatchSimulationCheckpoint {
  readonly minute: number;
  readonly score: MatchScore;
  readonly stats: MatchStats;
  readonly local: ActiveMatchLocalState;
}

/** Durable state needed to resume one selected-club regulation match exactly. */
export interface ActiveMatchCheckpoint {
  readonly schemaVersion: typeof ACTIVE_MATCH_CHECKPOINT_SCHEMA_VERSION;
  readonly fixtureId: FixtureId;
  readonly selectedClubSide: MatchEventSide;
  readonly phase: ActiveMatchCheckpointPhase;
  readonly initialContext: ActiveMatchInitialContext;
  readonly simulation: ActiveMatchSimulationCheckpoint;
  readonly events: readonly MatchEvent[];
  readonly selectedClubBenchSlots: readonly HalfTimeTacticalBenchSlot[];
  readonly appliedSubstitutions: readonly AppliedMatchSubstitution[];
  readonly halfTimeTacticalPlan?: HalfTimeTacticalDecisionPlan;
}

/** Stable validation failures for durable active-match data. */
export type ActiveMatchCheckpointErrorCode =
  | "unsupported_schema_version"
  | "completed_match"
  | "fixture_mismatch"
  | "invalid_seed"
  | "invalid_minute"
  | "phase_minute_mismatch"
  | "invalid_score_or_stats"
  | "invalid_team_context"
  | "duplicate_player_assignment"
  | "invalid_event_timeline";

/** Typed error raised when an active-match checkpoint cannot be resumed safely. */
export class ActiveMatchCheckpointError extends Error {
  public readonly code: ActiveMatchCheckpointErrorCode;

  public constructor(code: ActiveMatchCheckpointErrorCode, message: string) {
    super(message);
    this.name = "ActiveMatchCheckpointError";
    this.code = code;
  }
}

/**
 * Validates and copies one durable active-match checkpoint.
 *
 * This constructor accepts structured facts only. Engine adapters remain
 * responsible for translating these facts to and from their hot-loop types.
 */
export function createActiveMatchCheckpoint(input: ActiveMatchCheckpoint): ActiveMatchCheckpoint {
  if (input.schemaVersion !== ACTIVE_MATCH_CHECKPOINT_SCHEMA_VERSION) {
    throw new ActiveMatchCheckpointError("unsupported_schema_version", `unsupported active-match schema: ${input.schemaVersion}`);
  }

  if (input.phase === ("full_time" as ActiveMatchCheckpointPhase) || input.simulation.local.hasReachedFullTime) {
    throw new ActiveMatchCheckpointError("completed_match", "completed matches must be committed as fixture reports, not active checkpoints");
  }

  if (input.fixtureId !== input.initialContext.fixtureId) {
    throw new ActiveMatchCheckpointError("fixture_mismatch", "checkpoint fixture must match its initial context");
  }

  if (input.initialContext.seed.trim() === "") {
    throw new ActiveMatchCheckpointError("invalid_seed", "active-match seed must not be empty");
  }

  assertValidTeam(input.initialContext.home);
  assertValidTeam(input.initialContext.away);
  assertValidMinuteAndPhase(input);
  assertValidScoreAndStats(input.simulation.score, input.simulation.stats);
  assertUniqueSelectedClubAssignments(input);

  if (input.events.some((event) => eventMinute(event) > input.simulation.minute || event.type === "full_time")) {
    throw new ActiveMatchCheckpointError("invalid_event_timeline", "active-match events must not exceed the checkpoint minute or include full time");
  }

  return copyCheckpoint(input);
}

function assertValidTeam(team: ActiveMatchTeamContext): void {
  const strengths = Object.values(team.strength);
  const tactical = Object.values(team.tacticalDistribution);

  if (
    team.lineup.length === 0
    || team.lineup.some((slot) => slot.slotId.trim() === "" || slot.roleKey.trim() === "")
    || strengths.some((value) => !Number.isFinite(value))
    || tactical.some((value) => !Number.isFinite(value))
  ) {
    throw new ActiveMatchCheckpointError("invalid_team_context", `invalid active-match team context: ${team.clubId}`);
  }
}

function assertValidMinuteAndPhase(checkpoint: ActiveMatchCheckpoint): void {
  const { minuteCount } = checkpoint.initialContext.engineConfig;
  const minute = checkpoint.simulation.minute;

  if (!Number.isSafeInteger(minute) || minute < 0 || minute >= minuteCount) {
    throw new ActiveMatchCheckpointError("invalid_minute", `active-match minute must be between 0 and ${minuteCount - 1}: ${minute}`);
  }

  const halfTimeMinute = Math.floor(minuteCount / 2);
  const expectedPhase: ActiveMatchCheckpointPhase = minute === 0
    ? "pre_match"
    : minute < halfTimeMinute
      ? "first_half"
      : minute === halfTimeMinute
        ? "half_time"
        : "second_half";

  if (checkpoint.phase !== expectedPhase) {
    throw new ActiveMatchCheckpointError("phase_minute_mismatch", `phase ${checkpoint.phase} does not match minute ${minute}`);
  }
}

function assertValidScoreAndStats(score: MatchScore, stats: MatchStats): void {
  const values = [
    score.home,
    score.away,
    stats.home.opportunities,
    stats.home.shots,
    stats.home.shotsOnTarget,
    stats.home.goals,
    stats.away.opportunities,
    stats.away.shots,
    stats.away.shotsOnTarget,
    stats.away.goals,
  ];

  if (values.some((value) => !Number.isSafeInteger(value) || value < 0)) {
    throw new ActiveMatchCheckpointError("invalid_score_or_stats", "active-match score and stats must contain non-negative integers");
  }
}

function assertUniqueSelectedClubAssignments(checkpoint: ActiveMatchCheckpoint): void {
  const selectedTeam = checkpoint.initialContext[checkpoint.selectedClubSide];
  const assigned = new Set<PlayerId>();

  for (const playerId of [
    ...selectedTeam.lineup.map((slot) => slot.playerId),
    ...checkpoint.selectedClubBenchSlots.map((slot) => slot.playerId).filter((value): value is PlayerId => value !== null),
  ]) {
    if (assigned.has(playerId)) {
      throw new ActiveMatchCheckpointError("duplicate_player_assignment", `player is assigned more than once: ${playerId}`);
    }

    assigned.add(playerId);
  }
}

function eventMinute(event: MatchEvent): number {
  return "shot" in event ? event.shot.minute : event.minute;
}

function copyCheckpoint(input: ActiveMatchCheckpoint): ActiveMatchCheckpoint {
  return structuredClone(input);
}

// These imports keep the checkpoint event contract explicit for generated API docs.
export type { MatchEvent, ShotChanceType, ShotType };
