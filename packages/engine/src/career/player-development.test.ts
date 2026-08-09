import assert from "node:assert/strict";
import { test } from "vitest";

import {
  CAREER_STATE_SCHEMA_VERSION,
  CLUB_COMPETITIVE_TIER_POLICY_VERSION,
  PLAYER_ABILITY_KEYS,
  accruePlayerFixtureParticipation,
  abilityValue,
  clubId,
  createCareerState,
  createEmptyPlayerParticipationLedger,
  fixtureId,
  gameDate,
  hardCapForRoleAbility,
  playerId,
  readPlayerAbility,
  saveId,
  seasonId,
  stateValue,
  type CareerState,
  type Club,
  type ClubCategory,
  type ClubCompetitiveTier,
  type ClubId,
  type FixtureId,
  type GameState,
  type Player,
  type PlayerAbilities,
  type PlayerDynamicState,
  type PlayerId,
  type PlayerPosition,
  type PlayerParticipationRow,
  type SeasonId,
} from "@game/domain";
import { fromISO, toISO } from "@game/shared";

import {
  derivePlayerDevelopmentEnvironmentEvidence,
  developPlayersFromParticipationRows,
  monthlyDevelopmentVariance,
  PlayerDevelopmentError,
  summarizePlayerDevelopmentAbilities,
  type PlayerMonthlyDevelopmentChange,
} from "./player-development.ts";
import {
  playerDevelopmentCalibrationVersionsFixture,
  playerDevelopmentEnvironmentConfigFixture,
} from "../test-fixtures/player-development-environment-config.ts";

function developFixturePlayers(input: {
  readonly careerState: CareerState;
  readonly worldSeed: string;
  readonly seasonId: SeasonId;
}) {
  const ledger = input.careerState.playerParticipationLedger;
  const participationRows = ledger?.rowKeys
    .map((rowKey) => ledger.rows[rowKey])
    .filter((row): row is NonNullable<typeof row> =>
      row !== undefined && row.seasonId === input.seasonId,
    ) ?? [];

  return developPlayersFromParticipationRows({
    ...input,
    participationRows,
    developmentEnvironmentConfig: playerDevelopmentEnvironmentConfigFixture(),
  });
}

/**
 * Player-development tests protect the Phase 28 growth model before decline
 * and long-run reporting are layered on top.
 */

test("developFixturePlayers grows an ordinary young player deterministically", () => {
  const young = playerId("player:young");
  const careerState = careerStateFixture([
    playerFixture(young, "st", 19, abilitySet(8), abilitySet(11)),
  ]);

  const result = developFixturePlayers({
    careerState,
    worldSeed: "development-world",
    seasonId: seasonId("season:0001"),
  });
  const developed = requiredPlayer(result.careerState, young);

  assert.equal(result.changes[0]?.playerId, young);
  assert.equal(result.changes[0]?.age, 19);
  assert.equal(result.changes[0]?.improvedAbilityCount > 0, true);
  assert.equal(developed.abilities.technical.finishing > 8, true);
  assert.equal(developed.abilities.technical.finishing <= 11, true);
});

test("developFixturePlayers reports current and potential through the same role profile", () => {
  const young = playerId("player:role-summary");
  const careerState = careerStateFixture([
    playerFixture(young, "cm", 19, abilitySet(8), abilitySet(11)),
  ]);

  const result = developFixturePlayers({
    careerState,
    worldSeed: "role-summary-world",
    seasonId: seasonId("season:0001"),
  });
  const change = result.changes[0];

  assert.equal(change?.roleCurrentAbilityBefore, 8);
  assert.equal((change?.roleCurrentAbilityAfter ?? 0) > 8, true);
  assert.equal((change?.rolePotentialAbility ?? 0) <= 11, true);
  assert.equal(
    (change?.rolePotentialAbility ?? 0) >= (change?.roleCurrentAbilityAfter ?? 0),
    true,
  );
  assert.equal(summarizePlayerDevelopmentAbilities(requiredPlayer(result.careerState, young), "central_midfielder").measure, "role");
});

test("developFixturePlayers stalls cleanly when every attribute has no potential room", () => {
  const player = playerId("player:no-room");
  const careerState = careerStateFixture([
    playerFixture(player, "cm", 18, abilitySet(8), abilitySet(8)),
  ]);

  const result = developFixturePlayers({
    careerState,
    worldSeed: "no-room-world",
    seasonId: seasonId("season:0001"),
  });

  assert.equal(result.changes[0]?.totalGrowth, 0);
  assert.equal(result.changes[0]?.improvedAbilityCount, 0);
  assert.deepEqual(requiredPlayer(result.careerState, player).abilities, requiredPlayer(careerState, player).abilities);
});

test("potential room is a ceiling rather than a second monthly-rate multiplier", () => {
  const player = playerId("player:room-test");
  const ordinary = developFixturePlayers({
    careerState: careerStateFixture([playerFixture(player, "cm", 18, abilitySet(8), abilitySet(11))]),
    worldSeed: "same-realization-world",
    seasonId: seasonId("season:0001"),
  });
  const seriousProspect = developFixturePlayers({
    careerState: careerStateFixture([playerFixture(player, "cm", 18, abilitySet(8), abilitySet(16))]),
    worldSeed: "same-realization-world",
    seasonId: seasonId("season:0001"),
  });

  assert.equal(seriousProspect.changes[0]?.totalGrowth, ordinary.changes[0]?.totalGrowth);
});

