import { generateInitialYouthAcademies, type FakeLeagueSystem, type InitialYouthAcademyClubContext } from "@game/content";
import { generateRoundRobinCalendar } from "@game/engine";

import { MARKET_DEMO_PROFILE_PRO01_STAR_REJECTED, type MarketDemoProfileKey } from "../simulate-season/profile-keys.ts";
import type {
  CliCareerState,
  CliClubTransferBudget,
  CliGameState,
  CliMarketState,
  CliMoney,
  CliPlayerAbilities,
  CliSaveId,
  ClubId,
  PlayerId,
} from "./types.ts";

type CliFixtureId = CliGameState["fixtureIds"][number];
type CliFixture = CliGameState["fixtures"][CliFixtureId];

/** Current deterministic generator version written by CLI-created career worlds. */
export const CLI_CAREER_WORLD_GENERATOR_VERSION = 1;

/** Complete in-memory setup for one predefined career market scenario. */
export interface CareerMarketScenario {
  /** Club controlled by the user in this scenario. */
  readonly selectedClubId: ClubId;
  /** Club attempting to buy the target player. */
  readonly buyingClubId: ClubId;
  /** Club currently owning the target player. */
  readonly sellingClubId: ClubId;
  /** Player targeted by the predefined transfer demo. */
  readonly targetPlayerId: PlayerId;
  /** Game-state snapshot used as the transfer input. */
  readonly gameState: CliGameState;
  /** Market-state snapshot used as the transfer input. */
  readonly marketState: CliMarketState;
}

/** Builds the durable career state used by profile-based market apply demos. */
export function careerStateFromScenario(saveId: CliSaveId, scenario: CareerMarketScenario): CliCareerState {
  return {
    saveId,
    schemaVersion: 1,
    selectedClubId: scenario.selectedClubId,
    gameState: scenario.gameState,
    marketState: scenario.marketState,
    transferHistory: [],
  };
}

/** Builds and annotates a newly generated career world before persisting it. */
export function careerStateFromNewWorld(saveId: CliSaveId, league: FakeLeagueSystem, worldSeed: string): CliCareerState {
  const selectedClubId = requiredClubId(league, 1);
  const gameState = gameStateFromLeague(league, worldSeed);
  const youthAcademies = generateInitialYouthAcademies({
    worldSeed,
    seasonId: league.seasonId,
    referenceDate: league.seasonStartDate,
    clubIds: league.clubIds,
    clubContexts: youthClubContexts(league),
  });

  return {
    saveId,
    schemaVersion: 1,
    careerWorld: {
      worldSeed,
      generatorVersion: CLI_CAREER_WORLD_GENERATOR_VERSION,
      creationSourceKey: "career:cli-new-world",
    },
    selectedClubId,
    gameState: {
      ...gameState,
      players: {
        ...gameState.players,
        ...youthAcademies.players,
      },
      playerIds: [...gameState.playerIds, ...youthAcademies.playerIds],
      playerStates: {
        ...gameState.playerStates,
        ...youthAcademies.playerStates,
      },
    },
    youthAcademyState: youthAcademies.youthAcademyState,
    marketState: marketStateFixture([[selectedClubId, money(6_000_000_00)]]),
    transferHistory: [],
  };
}

/** Builds one supported deterministic market demo scenario from fake content. */
export function buildMarketDemoScenario(league: FakeLeagueSystem, profileKey: MarketDemoProfileKey): CareerMarketScenario {
  if (profileKey === MARKET_DEMO_PROFILE_PRO01_STAR_REJECTED) {
    return buildStarRejectedScenario(league);
  }

  return buildAffordableScenario(league);
}

function buildAffordableScenario(league: FakeLeagueSystem): CareerMarketScenario {
  const selectedClubId = requiredClubId(league, 1);
  const sellingClubId = requiredClubId(league, 18);
  const targetPlayerId = requiredClubPlayerId(league, sellingClubId, 10);

  return {
    selectedClubId,
    buyingClubId: selectedClubId,
    sellingClubId,
    targetPlayerId,
    gameState: gameStateFromLeague(league),
    marketState: marketStateFixture([
      [selectedClubId, money(6_000_000_00)],
      [sellingClubId, money(500_000_00)],
    ]),
  };
}

