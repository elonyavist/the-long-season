import {
  EMPTY_PLAYER_AVAILABILITY,
  playerParticipationRowKey,
  playerUnavailabilityReason,
  type CareerState,
  type ClubId,
  type Fixture,
  type MatchTacticsCalibrationConfig,
  type PlayerId,
} from "@game/domain";

import type { MatchTeamContext } from "../match-engine/match-context.ts";
import type {
  MatchTacticalDistributionInput,
  PlayerStateMultiplierCurves,
  RoleWeightProfile,
} from "../match-engine/index.ts";
import type { PlayerValuationConfig } from "../market/player-valuation.ts";
import { fieldablePlayerIds } from "../squad/squad-depth.ts";
import {
  derivePublicPlayerAssessment,
  type PublicPlayerAssessment,
} from "../squad/public-player-assessment.ts";
import {
  buildAiSquadMatchTeamContext,
  deriveShapeTacticalDistribution,
  type AiRecentPlayerUse,
} from "../team-selection/index.ts";
import { monthKeyForCareerDate } from "./advance-career-month.ts";

/**
 * AI team-selection policy for every club the caller has not prepared.
 *
 * One policy, not one per club. A per-club map invites a caller to answer for
 * the clubs the manager is about to face and quietly leave the rest of the world
 * without an answer, which is the shape of the fallback this replaced (A2).
 *
 * There is deliberately no formation here. Which shape a club lines up in is the
 * squad's own answer, taken from the catalog by the selector.
 */
export interface CareerAiTeamSelectionPolicy {
  /** Match-engine role profiles used to derive team strength. */
  readonly roleWeights: Readonly<Record<string, RoleWeightProfile>>;
  /** Tactical distribution used for every AI side. */
  readonly tacticalDistribution: MatchTacticalDistributionInput;
  /** Optional state curves used when deriving strength from selected players. */
  readonly stateMultiplierCurves?: PlayerStateMultiplierCurves;
  /** Maximum substitutes to include in diagnostics. */
  readonly benchSize?: number;
}

/** Input for selecting one club's team for one career fixture. */
export interface SelectCareerAiTeamInput {
  /** Career the club and its footballers are read from. */
  readonly careerState: CareerState;
  /** Club selecting a team. Any club in the world is a legal argument. */
  readonly clubId: ClubId;
  /** Fixture being played, which dates the assessments and the suspensions. */
  readonly fixture: Fixture;
  /** Policy applied identically to every club the manager has not prepared. */
  readonly policy: CareerAiTeamSelectionPolicy;
  /** Versioned match-tactics calibration, supplied by a composition root. */
  readonly matchTacticsCalibration: MatchTacticsCalibrationConfig;
  /** Canonical public-assessment policy the selector may consult. */
  readonly valuationConfig: PlayerValuationConfig;
}

/** One club's chosen team for one fixture. */
export interface CareerAiTeamSelection {
  /** Match-ready context for the selected eleven. */
  readonly teamContext: MatchTeamContext;
  /** Substitutes the same selection chose, in the same order. */
  readonly benchPlayerIds: readonly PlayerId[];
}

/**
 * Selects one career club's team for one fixture.
 *
 * Both drivers and the fixture-progression use case reach AI selection through
 * this function, so a club's eleven cannot depend on which of them asked. The
 * live web session in particular builds its own kickoff context rather than
 * going through `progressNextCareerFixture`, and when that path composed its own
 * opponent it was free to disagree with the one the result was later committed
 * against.
 *
 * Suspended and injured footballers are removed before selection rather than
 * rejected after it, because an AI club has no manager to tell.
 *
 * @example
 * const away = selectCareerAiTeam({ careerState, clubId, fixture, policy, ... });
 * // away.teamContext.lineup is a typed eleven in a real catalog shape.
 */