test("developFixturePlayers gives a rare prodigy upside without exceeding potential", () => {
  const prodigy = playerId("player:rare-prodigy");
  const careerState = careerStateFixture([
    playerFixture(prodigy, "st", 17, abilitySet(6), abilitySet(18)),
  ]);

  const result = developFixturePlayers({
    careerState,
    worldSeed: "rare-prodigy-world",
    seasonId: seasonId("season:0001"),
  });
  const developed = requiredPlayer(result.careerState, prodigy);

  assert.equal((result.changes[0]?.improvedAbilityCount ?? 0) > 0, true);
  assert.equal(developed.abilities.technical.finishing <= 18, true);
  assert.equal(developed.abilities.physical.pace <= 18, true);
});

test("developFixturePlayers does not grow a peak-age senior attacker in the growth-only step", () => {
  const senior = playerId("player:senior");
  const careerState = careerStateFixture([
    playerFixture(senior, "st", 28, abilitySet(12), abilitySet(16)),
  ]);

  const result = developFixturePlayers({
    careerState,
    worldSeed: "senior-world",
    seasonId: seasonId("season:0001"),
  });

  assert.equal(result.changes[0]?.totalGrowth, 0);
  assert.deepEqual(requiredPlayer(result.careerState, senior).abilities, requiredPlayer(careerState, senior).abilities);
});

test("developFixturePlayers produces identical output for the same seed and season", () => {
  const player = playerId("player:deterministic");
  const careerState = careerStateFixture([
    playerFixture(player, "rw", 20, abilitySet(8), abilitySet(14)),
  ]);

  const first = developFixturePlayers({
    careerState,
    worldSeed: "deterministic-world",
    seasonId: seasonId("season:0001"),
  });
  const second = developFixturePlayers({
    careerState,
    worldSeed: "deterministic-world",
    seasonId: seasonId("season:0001"),
  });

  assert.deepEqual(second, first);
});

test("developPlayersFromParticipationRows makes a quarterly batch equal sequential months", () => {
  const targetPlayer = playerId("player:quarterly-equivalence");
  let careerState = careerStateFixture([
    playerFixture(targetPlayer, "cm", 18, abilitySet(8), abilitySet(15)),
  ]);
  careerState = careerStateWithParticipationMonth({
    careerState,
    targetSeasonId: seasonId("season:0001"),
    monthKey: "2024-11",
    fixturesPerPlayer: 5,
    minutesPerFixture: 90,
  });
  careerState = careerStateWithParticipationMonth({
    careerState,
    targetSeasonId: seasonId("season:0001"),
    monthKey: "2024-12",
    fixturesPerPlayer: 5,
    minutesPerFixture: 90,
  });
  const rows = participationRowsFor(careerState, seasonId("season:0001"));
  const stateBefore = structuredClone(careerState);

  const quarterly = developPlayersFromParticipationRows({
    careerState,
    worldSeed: "quarterly-equivalence-world",
    seasonId: seasonId("season:0001"),
    participationRows: [...rows].reverse(),
    developmentEnvironmentConfig: playerDevelopmentEnvironmentConfigFixture(),
  });
  let sequentialState = careerState;
  const sequentialMonthlyChanges: PlayerMonthlyDevelopmentChange[] = [];
  for (const row of rows) {
    const month = developPlayersFromParticipationRows({
      careerState: sequentialState,
      worldSeed: "quarterly-equivalence-world",
      seasonId: seasonId("season:0001"),
      participationRows: [row],
      developmentEnvironmentConfig: playerDevelopmentEnvironmentConfigFixture(),
    });
    sequentialState = month.careerState;
    sequentialMonthlyChanges.push(...month.monthlyChanges);
  }

  assert.deepEqual(quarterly.careerState.gameState.players, sequentialState.gameState.players);
  assert.deepEqual(quarterly.monthlyChanges, sequentialMonthlyChanges);
  assert.deepEqual(quarterly.careerState.playerParticipationLedger, careerState.playerParticipationLedger);
  assert.deepEqual(careerState, stateBefore);
});

test("developPlayersFromParticipationRows derives age at each month-end birthday boundary", () => {
  const targetPlayer = playerId("player:birthday-boundary");
  let careerState = careerStateFixture([{
    ...playerFixture(targetPlayer, "cm", 18, abilitySet(8), abilitySet(14)),
    birthDate: gameDate(fromISO("2005-11-15")),
  }]);
  careerState = careerStateWithParticipationMonth({
    careerState,
    targetSeasonId: seasonId("season:0001"),
    monthKey: "2024-11",
    fixturesPerPlayer: 5,
    minutesPerFixture: 90,
  });

  const result = developPlayersFromParticipationRows({
    careerState,
    worldSeed: "birthday-boundary-world",
    seasonId: seasonId("season:0001"),
    participationRows: participationRowsFor(careerState, seasonId("season:0001")),
    developmentEnvironmentConfig: playerDevelopmentEnvironmentConfigFixture(),
  });

  assert.deepEqual(result.monthlyChanges.map((change) => change.age), [18, 19]);
  assert.equal(result.changes[0]?.age, 19);
});

