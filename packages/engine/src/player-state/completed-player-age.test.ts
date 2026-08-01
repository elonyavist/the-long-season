import assert from "node:assert/strict";
import { test } from "vitest";

import { gameDate } from "@game/domain";
import { fromISO } from "@game/shared";

import {
  CompletedPlayerAgeError,
  completedPlayerAge,
} from "./completed-player-age.ts";

test("completedPlayerAge changes only on the exact civil birthday", () => {
  const birthDate = gameDate(fromISO("2008-08-01"));

  assert.equal(
    completedPlayerAge(birthDate, gameDate(fromISO("2025-07-31"))),
    16,
  );
  assert.equal(
    completedPlayerAge(birthDate, gameDate(fromISO("2025-08-01"))),
    17,
  );
});

test("completedPlayerAge remains exact across leap years", () => {
  const leapDayBirth = gameDate(fromISO("2008-02-29"));

  assert.equal(
    completedPlayerAge(leapDayBirth, gameDate(fromISO("2025-02-28"))),
    16,
  );
  assert.equal(
    completedPlayerAge(leapDayBirth, gameDate(fromISO("2025-03-01"))),
    17,
  );
});

test("completedPlayerAge rejects dates before birth", () => {
  assert.throws(
    () => completedPlayerAge(
      gameDate(fromISO("2008-08-01")),
      gameDate(fromISO("2008-07-31")),
    ),
    CompletedPlayerAgeError,
  );
});
