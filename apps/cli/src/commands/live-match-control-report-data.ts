import { createFakeLeagueSystem, type FakeLeagueSystem } from "@game/content";
import {
  FORMATION_CATALOG,
  buildTacticTeamContext,
  type MatchTeamContext,
} from "@game/engine";
import {
  verifyLiveMatchControlGateReproducibility,
  type LiveMatchControlFixtureSetup,
  type LiveMatchControlGateReport,
  type LiveMatchControlGateWorld,
} from "@game/simulation-tools";

/** Default deterministic prefix for the Phase 77 complete-season gate. */
export const DEFAULT_LIVE_MATCH_CONTROL_SEED_PREFIX = "phase77-live-match-control";

/** Required complete-season world count for the Phase 77 acceptance gate. */
export const DEFAULT_LIVE_MATCH_CONTROL_WORLD_COUNT = 50;

/** Input accepted by the content-aware CLI report bridge. */
export interface CreateLiveMatchControlReportInput {
  readonly seedPrefix?: string;
  readonly worldCount?: number;
}

/**
 * Runs the canonical progressive-match gate against generated playable worlds.
 *
 * `simulation-tools` owns the content-free gate while this CLI adapter owns the
 * deliberate dependency on generated demo content. The same world input is
 * rebuilt for both reproducibility passes instead of retaining match sessions.
 */
export function createLiveMatchControlReport(
  input: CreateLiveMatchControlReportInput = {},
): LiveMatchControlGateReport {
  return verifyLiveMatchControlGateReproducibility({
    seedPrefix: input.seedPrefix ?? DEFAULT_LIVE_MATCH_CONTROL_SEED_PREFIX,
    worldCount: input.worldCount ?? DEFAULT_LIVE_MATCH_CONTROL_WORLD_COUNT,
    createWorld: (worldSeed) => createFakeLiveMatchControlWorld(worldSeed),
  });
}

/** Builds one generated season for the content-free live-match gate. */
export function createFakeLiveMatchControlWorld(worldSeed: string): LiveMatchControlGateWorld {
  const league = createFakeLeagueSystem({ worldSeed });

  return {
    seed: worldSeed,
    seasonId: league.seasonId,
    competitionId: league.competition.id,
    clubIds: league.clubIds,
    seasonStartDate: league.seasonStartDate,
    tableRules: league.tableRules,
    matchRules: league.competition.matchRules,
    players: league.players,
    playerIds: league.playerIds,
    createFixtureSetup: (fixture) => createFixtureSetup(league, worldSeed, fixture),
  };
}

type GateFixture = Parameters<LiveMatchControlGateWorld["createFixtureSetup"]>[0];
type GateTeam = LiveMatchControlFixtureSetup["home"];
type FakePlayerId = FakeLeagueSystem["playerIds"][number];
type FakePlayerState = FakeLeagueSystem["playerStates"][FakePlayerId];
type GateCanonicalRole = GateTeam["lineup"][number]["role"];

function createFixtureSetup(
  league: FakeLeagueSystem,
  worldSeed: string,
  fixture: GateFixture,
): LiveMatchControlFixtureSetup {
  const home = createLiveTeam(league, fixture.homeClubId, "home");
  const away = createLiveTeam(league, fixture.awayClubId, "away");
  const buildMatchTeamContext = (
    team: GateTeam,
    playerCondition: Parameters<LiveMatchControlFixtureSetup["buildMatchTeamContext"]>[1],
  ): MatchTeamContext => buildCurrentTeamContext(
    league,
    team.side === "home" ? fixture.homeClubId : fixture.awayClubId,
    team,
    playerCondition,
  );

  return {
    context: {
      fixtureId: fixture.id,
      seed: worldSeed,
      home: buildCurrentTeamContext(league, fixture.homeClubId, home, {}),
      away: buildCurrentTeamContext(league, fixture.awayClubId, away, {}),
      engineConfig: league.matchEngineConfig,
    },
    home,
    away,
    buildMatchTeamContext,
  };
}

