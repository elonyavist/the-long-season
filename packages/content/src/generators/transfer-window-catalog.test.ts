import assert from "node:assert/strict";
import { competitionId, gameDate, resolveTransferWindowStatus, seasonId } from "@game/domain";
import { fromISO, toISO } from "@game/shared";
import { test } from "vitest";

import {
  resolveSeasonTransferWindows,
  seasonStartYearFromDate,
  transferWindowTemplateFor,
} from "./transfer-window-catalog.ts";

const DEMO = competitionId("competition:demo-third-division");
const SEASON = seasonId("season:demo-001");

test("the demo competition has one source-backed template", () => {
  const template = transferWindowTemplateFor(DEMO);
  assert.ok(template);
  assert.equal(template?.sourceKey, "figc-2026-27-professional");
});

test("all three canonical domestic competitions use the audited professional template", () => {
  for (const id of ["competition:ita-1", "competition:ita-2", "competition:ita-3"]) {
    const template = transferWindowTemplateFor(competitionId(id));
    assert.ok(template);
    assert.equal(template.sourceKey, "figc-2026-27-professional");
  }
});

test("no speculative competition has a template", () => {
  assert.equal(transferWindowTemplateFor(competitionId("competition:eng-2")), undefined);
});

test("the first supported season resolves the official FIGC 2026/27 windows", () => {
  const windows = resolveSeasonTransferWindows({
    competitionId: DEMO,
    seasonId: SEASON,
    seasonStartYear: 2026,
  });
  assert.equal(toISO(windows.windows[0].opensOn), "2026-07-01");
  assert.equal(toISO(windows.windows[0].closesOn), "2026-09-01");
  assert.equal(toISO(windows.windows[1].opensOn), "2027-01-02");
  assert.equal(toISO(windows.windows[1].closesOn), "2027-02-01");
});

test("boundary dates resolve as open and the day after as closed", () => {
  const windows = resolveSeasonTransferWindows({
    competitionId: DEMO,
    seasonId: SEASON,
    seasonStartYear: 2026,
  });
  assert.equal(resolveTransferWindowStatus(windows, gameDate(fromISO("2026-06-30"))).state, "closed");
  assert.equal(resolveTransferWindowStatus(windows, gameDate(fromISO("2026-07-01"))).state, "open");
  assert.equal(resolveTransferWindowStatus(windows, gameDate(fromISO("2026-09-01"))).state, "open");
  assert.equal(resolveTransferWindowStatus(windows, gameDate(fromISO("2026-09-02"))).state, "closed");
  assert.equal(resolveTransferWindowStatus(windows, gameDate(fromISO("2027-02-01"))).state, "open");
  assert.equal(resolveTransferWindowStatus(windows, gameDate(fromISO("2027-02-02"))).state, "closed");
});

test("a later season rolls the same template forward deterministically", () => {
  const windows = resolveSeasonTransferWindows({
    competitionId: DEMO,
    seasonId: seasonId("season:demo-002"),
    seasonStartYear: 2027,
  });
  assert.equal(toISO(windows.windows[0].opensOn), "2027-07-01");
  assert.equal(toISO(windows.windows[0].closesOn), "2027-09-01");
  assert.equal(toISO(windows.windows[1].opensOn), "2028-01-02");
  assert.equal(toISO(windows.windows[1].closesOn), "2028-02-01");
});

test("seasonStartYearFromDate reads the calendar year from the first fixture date", () => {
  assert.equal(seasonStartYearFromDate(fromISO("2026-08-01")), 2026);
});

test("resolving an unplayable competition throws", () => {
  assert.throws(() =>
    resolveSeasonTransferWindows({
      competitionId: competitionId("competition:eng-2"),
      seasonId: SEASON,
      seasonStartYear: 2026,
    }),
  );
});
