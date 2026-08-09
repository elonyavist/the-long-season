import {
  EMPTY_PLAYER_AVAILABILITY,
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
  type CatalogShapeChoice,
} from "../team-selection/index.ts";
import { recentPlayerUseForFixture } from "./player-participation.ts";

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
  /**
   * How close this club's own shape decision was.
   *
   * Career AI never imposes a formation, so the club always chose, and this is
   * always present. It is the only way to tell a shape chosen on football from
   * one chosen by catalog position among equals, and it costs nothing: the
   * selector does the walk to choose with.
   */
  readonly catalogChoice?: CatalogShapeChoice;
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
  const seniorPlayerIds = fieldablePlayerIds(club).filter((playerId) =>
    playerUnavailabilityReason(
      input.careerState.playerAvailability ?? EMPTY_PLAYER_AVAILABILITY,
      playerId,
      input.fixture.date,
      input.fixture.competitionId,
    ) === undefined
  );
  const availableAcademyPlayerIds = (
    input.careerState.youthAcademyState?.clubRosters[input.clubId]?.playerIds ?? []
  ).filter((playerId) =>
    !seniorPlayerIds.includes(playerId)
      && input.careerState.gameState.players[playerId] !== undefined
      && playerUnavailabilityReason(
        input.careerState.playerAvailability ?? EMPTY_PLAYER_AVAILABILITY,
        playerId,
        input.fixture.date,
        input.fixture.competitionId,
      ) === undefined
  );
  const candidatePlayerIds = [...seniorPlayerIds, ...availableAcademyPlayerIds];
  const publicAssessments = publicAssessmentsForPlayers(
    input.careerState,
    candidatePlayerIds,
    input.fixture.date,
    input.valuationConfig,
  );
  const academyCallUpPlayerIds = selectAcademyCallUpPlayerIds(
    availableAcademyPlayerIds,
    publicAssessments,
  );
  const selectablePlayerIds = [...seniorPlayerIds, ...academyCallUpPlayerIds];

  const result = buildAiSquadMatchTeamContext({
    clubId: input.clubId,
    playerIds: selectablePlayerIds,
    players: input.careerState.gameState.players,
    publicAssessments,
    currentDate: input.fixture.date,
    playerStates: input.careerState.gameState.playerStates,
    recentUse: recentPlayerUseForFixture({
      ledger: input.careerState.playerParticipationLedger,
      seasonId: input.fixture.seasonId,
      fixtureDate: input.fixture.date,
      playerIds: selectablePlayerIds,
    }),
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
    ...(result.selection.catalogChoice === undefined
      ? {}
      : { catalogChoice: result.selection.catalogChoice }),
  };
}

/**
 * Adds only the best three available academy footballers to a match-day pool.
 *
 * They remain academy members: the returned IDs are a dated selection input,
 * not a second roster or an implicit promotion. Public current level comes
 * first because the AI is trying to field today's side; public P50 breaks an
 * equal-current-level choice in favour of useful development minutes. The ID
 * is the deterministic final tie-breaker required by the engine contract.
 */
export function selectAcademyCallUpPlayerIds(
  playerIds: readonly PlayerId[],
  publicAssessments: Readonly<Record<PlayerId, PublicPlayerAssessment>>,
): readonly PlayerId[] {
  return playerIds.toSorted((leftId, rightId) => {
    const left = publicAssessments[leftId];
    const right = publicAssessments[rightId];
    if (left === undefined || right === undefined) {
      throw new Error("Career AI academy call-up is missing a public assessment");
    }
    return right.currentAbility - left.currentAbility
      || right.p50Ability - left.p50Ability
      || String(leftId).localeCompare(String(rightId));
  }).slice(0, 3);
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