test("monthlyDevelopmentVariance is stable per player season and month", () => {
  const targetPlayer = playerId("player:monthly-variance");
  const input = {
    worldSeed: "monthly-variance-world",
    seasonId: seasonId("season:0001"),
    monthKey: "2024-10",
    playerId: targetPlayer,
  } as const;
  const first = monthlyDevelopmentVariance(input);

  assert.equal(monthlyDevelopmentVariance(input), first);
  assert.equal(first >= 0.65 && first < 1.35, true);
  assert.notEqual(
    monthlyDevelopmentVariance({ ...input, monthKey: "2024-11" }),
    first,
  );
});

test("club environment scales positive growth but cannot invent bench growth", () => {
  const targetPlayer = playerId("player:environment-growth");
  const poorState = careerStateFixture([
    playerFixture(targetPlayer, "cm", 18, abilitySet(8), abilitySet(15)),
  ]);
  const excellentState = withSelectedClubContext(
    poorState,
    "first_division",
    "title_contender",
  );
  const poor = developFixturePlayers({
    careerState: poorState,
    worldSeed: "environment-growth-world",
    seasonId: seasonId("season:0001"),
  });
  const excellent = developFixturePlayers({
    careerState: excellentState,
    worldSeed: "environment-growth-world",
    seasonId: seasonId("season:0001"),
  });

  assert.equal((excellent.changes[0]?.totalGrowth ?? 0) > (poor.changes[0]?.totalGrowth ?? 0), true);
  assert.equal(excellent.monthlyChanges[0]?.positiveGrowthEnvironmentBasisPoints, 11_000);
  assert.equal(poor.monthlyChanges[0]?.positiveGrowthEnvironmentBasisPoints, 9_500);

  let benchLedger = createEmptyPlayerParticipationLedger();
  benchLedger = accruePlayerFixtureParticipation(benchLedger, {
    fixtureId: fixtureId("fixture:unused-bench"),
    clubId: excellentState.selectedClubId,
    playerId: targetPlayer,
    seasonId: seasonId("season:0001"),
    monthKey: "2024-10",
    started: false,
    substituteAppearance: false,
    minutes: 0,
    playedRoleMinutes: {},
  });
  const benchState = createCareerState({
    ...excellentState,
    playerParticipationLedger: benchLedger,
  });
  const bench = developFixturePlayers({
    careerState: benchState,
    worldSeed: "environment-growth-world",
    seasonId: seasonId("season:0001"),
  });

  assert.equal(bench.changes[0]?.totalGrowth, 0);
  assert.deepEqual(
    requiredPlayer(bench.careerState, targetPlayer).abilities,
    requiredPlayer(benchState, targetPlayer).abilities,
  );
});

test("environment evidence is pure, ordered, and keeps zero minutes unobserved", () => {
  const targetPlayer = playerId("player:environment-evidence");
  const careerState = careerStateFixture([
    playerFixture(targetPlayer, "cm", 18, abilitySet(8), abilitySet(15)),
  ]);
  const playedRow = participationRowsFor(
    careerState,
    seasonId("season:0001"),
  )[0]!;
  const zeroRow: PlayerParticipationRow = {
    ...playedRow,
    rowKey: `${playedRow.rowKey}:zero`,
    monthKey: "2024-11",
    starts: 0,
    substituteAppearances: 0,
    minutes: 0,
    ratingTotal: 0,
    ratingSamples: 0,
    playedRoleMinutes: {},
    clubMinutes: {},
    appliedFixtureIds: [],
  };
  const stateBefore = structuredClone(careerState);
  const input = {
    careerState,
    participationRows: [zeroRow, playedRow],
    developmentEnvironmentConfig: playerDevelopmentEnvironmentConfigFixture(),
  } as const;
  const first = derivePlayerDevelopmentEnvironmentEvidence(input);

  assert.deepEqual(first.map(({ rowKey }) => rowKey), [
    zeroRow.rowKey,
    playedRow.rowKey,
  ]);
  assert.deepEqual(first[0], {
    rowKey: zeroRow.rowKey,
    playerId: targetPlayer,
    monthKey: "2024-11",
    sourceMinutes: 0,
    positiveGrowthEnvironmentBasisPoints: 10_000,
  });
  assert.deepEqual(derivePlayerDevelopmentEnvironmentEvidence(input), first);
  assert.deepEqual(careerState, stateBefore);
});

test("environment evidence weights multi-club minutes and rejects mismatches", () => {
  const targetPlayer = playerId("player:multi-club-environment");
  const poorState = careerStateFixture([
    playerFixture(targetPlayer, "cm", 18, abilitySet(8), abilitySet(15)),
  ]);
  const excellentClubId = clubId("club:excellent-environment");
  const careerState = withAdditionalClubContext(
    poorState,
    excellentClubId,
    "first_division",
    "title_contender",
  );
  const sourceRow = participationRowsFor(
    careerState,
    seasonId("season:0001"),
  )[0]!;
  const weightedRow: PlayerParticipationRow = {
    ...sourceRow,
    clubMinutes: {
      [careerState.selectedClubId]: sourceRow.minutes / 2,
      [excellentClubId]: sourceRow.minutes / 2,
    },
  };
  const evidence = derivePlayerDevelopmentEnvironmentEvidence({
    careerState,
    participationRows: [weightedRow],
    developmentEnvironmentConfig: playerDevelopmentEnvironmentConfigFixture(),
  });

  assert.equal(evidence[0]?.sourceMinutes, sourceRow.minutes);
  assert.equal(evidence[0]?.positiveGrowthEnvironmentBasisPoints, 10_250);
  assert.throws(
    () => derivePlayerDevelopmentEnvironmentEvidence({
      careerState,
      participationRows: [{
        ...weightedRow,
        clubMinutes: { [careerState.selectedClubId]: sourceRow.minutes - 1 },
      }],
      developmentEnvironmentConfig: playerDevelopmentEnvironmentConfigFixture(),
    }),
    (error) =>
      error instanceof PlayerDevelopmentError
      && error.code === "participation_club_minutes_mismatch",
  );
});

