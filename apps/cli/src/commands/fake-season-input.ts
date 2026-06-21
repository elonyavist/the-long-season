import type { FakeLeagueSystem } from "@game/content";
import {
  deriveTeamStrength,
  type LineupSlot,
  type RoleWeightProfile,
  type SimulateSeasonInput,
  type SimulateSeasonTeamInput,
} from "@game/engine";

/** Club ID union produced by the deterministic fake content generator. */
export type FakeCliClubId = FakeLeagueSystem["clubIds"][number];

/** Team context used by CLI inspection commands around fake content. */
export type FakeCliTeamContext = SimulateSeasonTeamInput & {
  /** Club represented by this team context. */
  readonly clubId: FakeCliClubId;
};

/**
 * Builds a full season input from the current fake-content league.
 *
 * CLI commands own this bridge because `simulation-tools` must stay content-free
 * and the engine must not know how fake demo leagues are authored.
 */
export function createFakeSeasonInput(league: FakeLeagueSystem, seed: string): SimulateSeasonInput {
  return {
    seed,
    seasonId: league.seasonId,
    competitionId: league.competition.id,
    clubIds: league.clubIds,
    seasonStartDate: league.seasonStartDate,
    teamsByClubId: createFakeTeamsByClubId(league),
    matchEngineConfig: league.matchEngineConfig,
    tableRules: league.tableRules,
  };
}

/**
 * Builds aggregate team contexts for every fake club.
 *
 * The returned contexts include enough player and role data for later fixture
 * inspection, tactic overrides, and current player-state multipliers.
 */
export function createFakeTeamsByClubId(
  league: FakeLeagueSystem,
): Readonly<Record<FakeCliClubId, FakeCliTeamContext>> {
  const teamsByClubId: Record<FakeCliClubId, FakeCliTeamContext> = {};
  const roleWeights: Readonly<Record<string, RoleWeightProfile>> = league.roleWeights;

  for (const clubId of league.clubIds) {
    const lineup = league.lineupsByClubId[clubId];

    if (lineup === undefined) {
      throw new Error(`Missing fake lineup for club: ${clubId}`);
    }

    const typedLineup: readonly LineupSlot[] = lineup;
    teamsByClubId[clubId] = {
      clubId,
      lineup: typedLineup,
      players: league.players,
      roleWeights,
      stateMultiplierCurves: league.stateMultiplierCurves,
      strength: deriveTeamStrength({
        lineup: typedLineup,
        players: league.players,
        playerStates: league.playerStates,
        roleWeights,
        stateMultiplierCurves: league.stateMultiplierCurves,
      }),
      tacticalDistribution: {
        directness: 0.5,
        pressing: 0.5,
        width: 0.5,
        risk: 0.5,
      },
    };
  }

  return teamsByClubId;
}