function createLiveTeam(
  league: FakeLeagueSystem,
  clubId: FakeLeagueSystem["clubIds"][number],
  side: GateTeam["side"],
): GateTeam {
  const club = league.clubsById[clubId];
  const generatedLineup = league.lineupsByClubId[clubId];
  const formation = FORMATION_CATALOG["4-4-2"];

  if (club === undefined || generatedLineup === undefined || generatedLineup.length !== formation.slots.length) {
    throw new Error(`Generated club cannot build a complete live team: ${String(clubId)}`);
  }

  const selectedPlayerIds = new Set(generatedLineup.map((slot) => slot.playerId));
  const benchPlayerIds = club.playerIds.filter((playerId) => !selectedPlayerIds.has(playerId)).slice(0, 8);
  if (benchPlayerIds.length !== 8) {
    throw new Error(`Generated club must expose exactly eight live substitutes: ${String(clubId)}`);
  }

  return {
    side,
    formation: formation.key,
    lineup: formation.slots.map((slot, index) => {
      const generatedSlot = generatedLineup[index];
      if (generatedSlot === undefined) {
        throw new Error(`Generated lineup is missing slot ${index + 1}: ${String(clubId)}`);
      }
      return {
        slotId: slot.slotKey,
        playerId: generatedSlot.playerId,
        role: slot.playerRole,
        nx: normalizedX(slot.side),
        ny: normalizedY(slot.line),
      };
    }),
    bench: benchPlayerIds.map((playerId, index) => ({
      slotId: `bench:${String(index + 1).padStart(2, "0")}`,
      playerId,
      status: "available" as const,
    })),
    unavailable: [],
    substitutionsUsed: 0,
    tactic: {
      mentality: "balanced",
      pressing: 0.5,
      directness: 0.5,
      width: 0.5,
      risk: 0.5,
    },
  };
}

function buildCurrentTeamContext(
  league: FakeLeagueSystem,
  clubId: FakeLeagueSystem["clubIds"][number],
  team: GateTeam,
  playerCondition: Parameters<LiveMatchControlFixtureSetup["buildMatchTeamContext"]>[1],
): MatchTeamContext {
  const playerStates: Record<FakePlayerId, FakePlayerState> = { ...league.playerStates };

  for (const slot of team.lineup) {
    const baseline = playerStates[slot.playerId];
    const currentFitness = playerCondition[slot.playerId];
    if (baseline !== undefined && currentFitness !== undefined) {
      playerStates[slot.playerId] = {
        ...baseline,
        fitness: currentFitness as FakePlayerState["fitness"],
      };
    }
  }

  return buildTacticTeamContext({
    lineup: {
      clubId,
      slots: team.lineup.map((slot) => ({
        slotKey: slot.slotId,
        playerId: slot.playerId,
        roleKey: engineRoleKey(slot.role),
      })),
    },
    tactic: team.tactic,
    requiredLineupSize: team.lineup.length,
    players: league.players,
    roleWeights: league.roleWeights,
    playerStates,
    stateMultiplierCurves: league.stateMultiplierCurves,
  });
}

function engineRoleKey(role: GateCanonicalRole): string {
  if (role === "goalkeeper") return "gk";
  if (role === "right_full_back" || role === "center_back" || role === "left_full_back") return "defender";
  if (role === "right_winger" || role === "left_winger" || role === "striker") return "attacker";
  return "midfielder";
}

function normalizedX(side: (typeof FORMATION_CATALOG)["4-4-2"]["slots"][number]["side"]): number {
  switch (side) {
    case "left":
      return 0.16;
    case "left_center":
      return 0.38;
    case "right_center":
      return 0.62;
    case "right":
      return 0.84;
    case "center":
    case undefined:
      return 0.5;
  }
}

function normalizedY(line: (typeof FORMATION_CATALOG)["4-4-2"]["slots"][number]["line"]): number {
  switch (line) {
    case "goalkeeper":
      return 0.93;
    case "defensive_line":
      return 0.76;
    case "defensive_midfield":
      return 0.64;
    case "midfield_line":
      return 0.5;
    case "attacking_midfield":
      return 0.32;
    case "forward_line":
      return 0.16;
  }
}