test("developPlayersFromParticipationRows rejects positive minutes without club evidence", () => {
  const targetPlayer = playerId("player:missing-club-evidence");
  const careerState = careerStateFixture([
    playerFixture(targetPlayer, "cm", 18, abilitySet(8), abilitySet(15)),
  ]);
  const row = participationRowsFor(careerState, seasonId("season:0001"))[0]!;

  assert.throws(
    () => developPlayersFromParticipationRows({
      careerState,
      worldSeed: "missing-club-evidence-world",
      seasonId: seasonId("season:0001"),
      participationRows: [{ ...row, clubMinutes: {} }],
      developmentEnvironmentConfig: playerDevelopmentEnvironmentConfigFixture(),
    }),
    (error) =>
      error instanceof PlayerDevelopmentError
      && error.code === "missing_participation_club_minutes",
  );
});

test("developFixturePlayers keeps growth role-relevant for an attacker", () => {
  const attacker = playerId("player:role-relevant");
  const careerState = careerStateFixture([
    playerFixture(attacker, "st", 19, abilitySet(8), abilitySet(14)),
  ]);

  const result = developFixturePlayers({
    careerState,
    worldSeed: "role-world",
    seasonId: seasonId("season:0001"),
  });
  const before = requiredPlayer(careerState, attacker);
  const after = requiredPlayer(result.careerState, attacker);
  const finishingGrowth = after.abilities.technical.finishing - before.abilities.technical.finishing;
  const tacklingGrowth = after.abilities.technical.tackling - before.abilities.technical.tackling;

  assert.equal(finishingGrowth > tacklingGrowth, true);
});

test("developFixturePlayers does not grow a center back past the finishing hard cap", () => {
  const defender = playerId("player:defender-finishing-cap");
  let careerState = careerStateFixture([
    playerFixture(defender, "cb", 18, abilitySet(10), abilitySet(20)),
  ]);

  for (let seasonNumber = 1; seasonNumber <= 6; seasonNumber += 1) {
    const currentSeasonId = seasonId(`season:${String(seasonNumber).padStart(4, "0")}`);
    careerState = careerStateWithMonthlyParticipation(careerState, currentSeasonId);
    careerState = developFixturePlayers({
      careerState,
      worldSeed: "defender-cap-world",
      seasonId: currentSeasonId,
    }).careerState;
    careerState = careerStateWithCurrentDate(careerState, gameDate(20_000 + seasonNumber * 365));
  }

  const developed = requiredPlayer(careerState, defender);
  assert.equal(Number(developed.abilities.technical.finishing), 10);
  assert.equal(Number(developed.abilities.technical.tackling) > 10, true);
});

test("developFixturePlayers does not grow a striker past the tackling hard cap", () => {
  const striker = playerId("player:striker-tackling-cap");
  let careerState = careerStateFixture([
    playerFixture(striker, "st", 18, abilitySet(10), abilitySet(20)),
  ]);

  for (let seasonNumber = 1; seasonNumber <= 6; seasonNumber += 1) {
    const currentSeasonId = seasonId(`season:${String(seasonNumber).padStart(4, "0")}`);
    careerState = careerStateWithMonthlyParticipation(careerState, currentSeasonId);
    careerState = developFixturePlayers({
      careerState,
      worldSeed: "striker-cap-world",
      seasonId: currentSeasonId,
    }).careerState;
    careerState = careerStateWithCurrentDate(careerState, gameDate(20_000 + seasonNumber * 365));
  }

  const developed = requiredPlayer(careerState, striker);
  assert.equal(Number(developed.abilities.technical.tackling), 10);
  assert.equal(Number(developed.abilities.technical.finishing) > 10, true);
});

test("developFixturePlayers keeps every seven-season center-back ability inside potential, scale, and role caps", () => {
  const defender = playerId("player:all-center-back-caps");
  let careerState = careerStateFixture([
    playerFixture(defender, "cb", 17, abilitySet(4), abilitySet(20)),
  ]);

  for (let seasonNumber = 1; seasonNumber <= 7; seasonNumber += 1) {
    const currentSeasonId = seasonId(`season:${String(seasonNumber).padStart(4, "0")}`);
    careerState = careerStateWithMonthlyParticipation(careerState, currentSeasonId);
    careerState = developFixturePlayers({
      careerState,
      worldSeed: "all-center-back-caps-world",
      seasonId: currentSeasonId,
    }).careerState;
    careerState = careerStateWithCurrentDate(careerState, gameDate(20_000 + seasonNumber * 365));
  }

  const developed = requiredPlayer(careerState, defender);
  for (const key of PLAYER_ABILITY_KEYS) {
    const value = Number(readPlayerAbility(developed.abilities, key));
    const potential = Number(readPlayerAbility(developed.potential, key));
    const cap = hardCapForRoleAbility("center_back", key) ?? 20;
    assert.equal(value >= 1 && value <= Math.min(potential, cap), true, `${key}=${value}`);
  }
});

