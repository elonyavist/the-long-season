import assert from "node:assert/strict";
import { test } from "vitest";

import { clubId, fixtureId, playerId, seasonId } from "../types/ids.ts";
import {
  accruePlayerFixtureParticipation,
  accruePlayerFixtureParticipations,
  closePlayerParticipationMonth,
  createEmptyPlayerParticipationLedger,
  createPlayerParticipationLedger,
  playerParticipationAverageRating,
  playerParticipationRowKey,
  PlayerParticipationLedgerError,
  resetPlayerParticipationSeason,
  selectNextPlayerParticipationDevelopmentBatch,
  type PlayerFixtureParticipationContribution,
  type PlayerParticipationRow,
} from "./player-participation.ts";

/** Tests for the durable participation facts consumed by later development steps. */

test("accruePlayerFixtureParticipation creates ordered monthly player rows", () => {
  const contribution = contributionFixture();
  const ledger = accruePlayerFixtureParticipation(createEmptyPlayerParticipationLedger(), contribution);
  const rowKey = playerParticipationRowKey(contribution.seasonId, contribution.monthKey, contribution.playerId);
  const row = ledger.rows[rowKey];

  assert.deepEqual(ledger.rowKeys, [rowKey]);
  assert.ok(row !== undefined);
  assert.equal(row.starts, 1);
  assert.equal(row.substituteAppearances, 0);
  assert.equal(row.minutes, 90);
  assert.equal(row.ratingTotal, 7.2);
  assert.equal(row.ratingSamples, 1);
  assert.deepEqual(row.playedRoleMinutes, { striker: 90 });
  assert.deepEqual(row.clubMinutes, { "club:home": 90 });
  assert.deepEqual(row.appliedFixtureIds, [fixtureId("fixture:000001")]);
  assert.equal(playerParticipationAverageRating(row), 7.2);
});

test("accruePlayerFixtureParticipation merges role minutes and ratings", () => {
  const first = contributionFixture();
  const second: PlayerFixtureParticipationContribution = {
    ...contributionFixture(),
    fixtureId: fixtureId("fixture:000002"),
    started: false,
    substituteAppearance: true,
    minutes: 30,
    rating: 6.8,
    playedRoleMinutes: { right_winger: 30 },
  };
  const ledger = accruePlayerFixtureParticipation(
    accruePlayerFixtureParticipation(createEmptyPlayerParticipationLedger(), first),
    second,
  );
  const row = ledger.rows[playerParticipationRowKey(first.seasonId, first.monthKey, first.playerId)];

  assert.ok(row !== undefined);
  assert.equal(row.starts, 1);
  assert.equal(row.substituteAppearances, 1);
  assert.equal(row.minutes, 120);
  assert.equal(row.ratingSamples, 2);
  assert.equal(playerParticipationAverageRating(row), 7);
  assert.deepEqual(row.playedRoleMinutes, { striker: 90, right_winger: 30 });
  assert.deepEqual(row.clubMinutes, { "club:home": 120 });
  assert.deepEqual(row.appliedFixtureIds, [fixtureId("fixture:000001"), fixtureId("fixture:000002")]);
});

test("accruePlayerFixtureParticipations matches ordered single-contribution accrual", () => {
  const contributions = [
    contributionFixture(),
    {
      ...contributionFixture(),
      fixtureId: fixtureId("fixture:000002"),
      minutes: 30,
      rating: 6.8,
      playedRoleMinutes: { right_winger: 30 },
    },
    {
      ...contributionFixture(),
      fixtureId: fixtureId("fixture:000003"),
      playerId: playerId("player:000002"),
    },
  ] satisfies readonly PlayerFixtureParticipationContribution[];
  const sequential = contributions.reduce(
    (ledger, contribution) => accruePlayerFixtureParticipation(ledger, contribution),
    createEmptyPlayerParticipationLedger(),
  );

  const batched = accruePlayerFixtureParticipations(
    createEmptyPlayerParticipationLedger(),
    contributions,
  );

  assert.deepEqual(batched, sequential);
  assert.deepEqual(batched.rowKeys, [
    playerParticipationRowKey(seasonId("season:0001"), "2026-08", playerId("player:000001")),
    playerParticipationRowKey(seasonId("season:0001"), "2026-08", playerId("player:000002")),
  ]);
});

test("accruePlayerFixtureParticipations rejects an intra-batch duplicate atomically", () => {
  const source = accruePlayerFixtureParticipation(
    createEmptyPlayerParticipationLedger(),
    {
      ...contributionFixture(),
      fixtureId: fixtureId("fixture:source"),
    },
  );
  const sourceSnapshot = structuredClone(source);
  const duplicate = {
    ...contributionFixture(),
    fixtureId: fixtureId("fixture:duplicate"),
  };

  assertParticipationError(
    () => accruePlayerFixtureParticipations(source, [duplicate, duplicate]),
    "duplicate_fixture_accrual",
  );
  assert.deepEqual(source, sourceSnapshot);
});

