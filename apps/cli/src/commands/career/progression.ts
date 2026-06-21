import { createFakeLeagueSystem } from "@game/content";
import {
  deriveTeamStrength,
  progressNextCareerFixture,
  type LineupSlot,
  type MatchTeamContext,
  type PlayerStateMultiplierCurves,
  type ProgressCareerFixtureResult,
  type RoleWeightProfile,
} from "@game/engine";

import type { CliCareerState, CliGameState, ClubId } from "./types.ts";

const CAREER_DEFAULT_LINEUP_SIZE = 11;

/** Result of progressing one fixture from a loaded CLI career save. */
export type CareerAdvanceResult = ProgressCareerFixtureResult;

/**
 * Advances one selected-club fixture from persisted career state.
 *
 * The current career MVP has no saved lineup/tactic screen yet. Until that
 * exists, this helper builds a deterministic default 4-4-2 lineup from the
 * saved roster order and saved player records. It uses content role/config data
 * as simulation configuration only; player identity, ownership, and fixture
 * state come from the save.
 */
export function advanceCareerNextFixture(careerState: CliCareerState): CareerAdvanceResult {
  const contentConfig = createFakeLeagueSystem({
    worldSeed: careerState.careerWorld?.worldSeed ?? careerState.gameState.meta.seed,
  });

  return progressNextCareerFixture({
    careerState,
    teamsByClubId: careerTeamsByClubId({
      gameState: careerState.gameState,
      roleWeights: contentConfig.roleWeights,
      stateMultiplierCurves: contentConfig.stateMultiplierCurves,
    }),
    matchEngineConfig: contentConfig.matchEngineConfig,
  });
}

function careerTeamsByClubId(input: {
  readonly gameState: CliGameState;
  readonly roleWeights: Readonly<Record<string, RoleWeightProfile>>;
  readonly stateMultiplierCurves: PlayerStateMultiplierCurves;
}): Readonly<Record<ClubId, MatchTeamContext>> {
  const teamsByClubId: Partial<Record<ClubId, MatchTeamContext>> = {};

  for (const clubId of input.gameState.clubIds) {
    const club = input.gameState.clubs[clubId];

    if (club === undefined) {
      continue;
    }

    const lineup = defaultLineupFromRoster(club.playerIds);
    teamsByClubId[clubId] = {
      clubId,
      lineup,
      strength: deriveTeamStrength({
        lineup,
        players: input.gameState.players,
        playerStates: input.gameState.playerStates,
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

function defaultLineupFromRoster(playerIds: CliGameState["playerIds"]): readonly LineupSlot[] {
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
