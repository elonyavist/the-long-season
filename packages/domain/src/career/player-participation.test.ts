import assert from "node:assert/strict";
import { test } from "vitest";

import { fixtureId, playerId, seasonId } from "../types/ids.ts";
import {
  accruePlayerFixtureParticipation,
  closePlayerParticipationMonth,
  createEmptyPlayerParticipationLedger,
  createPlayerParticipationLedger,
  playerParticipationAverageRating,
  playerParticipationRowKey,
  PlayerParticipationLedgerError,
  resetPlayerParticipationSeason,
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
  assert.deepEqual(row.appliedFixtureIds, [fixtureId("fixture:000001"), fixtureId("fixture:000002")]);
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
    appliedFixtureIds: [],
  };
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