test("accruePlayerFixtureParticipations leaves the source untouched when a later contribution is invalid", () => {
  const source = accruePlayerFixtureParticipation(
    createEmptyPlayerParticipationLedger(),
    {
      ...contributionFixture(),
      fixtureId: fixtureId("fixture:source"),
    },
  );
  const sourceSnapshot = structuredClone(source);

  assertParticipationError(
    () => accruePlayerFixtureParticipations(source, [
      {
        ...contributionFixture(),
        fixtureId: fixtureId("fixture:valid"),
      },
      {
        ...contributionFixture(),
        fixtureId: fixtureId("fixture:invalid"),
        minutes: 30,
        playedRoleMinutes: { striker: 29 },
      },
    ]),
    "invalid_role_minutes",
  );
  assert.deepEqual(source, sourceSnapshot);
});

test("accruePlayerFixtureParticipation rejects duplicate fixture accrual", () => {
  const contribution = contributionFixture();
  const ledger = accruePlayerFixtureParticipation(createEmptyPlayerParticipationLedger(), contribution);

  assertParticipationError(
    () => accruePlayerFixtureParticipation(ledger, contribution),
    "duplicate_fixture_accrual",
  );
});

test("accruePlayerFixtureParticipation validates played role facts", () => {
  assertParticipationError(
    () => accruePlayerFixtureParticipation(createEmptyPlayerParticipationLedger(), {
      ...contributionFixture(),
      minutes: 20,
      playedRoleMinutes: { striker: 19 },
    }),
    "invalid_role_minutes",
  );

  assertParticipationError(
    () => createPlayerParticipationLedger({
      rows: {
        "season:0001|2026-08|player:000001": {
          ...emptyRowFixture(),
          playedRoleMinutes: { not_a_role: 10 } as PlayerParticipationRow["playedRoleMinutes"],
        },
      },
      rowKeys: ["season:0001|2026-08|player:000001"],
      closedMonthKeys: [],
    }),
    "unknown_played_role",
  );
});

test("accruePlayerFixtureParticipation preserves minutes for multiple represented clubs", () => {
  const first = contributionFixture();
  const second: PlayerFixtureParticipationContribution = {
    ...first,
    fixtureId: fixtureId("fixture:000002"),
    clubId: clubId("club:away"),
    minutes: 30,
    playedRoleMinutes: { striker: 30 },
  };
  const ledger = accruePlayerFixtureParticipation(
    accruePlayerFixtureParticipation(createEmptyPlayerParticipationLedger(), first),
    second,
  );
  const row = ledger.rows[playerParticipationRowKey(first.seasonId, first.monthKey, first.playerId)];

  assert.deepEqual(row?.clubMinutes, {
    "club:home": 90,
    "club:away": 30,
  });
});

test("createPlayerParticipationLedger requires club minutes to equal total minutes", () => {
  assertParticipationError(
    () => createPlayerParticipationLedger({
      rows: {
        "season:0001|2026-08|player:000001": {
          ...emptyRowFixture(),
          clubMinutes: { [clubId("club:home")]: 9 },
        },
      },
      rowKeys: ["season:0001|2026-08|player:000001"],
      closedMonthKeys: [],
    }),
    "invalid_club_minutes",
  );
});

test("selectNextPlayerParticipationDevelopmentBatch waits for three complete months", () => {
  const ledger = ledgerWithMonths(["2026-08", "2026-09"]);

  assert.equal(selectNextPlayerParticipationDevelopmentBatch({
    ledger,
    seasonId: seasonId("season:0001"),
    beforeMonthKey: "2026-10",
    mode: "complete_quarters",
  }), undefined);
});

test("selectNextPlayerParticipationDevelopmentBatch selects at most three months in chronological ledger order", () => {
  const ledger = ledgerWithMonths(["2026-10", "2026-08", "2026-09", "2026-11"]);
  const selected = selectNextPlayerParticipationDevelopmentBatch({
    ledger,
    seasonId: seasonId("season:0001"),
    beforeMonthKey: "2026-12",
    mode: "complete_quarters",
  });

  assert.deepEqual(selected?.monthKeys, ["2026-08", "2026-09", "2026-10"]);
  assert.deepEqual(selected?.rows.map((row) => row.monthKey), ["2026-08", "2026-09", "2026-10"]);
  assert.equal(ledger.closedMonthKeys.length, 0);
});

