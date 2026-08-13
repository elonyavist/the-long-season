import {
  createFakeGameplayConfig,
  selectMarketBehaviorCalibration,
  selectPlayerDevelopmentEnvironmentConfig,
  selectPlayerStateCurvesConfig,
  selectPlayerValuationConfig,
  selectPlayerWagePolicyConfig,
} from "@game/content";
import {
  applyCareerWeeklyRecovery,
  buildTacticTeamContext,
  DEFAULT_MATCH_LINEUP_SIZE,
  fieldablePlayerIdsFor,
  findNextCareerFixture,
  progressNextCareerFixture,
  type ApplyCareerWeeklyRecoveryResult,
  type MatchTeamContext,
  type PlayerStateMultiplierCurves,
  type ProgressCareerAiTeamSelectionInput,
  type ProgressCareerFixtureAdvanced,
  type ProgressCareerFixtureResult,
  type RoleWeightProfile,
} from "@game/engine";

import type { CliCareerState, CliGameState, ClubId } from "./types.ts";
import {
  competitionIdForClubInWorld,
} from "./scenarios.ts";

/** Versioned match-tactics calibration, read through content rather than domain. */
type CliMatchTacticsCalibration = ReturnType<typeof createFakeGameplayConfig>["matchTacticsCalibration"];

/** CLI-only invalid reasons that block selected-club career advancement. */
export type CareerAdvancePreparationInvalidReason =
  | "missing_match_preparation"
  | "missing_saved_lineup"
  | "missing_saved_tactic";

/** Result returned when selected-club preparation is missing. */
export interface CareerAdvancePreparationInvalid {
  /** Discriminator matching engine invalid progression results. */
  readonly status: "invalid";
  /** Stable CLI-level invalid reason. */
  readonly reason: CareerAdvancePreparationInvalidReason;
  /** Original career state reference, unchanged. */
  readonly careerState: CliCareerState;
}

/** Successful career advancement result with pre-match recovery details. */
export interface CareerAdvanceAdvanced extends ProgressCareerFixtureAdvanced {
  /** Structured recovery applied before the fixture was simulated. */
  readonly preMatchRecovery: ApplyCareerWeeklyRecoveryResult;
}

/** Result of progressing one fixture from a loaded CLI career save. */
export type CareerAdvanceResult =
  | CareerAdvanceAdvanced
  | Exclude<ProgressCareerFixtureResult, ProgressCareerFixtureAdvanced>
  | CareerAdvancePreparationInvalid;

/**
 * Advances one selected-club fixture from persisted career state.
 *
 * The selected club must have explicit saved preparation. Opponent clubs still
 * use deterministic MVP defaults until opponent preparation becomes a separate
 * documented system.
 */
export function advanceCareerNextFixture(
  careerState: CliCareerState,
  options: { readonly includeExplanationTrace?: boolean } = {},
): CareerAdvanceResult {
  const preparationStatus = validateSelectedClubPreparation(careerState);
  if (preparationStatus !== undefined) {
    return {
      status: "invalid",
      reason: preparationStatus,
      careerState,
    };
  }

  const contentConfig = createFakeGameplayConfig();
  const nextFixture = findNextCareerFixture(careerState);

  if (nextFixture.status === "none") {
    return {
      status: "none",
      careerState,
    };
  }

  if (nextFixture.status === "invalid") {
    return {
      status: "invalid",
      reason: nextFixture.reason,
      ...(nextFixture.fixtureId === undefined ? {} : { fixtureId: nextFixture.fixtureId }),
      careerState,
    };
  }

  const selectedClub = careerState.gameState.clubs[careerState.selectedClubId];
  const preMatchRecovery = applyCareerWeeklyRecovery({
    playerStates: careerState.gameState.playerStates,
    playerIds: fieldablePlayerIdsFor(selectedClub),
    players: careerState.gameState.players,
    currentDate: nextFixture.fixture.date,
    recoveryPolicy: selectPlayerStateCurvesConfig(),
    dayCount: nextFixture.fixture.date - careerState.gameState.calendar.currentDate,
  });
  const recoveredCareerState: CliCareerState = {
    ...careerState,
    gameState: {
      ...careerState.gameState,
      playerStates: preMatchRecovery.playerStates,
    },
  };

  return retargetPreparationAfterAdvance(withPreMatchRecovery(progressNextCareerFixture({
    careerState: recoveredCareerState,
    teamsByClubId: selectedClubTeamOnly({
      careerState: recoveredCareerState,
      roleWeights: contentConfig.roleWeights,
      stateMultiplierCurves: contentConfig.stateMultiplierCurves,
      matchTacticsCalibration: contentConfig.matchTacticsCalibration,
    }),
    aiTeamSelection: aiTeamSelectionPolicy({
      roleWeights: contentConfig.roleWeights,
      stateMultiplierCurves: contentConfig.stateMultiplierCurves,
    }),
    matchEngineConfig: contentConfig.matchEngineConfig,
    matchTacticsCalibration: contentConfig.matchTacticsCalibration,
    competitionMatchRules: selectedCompetitionMatchRules(recoveredCareerState),
    wagePolicy: selectPlayerWagePolicyConfig(
      recoveredCareerState.gameState.meta.calibrationVersions,
    ),
    marketBehaviorPolicy: selectMarketBehaviorCalibration(
      recoveredCareerState.gameState.meta.calibrationVersions,
    ),
    valuationConfig: selectPlayerValuationConfig(
      recoveredCareerState.gameState.meta.calibrationVersions,
    ),
    playerDevelopmentEnvironmentConfig: selectPlayerDevelopmentEnvironmentConfig(
      recoveredCareerState.gameState.meta.calibrationVersions,
    ),
    playerStateCurvesConfig: selectPlayerStateCurvesConfig(),
    includeExplanationTrace: options.includeExplanationTrace === true,
  }), preMatchRecovery));
}

