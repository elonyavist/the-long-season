import {
  playerEconomyCalibration,
  type FakeDomesticWorld,
} from "@game/content";
import {
  combineDomesticCompetitionCalendars,
  createFreshCareerState,
  generateRoundRobinCalendar,
} from "@game/engine";

import { MARKET_DEMO_PROFILE_PRO01_STAR_REJECTED, type MarketDemoProfileKey } from "../simulate-season/profile-keys.ts";
import type {
  CliCareerState,
  CliClubFinanceState,
  CliGameState,
  CliPlayerAbilities,
  CliMoney,
  CliSaveId,
  CliSeniorSquadState,
  ClubId,
  PlayerId,
} from "./types.ts";

type CliFixtureId = CliGameState["fixtureIds"][number];
type CliFixture = CliGameState["fixtures"][CliFixtureId];
type PlayerEconomyCalibrationVersionBundle = NonNullable<
  CliGameState["meta"]["calibrationVersions"]
>;

/** Current deterministic generator version written by CLI-created career worlds. */
export const CLI_CAREER_WORLD_GENERATOR_VERSION = 1;

/** Shared three-points table rules used by CLI career-only projections. */
export const CLI_CAREER_TABLE_RULES = {
  pointsForWin: 3,
  pointsForDraw: 1,
  pointsForLoss: 0,
} as const;

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
  /** Canonical club-finance snapshot used as the transfer input. */
  readonly clubFinanceState: CliClubFinanceState;
  /** Canonical senior registrations and agreements used by the transfer input. */
  readonly seniorSquadState: CliSeniorSquadState;
}

/** Builds the durable career state used by profile-based market apply demos. */
export function careerStateFromScenario(saveId: CliSaveId, scenario: CareerMarketScenario): CliCareerState {
  return createFreshCareerState({
    saveId,
    selectedClubId: scenario.selectedClubId,
    gameState: scenario.gameState,
    seniorSquadState: scenario.seniorSquadState,
    clubFinanceState: scenario.clubFinanceState,
    transferHistory: [],
  });
}

/** Builds and annotates a newly generated career world before persisting it. */
export function careerStateFromNewWorld(
  saveId: CliSaveId,
  world: FakeDomesticWorld,
  worldSeed: string,
): CliCareerState {
  const selectedClubId = world.defaultSelectedClubId;
  const gameState = gameStateFromWorld(world, worldSeed);
  return createFreshCareerState({
    saveId,
    careerWorld: {
      worldSeed,
      generatorVersion: CLI_CAREER_WORLD_GENERATOR_VERSION,
      creationSourceKey: "career:cli-new-world",
    },
    selectedClubId,
    gameState: {
      ...gameState,
      players: { ...gameState.players, ...world.initialYouthAcademies.players },
      playerIds: [...gameState.playerIds, ...world.initialYouthAcademies.playerIds],
      playerStates: { ...gameState.playerStates, ...world.initialYouthAcademies.playerStates },
    },
    youthAcademyState: world.initialYouthAcademies.youthAcademyState,
    seniorSquadState: world.seniorSquadState,
    clubFinanceState: world.clubFinanceState,
    transferHistory: [],
  });
}

/** Builds one supported deterministic market demo scenario from fake content. */
export function buildMarketDemoScenario(world: FakeDomesticWorld, profileKey: MarketDemoProfileKey): CareerMarketScenario {
  if (profileKey === MARKET_DEMO_PROFILE_PRO01_STAR_REJECTED) {
    return buildStarRejectedScenario(world);
  }

  return buildAffordableScenario(world);
}

/** Resolves source-audited windows through canonical current membership. */
export function selectedClubTransferWindows(
  world: FakeDomesticWorld,
  selectedClubId: ClubId,
) {
  const competitionId = competitionIdForClubInWorld(
    world.domesticCompetitionWorld,
    selectedClubId,
  );
  const windows = competitionId === undefined
    ? undefined
    : world.transferWindowsByCompetitionId[competitionId];
  if (windows === undefined) {
    throw new Error(`Selected club transfer windows not found: ${selectedClubId}`);
  }
  return windows;
}