export function selectCareerAiTeam(input: SelectCareerAiTeamInput): CareerAiTeamSelection {
  const club = input.careerState.gameState.clubs[input.clubId];
  if (club === undefined) {
    throw new Error(`Career AI selection has no club: ${input.clubId}`);
  }

  // Squad depth through the one named accessor, never stored ownership: a
  // borrowed player is fielded by a club that does not hold his contract (A6).
  const selectablePlayerIds = fieldablePlayerIds(club).filter((playerId) =>
    playerUnavailabilityReason(
      input.careerState.playerAvailability ?? EMPTY_PLAYER_AVAILABILITY,
      playerId,
      input.fixture.date,
      input.fixture.competitionId,
    ) === undefined
  );

  const result = buildAiSquadMatchTeamContext({
    clubId: input.clubId,
    playerIds: selectablePlayerIds,
    players: input.careerState.gameState.players,
    publicAssessments: publicAssessmentsForPlayers(
      input.careerState,
      selectablePlayerIds,
      input.fixture.date,
      input.valuationConfig,
    ),
    currentDate: input.fixture.date,
    playerStates: input.careerState.gameState.playerStates,
    recentUse: recentUseForFixture(input.careerState, input.fixture, selectablePlayerIds),
    roleWeights: input.policy.roleWeights,
    // The club's instructions follow the shape it just chose, so a back three
    // with two strikers is not told to play the same football as a back five
    // with one. The policy value is the neutral setup those deviate from.
    tacticalDistribution: (formation) =>
      deriveShapeTacticalDistribution(formation, input.policy.tacticalDistribution),
    matchTacticsCalibration: input.matchTacticsCalibration,
    ...(input.policy.stateMultiplierCurves === undefined
      ? {}
      : { stateMultiplierCurves: input.policy.stateMultiplierCurves }),
    ...(input.policy.benchSize === undefined ? {} : { benchSize: input.policy.benchSize }),
  });

  return {
    teamContext: result.teamContext,
    benchPlayerIds: result.selection.benchPlayerIds,
  };
}

/**
 * Reads how hard each footballer has been worked lately, so AI clubs rotate.
 *
 * The selector has always had a rotation policy and nothing ever supplied it,
 * so `boundedRecentUseModifier` saw zero for every player and every AI club
 * fielded the same eleven every week for as long as a career lasted.
 *
 * The window is the current development month, because that is the granularity
 * the durable ledger actually stores - it buckets by month, so "the last three
 * matches" is not a question it can answer. Within a month this discriminates
 * exactly as the selector's caps expect, and it resets at the month boundary.
 *
 * Minutes are counted whoever they were played for. A8 decides which club a
 * match *fact* belongs to; tiredness belongs to the man's legs, and a borrowed
 * player arrives as tired as he left.
 */
function recentUseForFixture(
  careerState: CareerState,
  fixture: Fixture,
  playerIds: readonly PlayerId[],
): Readonly<Partial<Record<PlayerId, AiRecentPlayerUse>>> {
  const ledger = careerState.playerParticipationLedger;
  if (ledger === undefined) {
    return {};
  }

  const monthKey = monthKeyForCareerDate(fixture.date);
  const recentUse: Partial<Record<PlayerId, AiRecentPlayerUse>> = {};
  for (const playerId of playerIds) {
    const row = ledger.rows[playerParticipationRowKey(fixture.seasonId, monthKey, playerId)];
    if (row === undefined) continue;
    recentUse[playerId] = { recentMinutes: row.minutes, recentStarts: row.starts };
  }

  return recentUse;
}

/** Builds safe dated facts for the exact selectable AI roster. */
function publicAssessmentsForPlayers(
  careerState: CareerState,
  playerIds: readonly PlayerId[],
  currentDate: Fixture["date"],
  valuationConfig: PlayerValuationConfig,
): Readonly<Record<PlayerId, PublicPlayerAssessment>> {
  const assessments: Record<PlayerId, PublicPlayerAssessment> = {};
  for (const playerId of playerIds) {
    const player = careerState.gameState.players[playerId];
    if (player === undefined) continue;
    assessments[playerId] = derivePublicPlayerAssessment({
      player,
      currentDate,
      potentialProjectionPolicy: valuationConfig.potentialProjectionPolicy,
      ratingScale: valuationConfig.ratingScale,
    });
  }
  return assessments;
}