test("developFixturePlayers keeps goalkeepers goalkeeper-shaped", () => {
  const goalkeeper = playerId("player:keeper-shape");
  const careerState = careerStateFixture([
    playerFixture(goalkeeper, "gk", 19, abilitySet(5), abilitySet(18)),
  ]);

  const result = developFixturePlayers({
    careerState,
    worldSeed: "goalkeeper-shape-world",
    seasonId: seasonId("season:0001"),
  });
  const developed = requiredPlayer(result.careerState, goalkeeper);

  assert.equal(Number(developed.abilities.goalkeeping.reflexes) > 5, true);
  assert.equal(Number(developed.abilities.technical.finishing), 5);
  assert.equal(Number(developed.abilities.technical.tackling), 5);
});

test("developFixturePlayers preserves explicit primary role while developing", () => {
  const player = playerId("player:stable-primary-role");
  const careerState = careerStateFixture([
    {
      ...playerFixture(player, "cm", 18, abilitySet(8), abilitySet(16)),
      primaryRole: "defensive_midfielder",
    },
  ]);

  const result = developFixturePlayers({
    careerState,
    worldSeed: "stable-primary-role-world",
    seasonId: seasonId("season:0001"),
  });

  assert.equal(requiredPlayer(result.careerState, player).primaryRole, "defensive_midfielder");
});

test("developFixturePlayers declines old outfield physical ability before technical ability", () => {
  const defender = playerId("player:old-defender");
  const careerState = careerStateFixture([
    playerFixture(defender, "cb", 34, abilitySet(12), abilitySet(12)),
  ]);

  const result = developFixturePlayers({
    careerState,
    worldSeed: "decline-defender-world",
    seasonId: seasonId("season:0001"),
  });
  const before = requiredPlayer(careerState, defender);
  const after = requiredPlayer(result.careerState, defender);
  const paceDecline = before.abilities.physical.pace - after.abilities.physical.pace;
  const passingDecline = before.abilities.technical.passing - after.abilities.technical.passing;

  assert.equal((result.changes[0]?.totalDecline ?? 0) > 0, true);
  assert.equal(paceDecline > passingDecline, true);
});

test("developFixturePlayers uses later decline windows for goalkeepers", () => {
  const earlyKeeper = playerId("player:early-keeper");
  const decliningKeeper = playerId("player:declining-keeper");

  const early = developFixturePlayers({
    careerState: careerStateFixture([playerFixture(earlyKeeper, "gk", 32, abilitySet(12), abilitySet(12))]),
    worldSeed: "keeper-decline-world",
    seasonId: seasonId("season:0001"),
  });
  const declining = developFixturePlayers({
    careerState: careerStateFixture([playerFixture(decliningKeeper, "gk", 35, abilitySet(12), abilitySet(12))]),
    worldSeed: "keeper-decline-world",
    seasonId: seasonId("season:0001"),
  });

  assert.equal(early.changes[0]?.totalDecline, 0);
  assert.equal((declining.changes[0]?.totalDecline ?? 0) > 0, true);
  assert.equal(requiredPlayer(declining.careerState, decliningKeeper).abilities.goalkeeping.footwork < 12, true);
});

test("developFixturePlayers declines late-career attackers", () => {
  const attacker = playerId("player:old-attacker");
  const careerState = careerStateFixture([
    playerFixture(attacker, "st", 33, abilitySet(13), abilitySet(13)),
  ]);

  const result = developFixturePlayers({
    careerState,
    worldSeed: "decline-attacker-world",
    seasonId: seasonId("season:0001"),
  });
  const after = requiredPlayer(result.careerState, attacker);

  assert.equal((result.changes[0]?.declinedAbilityCount ?? 0) > 0, true);
  assert.equal(after.abilities.physical.pace < 13, true);
});

test("developFixturePlayers never declines an ability below the generated scale floor", () => {
  const veteran = playerId("player:decline-floor");
  const careerState = careerStateFixture([
    playerFixture(veteran, "st", 38, abilitySet(1), abilitySet(7)),
  ]);

  const result = developFixturePlayers({
    careerState,
    worldSeed: "decline-floor-world",
    seasonId: seasonId("season:0001"),
  });
  const developed = requiredPlayer(result.careerState, veteran);

  assert.equal(result.changes[0]?.totalDecline, 0);
  assert.equal(developed.abilities.physical.pace, 7);
  assert.equal(developed.abilities.physical.stamina, 7);
  assert.equal(developed.abilities.physical.agility, 7);
  assert.equal(developed.abilities.physical.strength, 7);
  assert.equal(developed.abilities.physical.heading, 7);
  assert.equal(developed.abilities.technical.finishing, 1);
  assert.equal(developed.abilities.mental.composure, 1);
});