function buildAffordableScenario(world: FakeDomesticWorld): CareerMarketScenario {
  const selectedClubId = world.defaultSelectedClubId;
  const sellingClubId = requiredDivisionClubId(world, "third_division", 18);
  const targetPlayerId = requiredClubPlayerId(world, sellingClubId, 10);

  return {
    selectedClubId,
    buyingClubId: selectedClubId,
    sellingClubId,
    targetPlayerId,
    gameState: gameStateFromWorld(world),
    seniorSquadState: world.seniorSquadState,
    clubFinanceState: withMarketDemoBudget(
      world.clubFinanceState,
      world.seniorSquadState,
      selectedClubId,
      targetPlayerId,
      6_000_000_00,
    ),
  };
}

function buildStarRejectedScenario(world: FakeDomesticWorld): CareerMarketScenario {
  const selectedClubId = world.defaultSelectedClubId;
  const sellingClubId = requiredDivisionClubId(world, "first_division", 2);
  const targetPlayerId = requiredClubPlayerId(world, sellingClubId, 10);
  const gameState = gameStateFromWorld(world);
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
    seniorSquadState: world.seniorSquadState,
    clubFinanceState: withMarketDemoBudget(
      world.clubFinanceState,
      world.seniorSquadState,
      selectedClubId,
      targetPlayerId,
      500_000_000_00,
    ),
  };
}

/**
 * Gives a named CLI market scenario its documented transfer headroom.
 *
 * The fixture provides both budget and liquid headroom so its documented
 * outcome reaches the player table under the canonical Phase 79 workflow.
 * Wage headroom includes the target agreement so an affordable demo is not
 * rejected for an unrelated generated-world variance.
 */
export function withMarketDemoBudget(
  financeState: CliClubFinanceState,
  seniorSquadState: CliSeniorSquadState,
  buyingClubId: ClubId,
  targetPlayerId: PlayerId,
  transferBudgetMinorUnits: number,
): CliClubFinanceState {
  const account = financeState.accounts[buyingClubId];
  if (account === undefined) throw new Error(`Market demo finance account not found: ${buyingClubId}`);

  const targetContract = seniorSquadState.activeContractIds
    .map((contractId) => seniorSquadState.contracts[contractId])
    .find((contract) => contract?.playerId === targetPlayerId);
  if (targetContract === undefined) throw new Error(`Market demo contract not found: ${targetPlayerId}`);

  const transferBudget = transferBudgetMinorUnits as CliMoney;
  const credibleTransferWageHeadroom = Math.ceil(targetContract.annualWage * 1.25) as CliMoney;
  const requiredWageBudget = (account.committedAnnualWage + credibleTransferWageHeadroom) as CliMoney;
  const requiredCash = Math.max(
    account.cashBalance,
    transferBudget + requiredWageBudget,
  ) as CliMoney;
  const openingEntry = financeState.ledgerEntryIds
    .map((entryId) => financeState.ledgerEntries[entryId])
    .find((entry) => entry?.clubId === buyingClubId);
  if (openingEntry === undefined) {
    throw new Error(`Market demo opening finance entry not found: ${buyingClubId}`);
  }
  const fundedAccount = {
    ...account,
    cashBalance: requiredCash,
    annualTransferBudget: transferBudget,
    availableTransferBudget: transferBudget,
    annualWageBudget: Math.max(account.annualWageBudget, requiredWageBudget) as CliMoney,
  };
  if (requiredCash === account.cashBalance) {
    return {
      ...financeState,
      accounts: { ...financeState.accounts, [buyingClubId]: fundedAccount },
    };
  }

  const fundingEntryId = (
    `finance-ledger:market-demo-funding:${buyingClubId}:${transferBudgetMinorUnits}`
  ) as CliClubFinanceState["ledgerEntryIds"][number];
  return {
    ...financeState,
    accounts: { ...financeState.accounts, [buyingClubId]: fundedAccount },
    ledgerEntries: {
      ...financeState.ledgerEntries,
      [fundingEntryId]: {
        id: fundingEntryId,
        sequenceNumber: financeState.ledgerEntryIds.length + 1,
        clubId: buyingClubId,
        occurredOn: openingEntry.occurredOn,
        currency: financeState.currency,
        reason: "opening_capital",
        direction: "credit",
        amount: (requiredCash - account.cashBalance) as CliMoney,
        balanceAfter: requiredCash,
        referenceId: `market-demo-funding:${buyingClubId}:${transferBudgetMinorUnits}`,
      },
    },
    ledgerEntryIds: [...financeState.ledgerEntryIds, fundingEntryId],
  };
}

