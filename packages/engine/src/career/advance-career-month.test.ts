import assert from "node:assert/strict";
import { test } from "vitest";
import { fromISO } from "@game/shared";

import {
  CAREER_STATE_SCHEMA_VERSION,
  abilityValue,
  accruePlayerFixtureParticipation,
  clubId,
  createCareerState,
  createEmptyPlayerParticipationLedger,
  fixtureId,
  gameDate,
  playerId,
  saveId,
  seasonId,
  stateValue,
  type CareerState,
  type Club,
  type GameState,
  type Player,
  type PlayerAbilities,
  type PlayerDynamicState,
  type PlayerId,
} from "@game/domain";

import type { PlayerMonthlyDevelopmentObservation } from "./player-development.ts";
import { monthlyDevelopmentPolicy } from "./player-development-policy.ts";
import {
  advanceCareerMonths as advanceCareerMonthsWithPolicy,
  monthKeyForCareerDate,
} from "./advance-career-month.ts";
import { playerWagePolicyConfigFixture } from "../test-fixtures/player-wage-policy-config.ts";
import { marketBehaviorConfigFixture } from "../test-fixtures/market-behavior-config.ts";
import { playerValuationConfigFixture } from "../test-fixtures/player-valuation-config.ts";
import {
  playerDevelopmentCalibrationVersionsFixture,
  playerDevelopmentEnvironmentConfigFixture,
} from "../test-fixtures/player-development-environment-config.ts";

function advanceCareerMonths(
  input: Omit<
    Parameters<typeof advanceCareerMonthsWithPolicy>[0],
    | "wagePolicy"
    | "marketBehaviorPolicy"
    | "valuationConfig"
    | "playerDevelopmentEnvironmentConfig"
    | "developmentCheckpointMode"
  > & Partial<Pick<Parameters<typeof advanceCareerMonthsWithPolicy>[0], "developmentCheckpointMode">>,
) {
  return advanceCareerMonthsWithPolicy({
    ...input,
    wagePolicy: playerWagePolicyConfigFixture(),
    marketBehaviorPolicy: marketBehaviorConfigFixture(),
    valuationConfig: playerValuationConfigFixture(),
    playerDevelopmentEnvironmentConfig: playerDevelopmentEnvironmentConfigFixture(),
    developmentCheckpointMode: input.developmentCheckpointMode ?? "complete_quarters",
  });
}

/**
 * Quarterly career lifecycle tests protect canonical monthly evidence,
 * residual rollover, and duplicate-safe development after reloads.
 */

test("advanceCareerMonths is a no-op when no completed development month was crossed", () => {
  const player = playerId("player:no-op");
  const currentDate = gameDate(20_000);
  const state = careerStateWithParticipation({
    currentDate,
    player,
    monthKey: monthKeyForCareerDate(currentDate),
  });

  const result = advanceCareerMonths({
    careerState: state,
    worldSeed: "month-no-op",
    toDate: gameDate(Number(currentDate) + 1),
  });

  assert.deepEqual(result, {
    careerState: state,
    summaries: [],
  });
});

test("advanceCareerMonths waits until three complete evidence months exist", () => {
  const player = playerId("player:quarter-waits");
  const currentDate = gameDate(fromISO("2026-08-01"));
  const state = careerStateWithParticipation({
    currentDate,
    player,
    monthKeys: ["2026-08", "2026-09"],
  });

  const result = advanceCareerMonths({
    careerState: state,
    worldSeed: "quarter-waits-world",
    toDate: gameDate(fromISO("2026-11-01")),
  });

  assert.deepEqual(result, { careerState: state, summaries: [] });
});

