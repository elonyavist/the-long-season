import assert from "node:assert/strict";
import { test } from "vitest";

import { nonNegativeMoney } from "@game/domain";

import {
  CAREER_SQUAD_COLUMNS,
  buildCareerSquadView,
  type CareerSquadPlayerInput,
} from "./career-squad-view.ts";

test("keeps an injured selected player in the XI and exposes no hidden replacement", () => {
  const view = buildCareerSquadView({
    players: [player({
      playerId: "player:injured",
      selection: "starting_xi",
      selectedLineupSlotKey: "cm",
      availabilityReasons: ["injured"],
      hasExpiringContract: true,
    })],
  });

  assert.deepEqual(view.columns.map((column) => column.key), CAREER_SQUAD_COLUMNS);
  assert.equal(view.rows[0]?.selection, "starting_xi");
  assert.equal(view.rows[0]?.compositeStatus, "injured");
  assert.equal(view.rows[0]?.hasExpiringContract, true);
  assert.deepEqual(view.rows[0]?.actions, [{
    actionId: "remove_from_starting_xi",
    labelKey: "career.squad.action.removeFromStartingXi",
    slotKey: "cm",
  }, {
    actionId: "select_as_substitute",
    labelKey: "career.squad.action.selectAsSubstitute",
    slotKey: "bench-1",
  }]);
});

test("fields directly into one gap and requires an explicit choice for replacements", () => {
  const direct = buildCareerSquadView({
    players: [player({
      playerId: "player:direct",
      lineupSlotChoices: [slot("cm", "natural")],
    })],
  });
  assert.deepEqual(direct.rows[0]?.actions[0], {
    actionId: "field_player",
    labelKey: "career.squad.action.field",
    mode: "direct",
    choices: [{
      slotKey: "cm",
      labelKey: "career.matchPreparation.slot.cm",
      role: "central_midfielder",
      suitability: "natural",
      isEmpty: true,
    }],
  });

  const replacement = buildCareerSquadView({
    players: [player({
      playerId: "player:replacement",
      lineupSlotChoices: [
        slot("cm-right", "adapted", "player:one", "One Player"),
        slot("cm-left", "natural", "player:two", "Two Player"),
        slot("st", "invalid", "player:three", "Three Player"),
      ],
    })],
  });
  const action = replacement.rows[0]?.actions[0];
  assert.equal(action?.actionId, "field_player");
  if (action?.actionId !== "field_player") throw new Error("field action missing");
  assert.equal(action.mode, "choose_slot");
  assert.deepEqual(action.choices.map((choice) => [choice.slotKey, choice.occupantPlayerId]), [
    ["cm-left", "player:two"],
    ["cm-right", "player:one"],
  ]);
});

test("offers empty slots first without hiding explicit occupied alternatives", () => {
  const view = buildCareerSquadView({
    players: [player({
      playerId: "player:all-choices",
      lineupSlotChoices: [
        slot("cm-occupied", "natural", "player:one", "One Player"),
        slot("cm-empty", "adapted"),
        slot("st", "invalid", "player:three", "Three Player"),
      ],
    })],
  });
  const action = view.rows[0]?.actions[0];

  assert.equal(action?.actionId, "field_player");
  if (action?.actionId !== "field_player") throw new Error("field action missing");
  assert.equal(action.mode, "choose_slot");
  assert.deepEqual(action.choices.map((choice) => [choice.slotKey, choice.isEmpty]), [
    ["cm-empty", true],
    ["cm-occupied", false],
  ]);
});

test("moves players explicitly between XI and bench", () => {
  const view = buildCareerSquadView({
    players: [
      player({
        playerId: "player:starter",
        selection: "starting_xi",
        selectedLineupSlotKey: "cm",
        availableBenchSlotKey: "bench-3",
      }),
      player({
        playerId: "player:substitute",
        selection: "substitute",
        selectedBenchSlotKey: "bench-2",
        lineupSlotChoices: [slot("cm", "natural")],
      }),
    ],
  });

  assert.deepEqual(view.rows[0]?.actions, [
    {
      actionId: "remove_from_starting_xi",
      labelKey: "career.squad.action.removeFromStartingXi",
      slotKey: "cm",
    },
    {
      actionId: "select_as_substitute",
      labelKey: "career.squad.action.selectAsSubstitute",
      slotKey: "bench-3",
    },
  ]);
  assert.deepEqual(view.rows[1]?.actions, [
    {
      actionId: "remove_from_bench",
      labelKey: "career.squad.action.removeFromBench",
      slotKey: "bench-2",
    },
    {
      actionId: "field_player",
      labelKey: "career.squad.action.field",
      mode: "direct",
      choices: [{
        slotKey: "cm",
        labelKey: "career.matchPreparation.slot.cm",
        role: "central_midfielder",
        suitability: "natural",
        isEmpty: true,
      }],
    },
  ]);
});

test("sorts and filters deterministically without exposing numeric hidden ability", () => {
  const view = buildCareerSquadView({
    players: [
      player({ playerId: "player:two", shirtNumber: 8, firstName: "Marco", primaryRole: "central_midfielder" }),
      player({ playerId: "player:one", shirtNumber: 1, firstName: "Luca", primaryRole: "goalkeeper" }),
      player({ playerId: "player:three", shirtNumber: 4, firstName: "Nico", primaryRole: "center_back" }),
    ],
    filters: { department: "defense" },
  });

  assert.deepEqual(view.rows.map((row) => row.playerId), ["player:three"]);
  assert.equal(view.totalPlayerCount, 3);
  assert.equal(view.visiblePlayerCount, 1);
  assert.equal(JSON.stringify(view).includes("currentAbility"), false);
  assert.equal(JSON.stringify(view).includes("potentialAbility"), false);
});

function player(overrides: Partial<CareerSquadPlayerInput> = {}): CareerSquadPlayerInput {
  return {
    playerId: "player:base",
    shirtNumber: 10,
    firstName: "Test",
    lastName: "Player",
    primaryRole: "central_midfielder",
    condition: 91,
    morale: 64,
    selection: "unselected",
    availabilityReasons: [],
    value: nonNegativeMoney(750_000_00),
    currency: "EUR",
    currentLevel: "first_team",
    potentialLevel: "leading",
    hasExpiringContract: false,
    lineupSlotChoices: [],
    availableBenchSlotKey: "bench-1",
    ...overrides,
  };
}

function slot(
  slotKey: string,
  suitability: "natural" | "adapted" | "weak" | "invalid",
  occupantPlayerId?: string,
  occupantName?: string,
): CareerSquadPlayerInput["lineupSlotChoices"][number] {
  return {
    slotKey,
    labelKey: "career.matchPreparation.slot.cm",
    role: slotKey === "st" ? "striker" : "central_midfielder",
    suitability,
    ...(occupantPlayerId === undefined ? {} : { occupantPlayerId }),
    ...(occupantName === undefined ? {} : { occupantName }),
  };
}
