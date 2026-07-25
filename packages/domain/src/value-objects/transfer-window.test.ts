import assert from "node:assert/strict";
import { test } from "vitest";

import { competitionId, seasonId } from "../types/ids.ts";
import { gameDate } from "./game-date.ts";
import {
  resolveTransferWindowStatus,
  seasonTransferWindows,
  TransferWindowError,
  type TransferWindow,
} from "./transfer-window.ts";

const COMPETITION = competitionId("competition:demo-third-division");
const SEASON = seasonId("season:demo-001");

// Synthetic epoch-days keep this suite dependency-free: domain may not import
// shared. Only ordering and inclusivity matter here; real calendar dates are
// covered by the content window-catalog test.
const SUMMER = { opensOn: gameDate(100), closesOn: gameDate(160) } satisfies TransferWindow;
const WINTER = { opensOn: gameDate(280), closesOn: gameDate(310) } satisfies TransferWindow;

const FIRST_SEASON = () =>
  seasonTransferWindows({
    competitionId: COMPETITION,
    seasonId: SEASON,
    windows: [SUMMER, WINTER],
  });

test("seasonTransferWindows keeps exactly two ordered windows", () => {
  const resolved = FIRST_SEASON();
  assert.equal(resolved.windows.length, 2);
  assert.equal(resolved.windows[0].opensOn, gameDate(100));
  assert.equal(resolved.windows[1].closesOn, gameDate(310));
});

test("seasonTransferWindows rejects fewer or more than two windows", () => {
  assert.throws(
    () =>
      seasonTransferWindows({
        competitionId: COMPETITION,
        seasonId: SEASON,
        windows: [SUMMER],
      }),
    (error: unknown) => error instanceof TransferWindowError && error.code === "not_two_windows",
  );
});

test("seasonTransferWindows rejects a reversed window", () => {
  assert.throws(
    () =>
      seasonTransferWindows({
        competitionId: COMPETITION,
        seasonId: SEASON,
        windows: [{ opensOn: gameDate(160), closesOn: gameDate(100) }, WINTER],
      }),
    (error: unknown) => error instanceof TransferWindowError && error.code === "reversed_window",
  );
});

test("seasonTransferWindows rejects unordered windows", () => {
  assert.throws(
    () =>
      seasonTransferWindows({
        competitionId: COMPETITION,
        seasonId: SEASON,
        windows: [WINTER, SUMMER],
      }),
    (error: unknown) => error instanceof TransferWindowError && error.code === "unordered_windows",
  );
});

test("seasonTransferWindows rejects overlapping or touching windows", () => {
  assert.throws(
    () =>
      seasonTransferWindows({
        competitionId: COMPETITION,
        seasonId: SEASON,
        windows: [SUMMER, { opensOn: gameDate(160), closesOn: gameDate(200) }],
      }),
    (error: unknown) => error instanceof TransferWindowError && error.code === "overlapping_windows",
  );
});

test("resolveTransferWindowStatus is open on the inclusive open boundary", () => {
  const status = resolveTransferWindowStatus(FIRST_SEASON(), gameDate(100));
  assert.equal(status.state, "open");
});

test("resolveTransferWindowStatus is open on the inclusive close boundary", () => {
  const status = resolveTransferWindowStatus(FIRST_SEASON(), gameDate(160));
  assert.equal(status.state, "open");
});

test("resolveTransferWindowStatus is open inside a window", () => {
  const status = resolveTransferWindowStatus(FIRST_SEASON(), gameDate(130));
  assert.equal(status.state, "open");
});

test("resolveTransferWindowStatus reports the next opening before the first window", () => {
  const status = resolveTransferWindowStatus(FIRST_SEASON(), gameDate(99));
  assert.equal(status.state, "closed");
  assert.equal(status.state === "closed" ? status.nextOpensOn : undefined, gameDate(100));
});

test("resolveTransferWindowStatus points to the winter window between the two", () => {
  const status = resolveTransferWindowStatus(FIRST_SEASON(), gameDate(161));
  assert.equal(status.state, "closed");
  assert.equal(status.state === "closed" ? status.nextOpensOn : undefined, gameDate(280));
});

test("resolveTransferWindowStatus has no next opening after the final window", () => {
  const status = resolveTransferWindowStatus(FIRST_SEASON(), gameDate(311));
  assert.equal(status.state, "closed");
  assert.equal(status.state === "closed" ? status.nextOpensOn : undefined, undefined);
});