test("developFixturePlayers does not decline young players", () => {
  const young = playerId("player:no-decline-young");
  const careerState = careerStateFixture([
    playerFixture(young, "cb", 20, abilitySet(10), abilitySet(10)),
  ]);

  const result = developFixturePlayers({
    careerState,
    worldSeed: "no-decline-world",
    seasonId: seasonId("season:0001"),
  });

  assert.equal(result.changes[0]?.totalDecline, 0);
  assert.deepEqual(requiredPlayer(result.careerState, young).abilities, requiredPlayer(careerState, young).abilities);
});

test("developFixturePlayers creates varied deterministic paths for similar prospects", () => {
  const first = playerId("player:similar-01");
  const second = playerId("player:similar-02");
  const third = playerId("player:similar-03");
  const careerState = careerStateFixture([
    playerFixture(first, "cm", 18, abilitySet(8), abilitySet(15)),
    playerFixture(second, "cm", 18, abilitySet(8), abilitySet(15)),
    playerFixture(third, "cm", 18, abilitySet(8), abilitySet(15)),
  ]);

  const result = developFixturePlayers({
    careerState,
    worldSeed: "varied-prospects-world",
    seasonId: seasonId("season:0001"),
  });
  const growthValues = result.changes.map((change) => change.totalGrowth);

  assert.equal(new Set(growthValues).size > 1, true);
});

test("developFixturePlayers never lets long-run growth exceed true potential", () => {
  const prospect = playerId("player:bounded-prospect");
  let careerState = careerStateFixture([
    playerFixture(prospect, "st", 17, abilitySet(8), abilitySet(11)),
  ]);

  for (let seasonNumber = 1; seasonNumber <= 7; seasonNumber += 1) {
    const currentSeasonId = seasonId(`season:${String(seasonNumber).padStart(4, "0")}`);
    careerState = careerStateWithMonthlyParticipation(careerState, currentSeasonId);
    careerState = developFixturePlayers({
      careerState,
      worldSeed: "bounded-world",
      seasonId: currentSeasonId,
    }).careerState;
    careerState = careerStateWithCurrentDate(careerState, gameDate(20_000 + seasonNumber * 365));
  }

  const player = requiredPlayer(careerState, prospect);
  assert.equal(player.abilities.technical.finishing <= 11, true);
  assert.equal(player.abilities.physical.pace <= 11, true);
});

test("canonical academy minutes realize high room by age 24 without inflating ordinary room", () => {
  const highRoom = playerId("player:academy-high-room");
  const ordinaryRoom = playerId("player:academy-ordinary-room");
  let careerState = careerStateFixture([
    playerFixture(highRoom, "st", 17, abilitySet(8), abilitySet(15)),
    playerFixture(ordinaryRoom, "st", 17, abilitySet(8), abilitySet(9)),
  ]);
  let maximumMonthlyAbilityGrowth = 0;

  for (let monthIndex = 0; monthIndex < 80; monthIndex += 1) {
    const seasonNumber = Math.floor(monthIndex / 10) + 1;
    const currentSeasonId = seasonId(`season:${String(seasonNumber).padStart(4, "0")}`);
    const monthKey = developmentMonthKey(monthIndex);
    const before = requiredPlayer(careerState, highRoom);
    careerState = careerStateWithParticipationMonth({
      careerState,
      targetSeasonId: currentSeasonId,
      monthKey,
      fixturesPerPlayer: 3,
      minutesPerFixture: 90,
    });
    const rowKeys = careerState.playerParticipationLedger?.rowKeys ?? [];
    const rows = rowKeys.flatMap((rowKey) => {
      const row = careerState.playerParticipationLedger?.rows[rowKey];
      return row?.seasonId === currentSeasonId && row.monthKey === monthKey ? [row] : [];
    });
    const developed = developPlayersFromParticipationRows({
      careerState,
      worldSeed: "academy-realization-world",
      seasonId: currentSeasonId,
      participationRows: rows,
      developmentEnvironmentConfig: playerDevelopmentEnvironmentConfigFixture(),
    });
    careerState = developed.careerState;

    {
      const after = requiredPlayer(careerState, highRoom);
      maximumMonthlyAbilityGrowth = Math.max(
        maximumMonthlyAbilityGrowth,
        ...PLAYER_ABILITY_KEYS.map((key) =>
        Number(readPlayerAbility(after.abilities, key))
          - Number(readPlayerAbility(before.abilities, key))),
      );
    }
  }

  const high = summarizePlayerDevelopmentAbilities(
    requiredPlayer(careerState, highRoom),
    "striker",
  );
  const ordinary = summarizePlayerDevelopmentAbilities(
    requiredPlayer(careerState, ordinaryRoom),
    "striker",
  );

  assert.equal(maximumMonthlyAbilityGrowth > 0.08, true);
  assert.equal(Number(high.currentAbility.toFixed(3)), 12.99);
  assert.equal(high.currentAbility <= high.potentialAbility, true);
  assert.equal(ordinary.currentAbility <= 9, true, JSON.stringify(ordinary));
  assert.equal(high.currentAbility - 8 > ordinary.currentAbility - 8, true);
});

