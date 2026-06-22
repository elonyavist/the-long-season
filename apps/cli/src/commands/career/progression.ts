import { createFakeLeagueSystem } from "@game/content";
import {
  applyCareerWeeklyRecovery,
  buildTacticTeamContext,
  deriveTeamStrength,
  findNextCareerFixture,
  progressNextCareerFixture,
  type ApplyCareerWeeklyRecoveryResult,
  type LineupSlot,
  type MatchTeamContext,
  type PlayerStateMultiplierCurves,
  type ProgressCareerFixtureAdvanced,
  type ProgressCareerFixtureResult,
  type RoleWeightProfile,
} from "@game/engine";

import type { CliCareerState, CliGameState, ClubId } from "./types.ts";

const CAREER_DEFAULT_LINEUP_SIZE = 11;

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

  const contentConfig = createFakeLeagueSystem({
    worldSeed: careerState.careerWorld?.worldSeed ?? careerState.gameState.meta.seed,
  });
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
    playerIds: selectedClub?.playerIds ?? [],
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
    teamsByClubId: careerTeamsByClubId({
      careerState: recoveredCareerState,
      roleWeights: contentConfig.roleWeights,
      stateMultiplierCurves: contentConfig.stateMultiplierCurves,
    }),
    matchEngineConfig: contentConfig.matchEngineConfig,
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

function careerTeamsByClubId(input: {
  readonly careerState: CliCareerState;
  readonly roleWeights: Readonly<Record<string, RoleWeightProfile>>;
  readonly stateMultiplierCurves: PlayerStateMultiplierCurves;
}): Readonly<Record<ClubId, MatchTeamContext>> {
  const teamsByClubId: Partial<Record<ClubId, MatchTeamContext>> = {};

  for (const clubId of input.careerState.gameState.clubIds) {
    const club = input.careerState.gameState.clubs[clubId];

    if (club === undefined) {
      continue;
    }

    if (clubId === input.careerState.selectedClubId && input.careerState.matchPreparation?.selectedLineup !== undefined && input.careerState.matchPreparation.tactic !== undefined) {
      teamsByClubId[clubId] = buildTacticTeamContext({
        lineup: input.careerState.matchPreparation.selectedLineup,
        tactic: input.careerState.matchPreparation.tactic,
        requiredLineupSize: CAREER_DEFAULT_LINEUP_SIZE,
        players: input.careerState.gameState.players,
        roleWeights: input.roleWeights,
        playerStates: input.careerState.gameState.playerStates,
        stateMultiplierCurves: input.stateMultiplierCurves,
      });
      continue;
    }

    const lineup = defaultOpponentLineupFromRoster(club.playerIds);
    teamsByClubId[clubId] = {
      clubId,
      lineup,
      strength: deriveTeamStrength({
        lineup,
        players: input.careerState.gameState.players,
        playerStates: input.careerState.gameState.playerStates,
        roleWeights: input.roleWeights,
        stateMultiplierCurves: input.stateMultiplierCurves,
      }),
      tacticalDistribution: {
        directness: 0.5,
        pressing: 0.5,
        width: 0.5,
        risk: 0.5,
      },
    };
  }

  return teamsByClubId as Readonly<Record<ClubId, MatchTeamContext>>;
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
  for (const fixtureId of careerState.gameState.fixtureIds) {
    const fixture = careerState.gameState.fixtures[fixtureId];

    if (fixture === undefined || fixture.result?.played === true) {
      continue;
    }

    if (fixture.homeClubId === careerState.selectedClubId || fixture.awayClubId === careerState.selectedClubId) {
      return fixtureId;
    }
  }

  return undefined;
}

function defaultOpponentLineupFromRoster(playerIds: CliGameState["playerIds"]): readonly LineupSlot[] {
  const lineup: LineupSlot[] = [];

  for (let index = 0; index < CAREER_DEFAULT_LINEUP_SIZE; index += 1) {
    const playerId = playerIds[index];

    if (playerId === undefined) {
      continue;
    }

    const slotNumber = index + 1;
    lineup.push({
      slotId: `slot:${String(slotNumber).padStart(2, "0")}`,
      playerId,
      roleKey: defaultRoleKeyForSlot(slotNumber),
    });
  }

  return lineup;
}

function defaultRoleKeyForSlot(slotNumber: number): string {
  if (slotNumber === 1) {
    return "gk";
  }

  if (slotNumber <= 5) {
    return "defender";
  }

  if (slotNumber <= 9) {
    return "midfielder";
  }

  return "attacker";
}