function validateSelectedClubPreparation(careerState: CliCareerState): CareerAdvancePreparationInvalidReason | undefined {
  if (careerState.matchPreparation === undefined) {
    return "missing_match_preparation";
  }

  if (careerState.matchPreparation.selectedLineup === undefined) {
    return "missing_saved_lineup";
  }

  if (careerState.matchPreparation.tactic === undefined) {
    return "missing_saved_tactic";
  }

  return undefined;
}

/**
 * Supplies the one context this driver actually owns: the manager's own team.
 *
 * Every other club in the world picks its own eleven through the AI selection
 * policy below. This driver used to hand the engine a context for all twenty
 * clubs, each one a hand-composed eleven that took the roster in stored order,
 * and it had a second copy of that rule in the web.
 */
function selectedClubTeamOnly(input: {
  readonly careerState: CliCareerState;
  readonly roleWeights: Readonly<Record<string, RoleWeightProfile>>;
  readonly stateMultiplierCurves: PlayerStateMultiplierCurves;
  readonly matchTacticsCalibration: CliMatchTacticsCalibration;
}): Readonly<Record<ClubId, MatchTeamContext>> {
  const { selectedClubId, matchPreparation } = input.careerState;

  if (matchPreparation?.selectedLineup === undefined || matchPreparation.tactic === undefined) {
    return {} as Readonly<Record<ClubId, MatchTeamContext>>;
  }

  return {
    [selectedClubId]: buildTacticTeamContext({
      lineup: matchPreparation.selectedLineup,
      tactic: matchPreparation.tactic,
      requiredLineupSize: DEFAULT_MATCH_LINEUP_SIZE,
      players: input.careerState.gameState.players,
      roleWeights: input.roleWeights,
      playerStates: input.careerState.gameState.playerStates,
      stateMultiplierCurves: input.stateMultiplierCurves,
      matchTacticsCalibration: input.matchTacticsCalibration,
    }),
  } as Readonly<Record<ClubId, MatchTeamContext>>;
}

/**
 * The one policy every club the manager has not prepared selects through.
 *
 * It carries no formation and no per-club entry, so there is nothing here that
 * can hold a different answer for the clubs the manager happens to face this
 * weekend than for the rest of the league (A2).
 */
function aiTeamSelectionPolicy(input: {
  readonly roleWeights: Readonly<Record<string, RoleWeightProfile>>;
  readonly stateMultiplierCurves: PlayerStateMultiplierCurves;
}): ProgressCareerAiTeamSelectionInput {
  return {
    roleWeights: input.roleWeights,
    stateMultiplierCurves: input.stateMultiplierCurves,
  };
}

function retargetPreparationAfterAdvance(result: CareerAdvanceResult): CareerAdvanceResult {
  if (result.status !== "advanced" || result.careerState.matchPreparation === undefined) {
    return result;
  }

  const nextFixtureId = nextSelectedClubFixtureId(result.careerState);

  return {
    ...result,
    careerState: {
      ...result.careerState,
      matchPreparation: {
        ...result.careerState.matchPreparation,
        ...(nextFixtureId === undefined ? {} : { targetFixtureId: nextFixtureId }),
        updatedAt: result.careerState.gameState.calendar.currentDate,
      },
    },
  };
}

function withPreMatchRecovery(
  result: ProgressCareerFixtureResult,
  preMatchRecovery: ApplyCareerWeeklyRecoveryResult,
): CareerAdvanceResult {
  if (result.status !== "advanced") {
    return result;
  }

  return {
    ...result,
    preMatchRecovery,
  };
}

function nextSelectedClubFixtureId(careerState: CliCareerState): CliGameState["fixtureIds"][number] | undefined {
  const nextFixture = findNextCareerFixture(careerState);
  return nextFixture.status === "found" ? nextFixture.fixtureId : undefined;
}

/** Reads match rules from the managed club's canonical current competition. */
function selectedCompetitionMatchRules(careerState: CliCareerState) {
  const world = careerState.gameState.domesticCompetitionWorld;
  const competitionId = world === undefined
    ? undefined
    : competitionIdForClubInWorld(world, careerState.selectedClubId);
  const rules = competitionId === undefined
    ? undefined
    : world?.competitions[competitionId]?.matchRules;
  if (rules === undefined) {
    throw new Error("Selected club competition match rules are unavailable");
  }
  return rules;
}