function buildStarRejectedScenario(league: FakeLeagueSystem): CareerMarketScenario {
  const selectedClubId = requiredClubId(league, 1);
  const sellingClubId = requiredClubId(league, 2);
  const targetPlayerId = requiredClubPlayerId(league, sellingClubId, 10);
  const gameState = gameStateFromLeague(league);
  const sellingClub = gameState.clubs[sellingClubId];
  const targetPlayer = gameState.players[targetPlayerId];

  if (sellingClub === undefined || targetPlayer === undefined) {
    throw new Error(MARKET_DEMO_PROFILE_PRO01_STAR_REJECTED);
  }

  return {
    selectedClubId,
    buyingClubId: selectedClubId,
    sellingClubId,
    targetPlayerId,
    gameState: {
      ...gameState,
      clubs: {
        ...gameState.clubs,
        [sellingClubId]: {
          ...sellingClub,
          category: "first_division",
          reputation: 10,
        },
      },
      players: {
        ...gameState.players,
        [targetPlayerId]: {
          ...targetPlayer,
          abilities: abilitiesFixture(16),
          potential: abilitiesFixture(18),
        },
      },
    },
    marketState: marketStateFixture([
      [selectedClubId, money(100_000_000_00)],
      [sellingClubId, money(0)],
    ]),
  };
}

function gameStateFromLeague(league: FakeLeagueSystem, seed = "career-demo"): CliGameState {
  const calendar = generateRoundRobinCalendar({
    seed,
    seasonId: league.seasonId,
    competitionId: league.competition.id,
    clubIds: league.clubIds,
    seasonStartDate: league.seasonStartDate,
  });

  return {
    meta: {
      seed,
      rngAlgorithmVersion: "career-demo",
      saveSchemaVersion: 1,
    },
    calendar: {
      currentDate: league.seasonStartDate,
      currentSeasonId: league.seasonId,
    },
    players: league.players,
    playerIds: league.playerIds,
    playerStates: league.playerStates,
    clubs: league.clubsById,
    clubIds: league.clubIds,
    fixtures: fixturesById(calendar.fixtures),
    fixtureIds: calendar.fixtureIds,
  };
}

function youthClubContexts(league: FakeLeagueSystem): Parameters<typeof generateInitialYouthAcademies>[0]["clubContexts"] {
  const contexts: Partial<Record<ClubId, InitialYouthAcademyClubContext>> = {};

  for (const clubId of league.clubIds) {
    const club = league.clubsById[clubId];
    if (club === undefined) {
      continue;
    }

    contexts[clubId] = {
      category: club.category,
      reputation: club.reputation,
    };
  }

  return contexts as Parameters<typeof generateInitialYouthAcademies>[0]["clubContexts"];
}

/**
 * Indexes generated fixtures by ID while preserving deterministic traversal in
 * the separate `fixtureIds` array stored on `GameState`.
 */
function fixturesById(fixtures: readonly CliFixture[]): CliGameState["fixtures"] {
  const indexed: Partial<Record<CliFixtureId, CliFixture>> = {};

  for (const fixture of fixtures) {
    indexed[fixture.id] = fixture;
  }

  return indexed as CliGameState["fixtures"];
}

function marketStateFixture(rows: readonly (readonly [ClubId, CliMoney])[]): CliMarketState {
  const clubBudgets: Record<ClubId, CliClubTransferBudget> = {} as Record<ClubId, CliClubTransferBudget>;
  const clubBudgetIds: ClubId[] = [];

  for (const [clubId, transferBudget] of rows) {
    clubBudgets[clubId] = {
      clubId,
      transferBudget,
    };
    clubBudgetIds.push(clubId);
  }

  return {
    clubBudgets,
    clubBudgetIds,
  };
}

function abilitiesFixture(value: number): CliPlayerAbilities {
  const ability = value as CliPlayerAbilities["technical"]["finishing"];

  return {
    technical: {
      finishing: ability,
      passing: ability,
      longPassing: ability,
      crossing: ability,
      dribbling: ability,
      technique: ability,
      tackling: ability,
      penalties: ability,
      freeKicks: ability,
    },
    physical: {
      pace: ability,
      strength: ability,
      stamina: ability,
      agility: ability,
      heading: ability,
    },
    mental: {
      positioning: ability,
      vision: ability,
      anticipation: ability,
      composure: ability,
      determination: ability,
      leadership: ability,
    },
    goalkeeping: {
      reflexes: ability,
      handling: ability,
      rushingOut: ability,
      goalkeeperPositioning: ability,
      footwork: ability,
    },
  };
}

function requiredClubId(league: FakeLeagueSystem, oneBasedClubNumber: number): ClubId {
  const clubId = league.clubIds[oneBasedClubNumber - 1];

  if (clubId === undefined) {
    throw new Error(String(oneBasedClubNumber));
  }

  return clubId;
}

function requiredClubPlayerId(league: FakeLeagueSystem, clubId: ClubId, oneBasedSlotNumber: number): PlayerId {
  const playerId = league.clubsById[clubId]?.playerIds[oneBasedSlotNumber - 1];

  if (playerId === undefined) {
    throw new Error(String(oneBasedSlotNumber));
  }

  return playerId;
}

function money(value: number): CliMoney {
  return value as CliMoney;
}