function gameStateFromWorld(world: FakeDomesticWorld, seed = "career-demo"): CliGameState {
  const calendar = combineDomesticCompetitionCalendars(
    world.domesticCompetitionWorld,
    world.domesticCompetitionWorld.competitionIds.map((competitionId) => {
      const competition = world.domesticCompetitionWorld.competitions[competitionId];
      if (competition === undefined) throw new Error(`Missing domestic competition: ${competitionId}`);
      return generateRoundRobinCalendar({
        seed,
        seasonId: world.seasonId,
        competitionId,
        clubIds: competition.clubIds,
        seasonStartDate: world.seasonStartDate,
      });
    }),
  );

  return {
    meta: {
      seed,
      rngAlgorithmVersion: "career-demo",
      saveSchemaVersion: 1,
      calibrationVersions: { ...world.calibrationVersions },
    },
    calendar: {
      currentDate: world.seasonStartDate,
      currentSeasonId: world.seasonId,
    },
    players: world.players,
    playerIds: world.playerIds,
    playerStates: world.playerStates,
    clubs: world.clubsById,
    clubIds: world.clubIds,
    fixtures: fixturesById(calendar.fixtures),
    fixtureIds: calendar.fixtureIds,
    domesticCompetitionWorld: world.domesticCompetitionWorld,
  };
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

function requiredDivisionClubId(
  world: FakeDomesticWorld,
  category: keyof FakeDomesticWorld["divisionClubIds"],
  oneBasedClubNumber: number,
): ClubId {
  const clubId = world.divisionClubIds[category][oneBasedClubNumber - 1];

  if (clubId === undefined) {
    throw new Error(String(oneBasedClubNumber));
  }

  return clubId;
}

function requiredClubPlayerId(world: FakeDomesticWorld, clubId: ClubId, oneBasedSlotNumber: number): PlayerId {
  const playerId = world.clubsById[clubId]?.playerIds[oneBasedSlotNumber - 1];

  if (playerId === undefined) {
    throw new Error(String(oneBasedSlotNumber));
  }

  return playerId;
}

/**
 * Rejects a loaded career whose immutable topology/economy asset versions are
 * absent or differ from the only bundle supported by this application build.
 */
export function assertSupportedCareerCalibrationVersions(careerState: CliCareerState): void {
  const actual = careerState.gameState.meta.calibrationVersions;
  const expected = playerEconomyCalibration.versions;
  if (actual === undefined || !sameCalibrationVersions(actual, expected)) {
    throw new Error("Unsupported career topology/calibration versions");
  }
  const selectedCompetitionId = careerState.gameState.domesticCompetitionWorld === undefined
    ? undefined
    : competitionIdForClubInWorld(
        careerState.gameState.domesticCompetitionWorld,
        careerState.selectedClubId,
      );
  if (selectedCompetitionId === undefined) {
    throw new Error("Selected club has no canonical domestic competition");
  }
}

/** Derives one club's competition without adding a second membership truth. */
export function competitionIdForClubInWorld(
  world: NonNullable<CliGameState["domesticCompetitionWorld"]>,
  clubId: ClubId,
) {
  return world.competitionIds.find((competitionId) =>
    world.competitions[competitionId]?.clubIds.includes(clubId) === true
  );
}

function sameCalibrationVersions(
  actual: PlayerEconomyCalibrationVersionBundle,
  expected: PlayerEconomyCalibrationVersionBundle,
): boolean {
  const expectedKeys = Object.keys(expected);
  return Object.keys(actual).length === expectedKeys.length
    && expectedKeys.every((key) =>
    actual[key as keyof PlayerEconomyCalibrationVersionBundle]
      === expected[key as keyof PlayerEconomyCalibrationVersionBundle]
  );
}