test("developFixturePlayers does not turn every high-upside youth into a star", () => {
  let careerState = careerStateFixture([
    playerFixture(playerId("player:sample-01"), "st", 17, abilitySet(6), abilitySet(18)),
    playerFixture(playerId("player:sample-02"), "st", 17, abilitySet(6), abilitySet(18)),
    playerFixture(playerId("player:sample-03"), "st", 17, abilitySet(6), abilitySet(18)),
    playerFixture(playerId("player:sample-04"), "st", 17, abilitySet(6), abilitySet(18)),
    playerFixture(playerId("player:sample-05"), "st", 17, abilitySet(6), abilitySet(18)),
    playerFixture(playerId("player:sample-06"), "st", 17, abilitySet(6), abilitySet(18)),
    playerFixture(playerId("player:sample-07"), "st", 17, abilitySet(6), abilitySet(18)),
    playerFixture(playerId("player:sample-08"), "st", 17, abilitySet(6), abilitySet(18)),
  ]);

  for (let seasonNumber = 1; seasonNumber <= 7; seasonNumber += 1) {
    const currentSeasonId = seasonId(`season:${String(seasonNumber).padStart(4, "0")}`);
    careerState = careerStateWithMonthlyParticipation(careerState, currentSeasonId);
    careerState = developFixturePlayers({
      careerState,
      worldSeed: "not-all-stars-world",
      seasonId: currentSeasonId,
    }).careerState;
    careerState = careerStateWithCurrentDate(careerState, gameDate(20_000 + seasonNumber * 365));
  }

  let firstDivisionReadyCount = 0;
  for (const playerIdValue of careerState.gameState.playerIds) {
    if (requiredPlayer(careerState, playerIdValue).abilities.technical.finishing >= 15) {
      firstDivisionReadyCount += 1;
    }
  }

  assert.equal(firstDivisionReadyCount < careerState.gameState.playerIds.length, true);
});

function careerStateFixture(players: readonly Player[]): CareerState {
  const selectedClubId = clubId("club:selected");

  const careerState = createCareerState({
    saveId: saveId("save:player-development"),
    schemaVersion: CAREER_STATE_SCHEMA_VERSION,
    selectedClubId,
    gameState: gameStateFixture(selectedClubId, players),
    clubCompetitiveTierState: {
      policyVersion: CLUB_COMPETITIVE_TIER_POLICY_VERSION,
      seasonId: seasonId("season:0001"),
      tierByClubId: {
        [selectedClubId]: "mid_table",
      },
    },
    transferHistory: [],
  });
  return careerStateWithMonthlyParticipation(careerState, careerState.gameState.calendar.currentSeasonId);
}

function careerStateWithCurrentDate(careerState: CareerState, currentDate: GameState["calendar"]["currentDate"]): CareerState {
  return createCareerState({
    ...careerState,
    gameState: {
      ...careerState.gameState,
      calendar: {
        ...careerState.gameState.calendar,
        currentDate,
      },
    },
  });
}

function participationRowsFor(
  careerState: CareerState,
  targetSeasonId: SeasonId,
): readonly PlayerParticipationRow[] {
  const ledger = careerState.playerParticipationLedger;
  return ledger?.rowKeys
    .map((rowKey) => ledger.rows[rowKey])
    .filter((row): row is PlayerParticipationRow =>
      row !== undefined && row.seasonId === targetSeasonId,
    ) ?? [];
}

function withSelectedClubContext(
  careerState: CareerState,
  category: ClubCategory,
  competitiveTier: ClubCompetitiveTier,
): CareerState {
  const selectedClub = careerState.gameState.clubs[careerState.selectedClubId]!;

  return createCareerState({
    ...careerState,
    gameState: {
      ...careerState.gameState,
      clubs: {
        ...careerState.gameState.clubs,
        [selectedClub.id]: {
          ...selectedClub,
          category,
        },
      },
    },
    clubCompetitiveTierState: {
      ...careerState.clubCompetitiveTierState,
      tierByClubId: {
        ...careerState.clubCompetitiveTierState.tierByClubId,
        [selectedClub.id]: competitiveTier,
      },
    },
  });
}

function withAdditionalClubContext(
  careerState: CareerState,
  additionalClubId: ClubId,
  category: ClubCategory,
  competitiveTier: ClubCompetitiveTier,
): CareerState {
  return createCareerState({
    ...careerState,
    gameState: {
      ...careerState.gameState,
      clubs: {
        ...careerState.gameState.clubs,
        [additionalClubId]: {
          id: additionalClubId,
          name: "Additional",
          shortName: "ADD",
          category,
          reputation: 15,
          playerIds: [],
        },
      },
      clubIds: [...careerState.gameState.clubIds, additionalClubId],
    },
    clubCompetitiveTierState: {
      ...careerState.clubCompetitiveTierState,
      tierByClubId: {
        ...careerState.clubCompetitiveTierState.tierByClubId,
        [additionalClubId]: competitiveTier,
      },
    },
  });
}

function careerStateWithMonthlyParticipation(careerState: CareerState, targetSeasonId: SeasonId): CareerState {
  return careerStateWithParticipationMonth({
    careerState,
    targetSeasonId,
    monthKey: toISO(careerState.gameState.calendar.currentDate).slice(0, 7),
    fixturesPerPlayer: 5,
    minutesPerFixture: 90,
  });
}