test("selectNextPlayerParticipationDevelopmentBatch includes every row in stable intra-month order", () => {
  const contributions = [
    { monthKey: "2026-09", suffix: "september-first" },
    { monthKey: "2026-08", suffix: "august-first" },
    { monthKey: "2026-09", suffix: "september-second" },
    { monthKey: "2026-08", suffix: "august-second" },
    { monthKey: "2026-10", suffix: "october" },
  ] as const;
  const ledger = contributions.reduce(
    (current, contribution, index) => accruePlayerFixtureParticipation(current, {
      ...contributionFixture(),
      fixtureId: fixtureId(`fixture:${contribution.suffix}`),
      playerId: playerId(`player:${contribution.suffix}`),
      monthKey: contribution.monthKey,
      rating: 6 + index / 10,
    }),
    createEmptyPlayerParticipationLedger(),
  );
  const selected = selectNextPlayerParticipationDevelopmentBatch({
    ledger,
    seasonId: seasonId("season:0001"),
    beforeMonthKey: "2026-11",
    mode: "complete_quarters",
  });

  assert.deepEqual(selected?.rows.map((row) => row.playerId), [
    playerId("player:august-first"),
    playerId("player:august-second"),
    playerId("player:september-first"),
    playerId("player:september-second"),
    playerId("player:october"),
  ]);
});

test("selectNextPlayerParticipationDevelopmentBatch flushes one or two residual months", () => {
  const ledger = closePlayerParticipationMonth(
    ledgerWithMonths(["2026-08", "2026-09", "2026-10"]),
    seasonId("season:0001"),
    "2026-08",
  );
  const selected = selectNextPlayerParticipationDevelopmentBatch({
    ledger,
    seasonId: seasonId("season:0001"),
    beforeMonthKey: "2026-11",
    mode: "season_end_flush",
  });

  assert.deepEqual(selected?.monthKeys, ["2026-09", "2026-10"]);
});

test("closePlayerParticipationMonth prevents late accrual but keeps season facts", () => {
  const contribution = contributionFixture();
  const ledger = closePlayerParticipationMonth(
    accruePlayerFixtureParticipation(createEmptyPlayerParticipationLedger(), contribution),
    contribution.seasonId,
    contribution.monthKey,
  );

  assert.deepEqual(ledger.closedMonthKeys, ["season:0001|2026-08"]);
  assert.equal(ledger.rowKeys.length, 1);
  assertParticipationError(
    () => accruePlayerFixtureParticipation(ledger, { ...contribution, fixtureId: fixtureId("fixture:000002") }),
    "closed_month_accrual",
  );
});

test("resetPlayerParticipationSeason removes only one season", () => {
  const first = contributionFixture();
  const second: PlayerFixtureParticipationContribution = {
    ...contributionFixture(),
    fixtureId: fixtureId("fixture:000002"),
    seasonId: seasonId("season:0002"),
  };
  const ledger = closePlayerParticipationMonth(
    accruePlayerFixtureParticipation(
      accruePlayerFixtureParticipation(createEmptyPlayerParticipationLedger(), first),
      second,
    ),
    first.seasonId,
    first.monthKey,
  );
  const reset = resetPlayerParticipationSeason(ledger, first.seasonId);

  assert.deepEqual(reset.rowKeys, [playerParticipationRowKey(second.seasonId, second.monthKey, second.playerId)]);
  assert.deepEqual(reset.closedMonthKeys, []);
});

function contributionFixture(): PlayerFixtureParticipationContribution {
  return {
    fixtureId: fixtureId("fixture:000001"),
    playerId: playerId("player:000001"),
    clubId: clubId("club:home"),
    seasonId: seasonId("season:0001"),
    monthKey: "2026-08",
    started: true,
    substituteAppearance: false,
    minutes: 90,
    rating: 7.2,
    playedRoleMinutes: { striker: 90 },
  };
}

function emptyRowFixture(): PlayerParticipationRow {
  const contribution = contributionFixture();
  return {
    rowKey: playerParticipationRowKey(contribution.seasonId, contribution.monthKey, contribution.playerId),
    playerId: contribution.playerId,
    seasonId: contribution.seasonId,
    monthKey: contribution.monthKey,
    starts: 0,
    substituteAppearances: 0,
    minutes: 10,
    ratingTotal: 0,
    ratingSamples: 0,
    playedRoleMinutes: { striker: 10 },
    clubMinutes: { [contribution.clubId]: 10 },
    appliedFixtureIds: [],
  };
}

function ledgerWithMonths(monthKeys: readonly string[]) {
  return monthKeys.reduce(
    (ledger, monthKey, index) => accruePlayerFixtureParticipation(ledger, {
      ...contributionFixture(),
      fixtureId: fixtureId(`fixture:month-${index}`),
      playerId: playerId(`player:month-${index}`),
      monthKey,
    }),
    createEmptyPlayerParticipationLedger(),
  );
}

function assertParticipationError(
  action: () => void,
  code: PlayerParticipationLedgerError["code"],
): void {
  assert.throws(
    action,
    (error) => error instanceof PlayerParticipationLedgerError && error.code === code,
  );
}