test("advanceCareerMonths consumes one three-month batch exactly once", () => {
  const player = playerId("player:quarter-growth");
  const currentDate = gameDate(fromISO("2026-08-01"));
  const monthKeys = ["2026-08", "2026-09", "2026-10"];
  const toDate = gameDate(fromISO("2026-11-01"));
  const state = careerStateWithParticipation({
    currentDate,
    player,
    monthKeys,
  });

  const first = advanceCareerMonths({
    careerState: state,
    worldSeed: "quarter-growth-world",
    toDate,
  });
  const second = advanceCareerMonths({
    careerState: first.careerState,
    worldSeed: "quarter-growth-world",
    fromDate: currentDate,
    toDate,
  });

  assert.deepEqual(first.summaries.map((summary) => summary.monthKey), monthKeys);
  assert.equal(first.summaries.every((summary) => summary.developmentChangeCount === 1), true);
  assert.deepEqual(
    first.careerState.playerParticipationLedger?.closedMonthKeys,
    monthKeys.map((monthKey) => `season:0001|${monthKey}`),
  );
  assert.equal(Number(first.careerState.gameState.players[player]?.abilities.technical.finishing) > 8, true);
  assert.deepEqual(second.summaries, []);
  assert.deepEqual(second.careerState, first.careerState);
});

test("advanceCareerMonths leaves current-month participation open for later fixtures", () => {
  const player = playerId("player:current-month");
  const currentDate = gameDate(fromISO("2026-08-01"));
  const toDate = gameDate(fromISO("2026-11-01"));
  const futureMonthKey = "2026-11";
  const state = careerStateWithParticipation({
    currentDate,
    player,
    monthKeys: ["2026-08", "2026-09", futureMonthKey],
  });

  const result = advanceCareerMonths({
    careerState: state,
    worldSeed: "month-current-open",
    toDate,
  });

  assert.equal(result.summaries.length, 0);
  assert.equal(result.careerState.playerParticipationLedger?.closedMonthKeys.includes(`season:0001|${futureMonthKey}`), false);
  assert.equal(Number(result.careerState.gameState.players[player]?.abilities.technical.finishing), 8);
});

test("advanceCareerMonths flushes one or two residual months only at season end", () => {
  const player = playerId("player:season-residual");
  const currentDate = gameDate(fromISO("2027-03-01"));
  const toDate = gameDate(fromISO("2027-06-01"));
  const state = careerStateWithParticipation({
    currentDate,
    player,
    monthKeys: ["2027-03", "2027-04"],
  });

  const normal = advanceCareerMonths({
    careerState: state,
    worldSeed: "season-residual-world",
    toDate,
  });
  const flushed = advanceCareerMonths({
    careerState: state,
    worldSeed: "season-residual-world",
    toDate,
    developmentCheckpointMode: "season_end_flush",
  });
  const repeated = advanceCareerMonths({
    careerState: flushed.careerState,
    worldSeed: "season-residual-world",
    fromDate: currentDate,
    toDate,
    developmentCheckpointMode: "season_end_flush",
  });

  assert.deepEqual(normal, { careerState: state, summaries: [] });
  assert.deepEqual(flushed.summaries.map((summary) => summary.monthKey), ["2027-03", "2027-04"]);
  assert.deepEqual(repeated.summaries, []);
  assert.deepEqual(repeated.careerState, flushed.careerState);
});

function careerStateWithParticipation(input: {
  readonly currentDate: ReturnType<typeof gameDate>;
  readonly player: PlayerId;
  readonly monthKey?: string;
  readonly monthKeys?: readonly string[];
}): CareerState {
  let playerParticipationLedger = createEmptyPlayerParticipationLedger();
  const monthKeys = input.monthKeys ?? (input.monthKey === undefined ? [] : [input.monthKey]);

  for (const monthKey of monthKeys) {
    playerParticipationLedger = accruePlayerFixtureParticipation(playerParticipationLedger, {
      fixtureId: fixtureId(`fixture:${String(monthKey).replace("-", "")}`),
      playerId: input.player,
      clubId: clubId("club:selected"),
      seasonId: seasonId("season:0001"),
      monthKey,
      started: true,
      substituteAppearance: false,
      minutes: 90,
      rating: 7.2,
      playedRoleMinutes: { striker: 90 },
    });
  }

  return createCareerState({
    saveId: saveId("save:advance-career-month"),
    schemaVersion: CAREER_STATE_SCHEMA_VERSION,
    selectedClubId: clubId("club:selected"),
    gameState: gameStateFixture(input.currentDate, [playerFixture(input.player)]),
    transferHistory: [],
    playerParticipationLedger,
  });
}

