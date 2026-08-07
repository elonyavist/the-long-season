import {
  fieldablePlayerIds, createLineupSlot, type CanonicalPlayerRole } from "@game/engine";
import type { FakeLeagueSystem } from "@game/content";
import {
  type LineupSlot,
  type RoleWeightProfile,
  type SimulateSeasonInput,
  type SimulateSeasonTeamInput,
} from "@game/engine";
import type { CliCareerState, CliPlayer } from "./career/types.ts";

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
    matchTacticsCalibration: league.matchTacticsCalibration,
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

    const typedLineup: readonly LineupSlot[] = lineup.map((slot) => createLineupSlot(slot));
    teamsByClubId[clubId] = {
      clubId,
      lineup: typedLineup,
      players: league.players,
      roleWeights,
      playerStates: league.playerStates,
      stateMultiplierCurves: league.stateMultiplierCurves,
      tacticalDistribution: {
        directness: 0.5,
        pressing: 0.5,
        width: 0.5,
        risk: 0.5,
        mentality: "balanced",
      },
    };
  }

  return teamsByClubId;
}

/**
 * Builds a season input from the current career state.
 *
 * This bridge is used by long-run inspection reports after career refresh has
 * changed active rosters. It creates a deterministic generic lineup for
 * simulation only; it does not persist or choose the user's saved lineup.
 */
export function createCareerSeasonInput(
  league: FakeLeagueSystem,
  careerState: CliCareerState,
  seed: string,
): SimulateSeasonInput {
  return {
    seed,
    seasonId: careerState.gameState.calendar.currentSeasonId,
    competitionId: league.competition.id,
    clubIds: careerState.gameState.clubIds,
    seasonStartDate: careerState.gameState.calendar.currentDate,
    teamsByClubId: createCareerTeamsByClubId(league, careerState),
    matchEngineConfig: league.matchEngineConfig,
    matchTacticsCalibration: league.matchTacticsCalibration,
    tableRules: league.tableRules,
  };
}

function createCareerTeamsByClubId(
  league: FakeLeagueSystem,
  careerState: CliCareerState,
): Readonly<Record<FakeCliClubId, FakeCliTeamContext>> {
  const teamsByClubId: Partial<Record<FakeCliClubId, FakeCliTeamContext>> = {};
  const roleWeights: Readonly<Record<string, RoleWeightProfile>> = league.roleWeights;

  for (const clubId of careerState.gameState.clubIds) {
    const club = careerState.gameState.clubs[clubId];
    if (club === undefined) {
      continue;
    }

    const lineup = genericLineupForClub(fieldablePlayerIds(club), careerState);
    teamsByClubId[clubId as FakeCliClubId] = {
      clubId: clubId as FakeCliClubId,
      lineup,
      players: careerState.gameState.players,
      roleWeights,
      playerStates: careerState.gameState.playerStates,
      stateMultiplierCurves: league.stateMultiplierCurves,
      tacticalDistribution: {
        directness: 0.5,
        pressing: 0.5,
        width: 0.5,
        risk: 0.5,
        mentality: "balanced",
      },
    };
  }

  return teamsByClubId as Readonly<Record<FakeCliClubId, FakeCliTeamContext>>;
}

function genericLineupForClub(
  playerIds: readonly CliCareerState["gameState"]["playerIds"][number][],
  careerState: CliCareerState,
): readonly LineupSlot[] {
  const selected: CliCareerState["gameState"]["playerIds"][number][] = [];
  addByGroup(selected, playerIds, careerState, "goalkeeper", 1);
  addByGroup(selected, playerIds, careerState, "defender", 4);
  addByGroup(selected, playerIds, careerState, "midfielder", 4);
  addByGroup(selected, playerIds, careerState, "attacker", 2);

  for (const playerId of playerIds) {
    if (selected.length >= 11) {
      break;
    }

    if (!selected.includes(playerId)) {
      selected.push(playerId);
    }
  }

  return selected.slice(0, 11).map((playerId, index) => createLineupSlot({
    slotId: `slot:${String(index + 1).padStart(2, "0")}`,
    playerId,
    canonicalRole: canonicalRoleForPlayer(playerId, careerState),
  }));
}

function addByGroup(
  selected: CliCareerState["gameState"]["playerIds"][number][],
  playerIds: readonly CliCareerState["gameState"]["playerIds"][number][],
  careerState: CliCareerState,
  group: "goalkeeper" | "defender" | "midfielder" | "attacker",
  count: number,
): void {
  for (const playerId of playerIds) {
    if (selected.length >= 11 || selected.filter((selectedId) => positionGroupForPlayer(selectedId, careerState) === group).length >= count) {
      break;
    }

    if (!selected.includes(playerId) && positionGroupForPlayer(playerId, careerState) === group) {
      selected.push(playerId);
    }
  }
}

/** Maps one player's broad position group onto the canonical role he fills. */
function canonicalRoleForPlayer(
  playerId: CliCareerState["gameState"]["playerIds"][number],
  careerState: CliCareerState,
): CanonicalPlayerRole {
  switch (positionGroupForPlayer(playerId, careerState)) {
    case "goalkeeper":
      return "goalkeeper";
    case "defender":
      return "center_back";
    case "midfielder":
      return "central_midfielder";
    case "attacker":
      return "striker";
  }
}

function positionGroupForPlayer(
  playerId: CliCareerState["gameState"]["playerIds"][number],
  careerState: CliCareerState,
): "goalkeeper" | "defender" | "midfielder" | "attacker" {
  const player = careerState.gameState.players[playerId];
  return positionGroup(player?.naturalPositions[0]);
}

function positionGroup(position: CliPlayer["naturalPositions"][number] | undefined): "goalkeeper" | "defender" | "midfielder" | "attacker" {
  switch (position) {
    case "gk":
      return "goalkeeper";
    case "rb":
    case "cb":
    case "lb":
    case "rwb":
    case "lwb":
      return "defender";
    case "dm":
    case "cm":
    case "am":
    case "rm":
    case "lm":
      return "midfielder";
    case "rw":
    case "lw":
    case "st":
    default:
      return "attacker";
  }
}