function developmentMonthKey(monthIndex: number): string {
  const absoluteMonth = 7 + monthIndex;
  const year = 2024 + Math.floor(absoluteMonth / 12);
  const month = absoluteMonth % 12 + 1;
  return `${year}-${String(month).padStart(2, "0")}`;
}

function careerStateWithParticipationMonth(input: {
  readonly careerState: CareerState;
  readonly targetSeasonId: SeasonId;
  readonly monthKey: string;
  readonly fixturesPerPlayer: number;
  readonly minutesPerFixture: number;
}): CareerState {
  if (input.careerState.playerParticipationLedger?.rowKeys.some(
    (rowKey) => rowKey.startsWith(`${input.targetSeasonId}|${input.monthKey}|`),
  ) === true) {
    return input.careerState;
  }

  let playerParticipationLedger =
    input.careerState.playerParticipationLedger
    ?? createEmptyPlayerParticipationLedger();
  input.careerState.gameState.playerIds.forEach((id, playerIndex) => {
    const player = requiredPlayer(input.careerState, id);
    const role = roleForPosition(player.naturalPositions[0]);
    for (
      let fixtureNumber = 1;
      fixtureNumber <= input.fixturesPerPlayer;
      fixtureNumber += 1
    ) {
      const minutes = input.minutesPerFixture;
      playerParticipationLedger = accruePlayerFixtureParticipation(
        playerParticipationLedger,
        {
          fixtureId: fixtureIdForParticipation(
            input.targetSeasonId,
            input.monthKey,
            id,
            fixtureNumber,
          ),
          clubId: input.careerState.selectedClubId,
          playerId: id,
          seasonId: input.targetSeasonId,
          monthKey: input.monthKey,
          started: minutes > 0 && fixtureNumber <= 4,
          substituteAppearance: minutes > 0 && fixtureNumber === 5,
          minutes,
          ...(minutes === 0
            ? {}
            : { rating: 6.8 + ((playerIndex + fixtureNumber) % 3) * 0.2 }),
          playedRoleMinutes: minutes === 0 ? {} : { [role]: minutes },
        },
      );
    }
  });

  return createCareerState({
    ...input.careerState,
    playerParticipationLedger,
  });
}

function fixtureIdForParticipation(
  targetSeasonId: SeasonId,
  monthKey: string,
  id: PlayerId,
  fixtureNumber: number,
): FixtureId {
  return fixtureId(`fixture:${String(targetSeasonId).replace("season:", "")}-${monthKey}-${String(id).replace("player:", "")}-${fixtureNumber}`);
}

function roleForPosition(position: PlayerPosition | undefined) {
  switch (position) {
    case "gk":
      return "goalkeeper";
    case "cb":
      return "center_back";
    case "rb":
    case "lb":
      return "full_back";
    case "rwb":
    case "lwb":
      return "wing_back";
    case "dm":
      return "defensive_midfielder";
    case "am":
      return "attacking_midfielder";
    case "rw":
      return "right_winger";
    case "lw":
      return "left_winger";
    case "st":
      return "striker";
    case "cm":
    default:
      return "central_midfielder";
  }
}

function gameStateFixture(selectedClubId: ClubId, players: readonly Player[]): GameState {
  const playersById: Partial<Record<PlayerId, Player>> = {};
  const playerIds: PlayerId[] = [];
  const playerStates: Partial<Record<PlayerId, PlayerDynamicState>> = {};

  for (const player of players) {
    playersById[player.id] = player;
    playerIds.push(player.id);
    playerStates[player.id] = playerStateFixture();
  }

  return {
    meta: {
      seed: "player-development-test",
      rngAlgorithmVersion: "test",
      saveSchemaVersion: 1,
      calibrationVersions: playerDevelopmentCalibrationVersionsFixture(),
    },
    calendar: {
      currentDate: gameDate(20_000),
      currentSeasonId: seasonId("season:0001"),
    },
    players: playersById as GameState["players"],
    playerIds,
    playerStates: playerStates as GameState["playerStates"],
    clubs: {
      [selectedClubId]: clubFixture(selectedClubId, playerIds),
    },
    clubIds: [selectedClubId],
    fixtures: {},
    fixtureIds: [],
  };
}

function clubFixture(id: ClubId, playerIds: readonly PlayerId[]): Club {
  return {
    id,
    name: String(id),
    shortName: String(id).slice("club:".length).toUpperCase(),
    category: "third_division",
    reputation: 5,
    playerIds,
  };
}

function playerFixture(
  id: PlayerId,
  primaryPosition: PlayerPosition,
  ageYears: number,
  abilities: PlayerAbilities,
  potential: PlayerAbilities,
): Player {
  return {
    id,
    firstName: String(id),
    lastName: "Development",
    birthDate: gameDate(20_000 - ageYears * 365),
    naturalPositions: [primaryPosition],
    abilities,
    potential,
  };
}

function playerStateFixture(): PlayerDynamicState {
  return {
    fitness: stateValue(100),
    form: stateValue(50),
    morale: stateValue(50),
  };
}

function abilitySet(value: number): PlayerAbilities {
  const ability = abilityValue(value);

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

function requiredPlayer(careerState: CareerState, id: PlayerId): Player {
  const player = careerState.gameState.players[id];
  if (player === undefined) {
    throw new Error(`Missing player fixture: ${id}`);
  }

  return player;
}