function gameStateFixture(currentDate: ReturnType<typeof gameDate>, players: readonly Player[]): GameState {
  const playerMap: Partial<Record<PlayerId, Player>> = {};
  const playerStates: Partial<Record<PlayerId, PlayerDynamicState>> = {};
  const playerIds: PlayerId[] = [];
  const selectedClubId = clubId("club:selected");

  for (const player of players) {
    playerMap[player.id] = player;
    playerStates[player.id] = {
      fitness: stateValue(100),
      form: stateValue(50),
      morale: stateValue(50),
    };
    playerIds.push(player.id);
  }

  return {
    meta: {
      seed: "advance-career-month-test",
      rngAlgorithmVersion: "test",
      saveSchemaVersion: 1,
      calibrationVersions: playerDevelopmentCalibrationVersionsFixture(),
    },
    calendar: {
      currentDate,
      currentSeasonId: seasonId("season:0001"),
    },
    players: playerMap as GameState["players"],
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

function clubFixture(id: ReturnType<typeof clubId>, playerIds: readonly PlayerId[]): Club {
  return {
    id,
    name: String(id),
    shortName: "SEL",
    category: "third_division",
    reputation: 5,
    playerIds,
  };
}

function playerFixture(id: PlayerId): Player {
  return {
    id,
    firstName: "Month",
    lastName: String(id),
    birthDate: gameDate(13_065),
    naturalPositions: ["st"],
    primaryRole: "striker",
    abilities: abilitySet(8),
    potential: abilitySet(12),
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

test("monthly development observation retains rows without changing development", () => {
  const player = playerId("player:observed-growth");
  const other = playerId("player:unobserved-growth");
  const currentDate = gameDate(fromISO("2026-08-01"));
  const monthKeys = ["2026-08", "2026-09", "2026-10"];
  const toDate = gameDate(fromISO("2026-11-01"));
  const state = careerStateWithParticipation({
    currentDate,
    player,
    monthKeys,
  });

  const unobserved = advanceCareerMonths({
    careerState: state,
    worldSeed: "observation-world",
    toDate,
  });
  const observed = advanceCareerMonths({
    careerState: state,
    worldSeed: "observation-world",
    toDate,
    observeMonthlyDevelopmentForPlayerIds: [player],
  });

  // The observed run must develop identically; only the retained payload differs.
  assert.equal("monthlyDevelopmentObservations" in unobserved, false);
  const { monthlyDevelopmentObservations, ...observedWithoutPayload } = observed;
  assert.deepEqual(observedWithoutPayload, unobserved);

  assert.deepEqual(
    monthlyDevelopmentObservations?.map(({ change }) => change.monthKey),
    monthKeys,
  );
  assert.equal(
    monthlyDevelopmentObservations?.every(({ change }) => change.playerId === player),
    true,
  );

  // Every observed month carries an exhaustive relevance-bucket split.
  // A hard cap bounds growth rather than clamping a generated value, so a
  // capped bucket may legitimately hold current above its effective potential.
  for (const observation of monthlyDevelopmentObservations ?? []) {
    assert.deepEqual(
      observation.bucketMargins.map(({ bucket }) => bucket),
      ["coreForRole", "secondaryForRole", "allowedButLow", "cappedOutOfRole"],
    );
    assert.equal(
      observation.bucketMargins.reduce((sum, margin) => sum + margin.attributeCount, 0),
      25,
    );
  }

  // The retained rating facts must be exactly the ledger's, and sufficient on
  // their own: recomposing the canonical policy input from the observation
  // reproduces the policy derived from the ledger row itself, multiplier for
  // multiplier. Minutes come from the change, so nothing is stored twice.
  const ledgerRows = Object.values(state.playerParticipationLedger?.rows ?? {});
  for (const observation of monthlyDevelopmentObservations ?? []) {
    const row = ledgerRows.find(
      (candidate) =>
        candidate.playerId === observation.change.playerId
        && candidate.monthKey === observation.change.monthKey,
    );
    assert.notEqual(row, undefined, observation.change.monthKey);
    assert.equal(observation.ratingTotal, row!.ratingTotal);
    assert.equal(observation.ratingSamples, row!.ratingSamples);

    const policyInput = {
      positionGroup: observation.change.positionGroup,
      age: observation.change.age,
      positiveGrowthEnvironmentBasisPoints:
        observation.change.positiveGrowthEnvironmentBasisPoints,
    } as const;
    assert.deepEqual(
      monthlyDevelopmentPolicy({
        ...policyInput,
        participation: {
          minutes: observation.change.minutes,
          ratingTotal: observation.ratingTotal,
          ratingSamples: observation.ratingSamples,
        },
      }),
      monthlyDevelopmentPolicy({ ...policyInput, participation: row! }),
    );
  }

  // The split exists to expose relevance-proportional growth: per attribute,
  // core must outgrow the lowest-relevance bucket over the same months.
  const perAttributeGrowth = (bucket: string): number => {
    const margin = (observation: PlayerMonthlyDevelopmentObservation) =>
      observation.bucketMargins.find((entry) => entry.bucket === bucket)!;
    const first = margin(monthlyDevelopmentObservations![0]!);
    const last = margin(monthlyDevelopmentObservations!.at(-1)!);
    return (last.currentTotal - first.currentTotal) / last.attributeCount;
  };
  assert.equal(perAttributeGrowth("coreForRole") > perAttributeGrowth("cappedOutOfRole"), true);

  // Observing a player with no participation retains an empty payload rather
  // than dropping the key, so the consumer's shape never depends on the data.
  const empty = advanceCareerMonths({
    careerState: state,
    worldSeed: "observation-world",
    toDate,
    observeMonthlyDevelopmentForPlayerIds: [other],
  });
  assert.deepEqual(empty.monthlyDevelopmentObservations, []);
});

test("observation captures only months processed while it was requested", () => {
  const player = playerId("player:late-observation");
  const currentDate = gameDate(fromISO("2026-08-01"));
  const firstBatch = ["2026-08", "2026-09", "2026-10"];
  const secondBatch = ["2026-11", "2026-12", "2027-01"];
  const state = careerStateWithParticipation({
    currentDate,
    player,
    monthKeys: [...firstBatch, ...secondBatch],
  });

  // The first batch runs before the player is observed, exactly as a prospect
  // assigned at a later season intake is developed before he is selected.
  const beforeRequest = advanceCareerMonths({
    careerState: state,
    worldSeed: "late-observation-world",
    toDate: gameDate(fromISO("2026-11-01")),
  });
  const afterRequest = advanceCareerMonths({
    careerState: beforeRequest.careerState,
    worldSeed: "late-observation-world",
    fromDate: gameDate(fromISO("2026-11-01")),
    toDate: gameDate(fromISO("2027-02-01")),
    observeMonthlyDevelopmentForPlayerIds: [player],
  });

  const observedMonths = (afterRequest.monthlyDevelopmentObservations ?? [])
    .map(({ change }) => change.monthKey);

  // No month closed before the request may appear retroactively.
  assert.deepEqual(observedMonths, secondBatch);
  for (const monthKey of firstBatch) {
    assert.equal(observedMonths.includes(monthKey), false);
  }

  // Every month closed while observing is captured exactly once.
  assert.equal(new Set(observedMonths).size, observedMonths.length);
  assert.equal(
    observedMonths.length,
    afterRequest.summaries.filter((summary) => summary.developmentChangeCount > 0).length,
  );
});
