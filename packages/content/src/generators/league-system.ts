import {
  competitionId,
  createCompetitionMatchRules,
  type ClubFinanceState,
  gameDate,
  seasonId,
  type Competition,
  type GameDate,
  type LeagueTableRules,
  type SeniorSquadState,
  type SeasonId,
  type SeasonTransferWindows,
} from "@game/domain";
import { fromISO } from "@game/shared";

import {
  marketBehaviorCalibration,
  playerWagePolicyConfig,
} from "../balance/player-economy-calibration.ts";
import { generateFakeClubs, type FakeClubs } from "./fake-clubs.ts";
import { generateFakePlayersForClubs, type FakePlayers } from "./fake-players.ts";
import { generateInitialSeniorSquadState } from "./senior-squad-world.ts";
import {
  resolveSeasonTransferWindows,
  seasonStartYearFromDate,
} from "./transfer-window-catalog.ts";
import {
  generateCompetitionSeasonDistribution,
  generateInitialClubFinanceState,
} from "./club-finance-world.ts";
import { createFakeGameplayConfig, type FakeGameplayConfig } from "./gameplay-config.ts";

export type {
  FakeAbilityWeightKey,
  FakeGameplayConfig,
  FakeMatchEngineConfig,
  FakePlayerStateMultiplierCurves,
  FakeRoleWeightProfile,
  FakeStateMultiplierCurve,
  FakeTeamStrengthDepartment,
} from "./gameplay-config.ts";

/**
 * Complete generated league content bundle used by CLI season simulation,
 * career creation, long-run diagnostics, and future UI bootstrapping.
 *
 * This is the content package facade: callers should prefer this bundle when
 * they need a coherent world snapshot instead of manually composing clubs,
 * players, lineups, tuning config, and season metadata from lower-level
 * generators.
 */
export interface FakeLeagueSystem extends FakeClubs, FakePlayers, FakeGameplayConfig {
  /** Initial senior registrations, contracts, and factual signing history. */
  readonly seniorSquadState: SeniorSquadState;
  /** Opening cash, annual budgets, and ordered ledgers for every club. */
  readonly clubFinanceState: ClubFinanceState;
  /** Generated season ID. */
  readonly seasonId: SeasonId;
  /** Generated single competition. */
  readonly competition: Competition;
  /** Resolved source-backed transfer windows for the generated season. */
  readonly transferWindows: SeasonTransferWindows;
  /** First round date. */
  readonly seasonStartDate: GameDate;
  /** Basic three-points-for-a-win table rules. */
  readonly tableRules: LeagueTableRules;
}

/** Options for deterministic fake league creation. */
export interface FakeLeagueSystemOptions {
  /** World/content seed used by generated players, identities, and squads. */
  readonly worldSeed?: string;
}

/**
 * Creates one deterministic generated league snapshot from a world seed.
 *
 * The function intentionally owns the top-level content composition order:
 * club identities are generated first, generated squads are attached to those
 * stable club IDs, and season-level metadata/configuration is added last. Keep
 * lower-level generators available for focused tests, but use this function as
 * the first entry point for career worlds and simulation reports.
 *
 * @example
 * const league = createFakeLeagueSystem({ worldSeed: "career-001" });
 */
export function createFakeLeagueSystem(options: FakeLeagueSystemOptions = {}): FakeLeagueSystem {
  const clubs = generateFakeClubs(options.worldSeed === undefined ? {} : { seed: options.worldSeed });
  const players = generateFakePlayersForClubs(
    clubs.clubIds,
    options.worldSeed === undefined ? {} : { seed: options.worldSeed },
  );
  const seniorSquadState = generateInitialSeniorSquadState({
    worldSeed: options.worldSeed ?? "demo-001",
    referenceDate: gameDate(fromISO("2026-08-01")),
    clubs: clubs.clubsById,
    clubIds: clubs.clubIds,
    players: players.players,
    playerIds: players.playerIds,
    wagePolicy: playerWagePolicyConfig,
  });
  const clubFinanceState = generateInitialClubFinanceState({
    referenceDate: gameDate(fromISO("2026-08-01")),
    clubs: clubs.clubsById,
    clubIds: clubs.clubIds,
    seniorSquadState,
    wagePolicy: playerWagePolicyConfig,
    marketBehaviorPolicy: marketBehaviorCalibration,
  });
  const season = seasonId("season:demo-001");
  const competition: Competition = {
    id: competitionId("competition:demo-third-division"),
    name: "Demo Third Division",
    clubIds: clubs.clubIds,
    matchRules: createCompetitionMatchRules({
      maximumSubstitutions: 5,
      substitutionWindowLimit: null,
      allowsPlayerReentry: false,
      yellowCardAccumulationThreshold: 5,
      straightRedSuspensionMatches: 3,
      secondYellowSuspensionMatches: 1,
      yellowAccumulationSuspensionMatches: 1,
    }),
    seasonDistribution: generateCompetitionSeasonDistribution(clubFinanceState),
  };
  const seasonStartDate = gameDate(fromISO("2026-08-01"));
  const transferWindows = resolveSeasonTransferWindows({
    competitionId: competition.id,
    seasonId: season,
    seasonStartYear: seasonStartYearFromDate(seasonStartDate),
  });

  const gameplayConfig = createFakeGameplayConfig();
  return {
    ...clubs,
    ...players,
    seniorSquadState,
    clubFinanceState,
    seasonId: season,
    competition,
    transferWindows,
    seasonStartDate,
    tableRules: {
      pointsForWin: 3,
      pointsForDraw: 1,
      pointsForLoss: 0,
    },
    ...gameplayConfig,
  };
}
