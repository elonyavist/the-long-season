import assert from "node:assert/strict";
import { test } from "vitest";

import {
  FORMATION_CATALOG,
  clubId,
  playerId,
  type Player,
  type PlayerId,
  type PlayerPosition,
  type SquadDepth,
} from "@game/domain";

import { buildFormationSquadFitReport, type FormationFitPlayer } from "./formation-squad-fit.ts";

/**
 * Formation squad-fit tests use synthetic squads so they can assert gaps
 * without changing generated content or match balance.
 */
test("reports a back-three squad as weak in full backs for a back-four formation", () => {
  const input = fitInput("4-4-2", [
    ["01", "gk"],
    ["02", "cb"],
    ["03", "cb"],
    ["04", "cb"],
    ["05", "cb"],
    ["06", "dm"],
    ["07", "cm"],
    ["08", "cm"],
    ["09", "rw"],
    ["10", "lw"],
    ["11", "st"],
    ["12", "st"],
  ]);

  const report = buildFormationSquadFitReport(input);

  assert.deepEqual(
    report.weakSlots.map((slot) => slot.slotKey),
    ["rb", "lb"],
  );
  assert.deepEqual(report.marketNeedHints, ["need:left_full_back", "need:right_full_back"]);
});

test("reports a wide-heavy squad as weak in central attacking midfield", () => {
  const report = buildFormationSquadFitReport(
    fitInput("4-2-3-1", [
      ["01", "gk"],
      ["02", "rb"],
      ["03", "cb"],
      ["04", "cb"],
      ["05", "lb"],
      ["06", "dm"],
      ["07", "dm"],
      ["08", "rw"],
      ["09", "lw"],
      ["10", "rwb"],
      ["11", "lwb"],
      ["12", "st"],
    ]),
  );

  assert.deepEqual(
    report.weakSlots.map((slot) => slot.slotKey),
    ["am"],
  );
  assert.deepEqual(report.marketNeedHints, ["need:attacking_midfielder", "surplus:wide_players"]);
});

test("reports a narrow squad as weak in wide roles", () => {
  const report = buildFormationSquadFitReport(
    fitInput("4-4-2", [
      ["01", "gk"],
      ["02", "rb"],
      ["03", "cb"],
      ["04", "cb"],
      ["05", "lb"],
      ["06", "dm"],
      ["07", "cm"],
      ["08", "cm"],
      ["09", "am"],
      ["10", "st"],
      ["11", "st"],
      ["12", "cb"],
    ]),
  );

  assert.deepEqual(report.weakSlots.map((slot) => slot.slotKey), ["rm", "lm"]);
  assert.deepEqual(report.marketNeedHints, ["need:wide_midfielder"]);
});

test("reports a balanced squad as covering a basic formation", () => {
  const report = buildFormationSquadFitReport(
    fitInput("4-4-2", [
      ["01", "gk"],
      ["02", "rb"],
      ["03", "cb"],
      ["04", "cb"],
      ["05", "lb"],
      ["06", "rw"],
      ["07", "cm"],
      ["08", "cm"],
      ["09", "lw"],
      ["10", "st"],
      ["11", "st"],
      ["12", "gk"],
    ]),
  );

  assert.equal(report.coveredSlots.length, 11);
  assert.equal(report.weakSlots.length, 0);
  assert.equal(report.uncoveredSlots.length, 0);
  assert.deepEqual(report.marketNeedHints, []);
});

test("reports consider hints when key roles are covered only by adapted players", () => {
  const report = buildFormationSquadFitReport(
    fitInput("4-2-3-1", [
      ["01", "gk"],
      ["02", "rb"],
      ["03", "cb"],
      ["04", "cb"],
      ["05", "lb"],
      ["06", "cm"],
      ["07", "cm"],
      ["08", "rw"],
      ["09", "lw"],
      ["10", "st"],
      ["11", "st"],
      ["12", "gk"],
    ]),
  );

  assert.equal(report.uncoveredSlots.length, 0);
  assert.deepEqual(report.marketNeedHints, ["consider:defensive_midfielder", "consider:attacking_midfielder"]);
});

function fitInput(
  formationKey: keyof typeof FORMATION_CATALOG,
  players: readonly (readonly [string, PlayerPosition])[],
) {
  const playerLookup: Record<PlayerId, FormationFitPlayer> = {} as Record<PlayerId, FormationFitPlayer>;
  const squadPlayerIds: PlayerId[] = [];

  for (const [suffix, position] of players) {
    const id = playerId(`player:test-${suffix}`);
    squadPlayerIds.push(id);
    playerLookup[id] = playerFixture(id, [position]);
  }

  return {
    formation: FORMATION_CATALOG[formationKey],
    squadDepth: {
      clubId: clubId("club:pro01"),
      squadPlayerIds,
      starterPlayerIds: squadPlayerIds.slice(0, 11),
      benchReservePlayerIds: squadPlayerIds.slice(11),
    } satisfies SquadDepth,
    players: playerLookup,
  };
}

function playerFixture(id: PlayerId, naturalPositions: readonly PlayerPosition[]): FormationFitPlayer {
  return { id, naturalPositions } satisfies Pick<Player, "id" | "naturalPositions">;
}
