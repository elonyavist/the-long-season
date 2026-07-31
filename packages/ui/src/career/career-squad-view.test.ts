import assert from "node:assert/strict";
import { test } from "vitest";

import { nonNegativeMoney } from "@game/domain";

import {
  CAREER_SQUAD_COLUMNS,
  buildCareerSquadView,
  type CareerSquadPlayerInput,
} from "./career-squad-view.ts";

test("keeps an injured selected player's current placement and removal target visible", () => {
  const view = buildCareerSquadView({
    players: [player({
      playerId: "player:injured",
      selection: "starting_xi",
      selectedLineupSlotKey: "cm",
      availabilityReasons: ["injured"],
      hasExpiringContract: true,
      lineupSlotChoices: [
        slot("cm", "natural", "player:injured", "Injured Player"),
      ],
      availableBenchSlotKey: "bench-1",
    })],
  });

  assert.deepEqual(view.columns.map((column) => column.key), CAREER_SQUAD_COLUMNS);
  assert.equal(view.rows[0]?.selection, "starting_xi");
  assert.equal(view.rows[0]?.compositeStatus, "injured");
  assert.equal(view.rows[0]?.hasExpiringContract, true);
  assert.equal(view.rows[0]?.placement.value, "lineup:cm");
  assert.deepEqual(view.rows[0]?.placement.options.map((option) => option.value), [
    "unselected",
    "bench:bench-1",
    "lineup:cm",
  ]);
});

test("does not advertise a new XI or bench placement for an unavailable unselected player", () => {
  const view = buildCareerSquadView({
    players: [
      player({
        playerId: "player:unavailable",
        availabilityReasons: ["suspended"],
        availableBenchSlotKey: "bench-1",
        lineupSlotChoices: [slot("cm", "natural")],
      }),
    ],
  });

  assert.equal(view.rows[0]?.placement.value, "unselected");
  assert.deepEqual(view.rows[0]?.placement.options, [{
    kind: "unselected",
    value: "unselected",
    labelKey: "career.squad.placement.unselected",
  }]);
  assert.deepEqual(view.rows[0]?.lineupChoices, []);
});

test("exposes every legal real-XI slot in formation order and retains sorted detailed choices", () => {
  const view = buildCareerSquadView({
    players: [player({
      playerId: "player:choices",
      availableBenchSlotKey: "bench-1",
      lineupSlotChoices: [
        slot("cm-right", "adapted", "player:one", "One Player"),
        slot("st-left", "weak"),
        slot("cm-left", "natural", "player:two", "Two Player"),
        slot("st", "invalid", "player:three", "Three Player"),
      ],
    })],
  });

  assert.deepEqual(view.rows[0]?.placement.options.map((option) => option.value), [
    "unselected",
    "bench:bench-1",
    "lineup:cm-right",
    "lineup:st-left",
    "lineup:cm-left",
  ]);
  assert.deepEqual(view.rows[0]?.lineupChoices.map((choice) => [
    choice.slotKey,
    choice.suitability,
    choice.occupantPlayerId,
  ]), [
    ["st-left", "weak", undefined],
    ["cm-left", "natural", "player:two"],
    ["cm-right", "adapted", "player:one"],
  ]);
});

test("keeps side-specific labels and occupied-player facts on lineup options", () => {
  const view = buildCareerSquadView({
    players: [player({
      playerId: "player:sides",
      lineupSlotChoices: [
        slot(
          "st-right",
          "weak",
          "player:one",
          "One Player",
          "career.matchPreparation.slot.stRight",
        ),
        slot(
          "st-left",
          "natural",
          undefined,
          undefined,
          "career.matchPreparation.slot.stLeft",
        ),
      ],
    })],
  });

  assert.deepEqual(view.rows[0]?.placement.options.slice(1), [
    {
      kind: "lineup",
      value: "lineup:st-right",
      slotKey: "st-right",
      labelKey: "career.matchPreparation.slot.stRight",
      role: "striker",
      suitability: "weak",
      isEmpty: false,
      occupantPlayerId: "player:one",
      occupantName: "One Player",
    },
    {
      kind: "lineup",
      value: "lineup:st-left",
      slotKey: "st-left",
      labelKey: "career.matchPreparation.slot.stLeft",
      role: "striker",
      suitability: "natural",
      isEmpty: true,
    },
  ]);
});

test("shows a concrete bench target only when the move is possible", () => {
  const view = buildCareerSquadView({
    players: [
      player({
        playerId: "player:starter",
        selection: "starting_xi",
        selectedLineupSlotKey: "cm",
        lineupSlotChoices: [slot("cm", "natural", "player:starter", "Starter Player")],
      }),
      player({
        playerId: "player:substitute",
        selection: "substitute",
        selectedBenchSlotKey: "bench-2",
        lineupSlotChoices: [slot("cm", "natural")],
      }),
      player({
        playerId: "player:available",
        availableBenchSlotKey: "bench-3",
      }),
    ],
  });
  const starter = view.rows.find((row) => row.playerId === "player:starter");
  const substitute = view.rows.find((row) => row.playerId === "player:substitute");
  const available = view.rows.find((row) => row.playerId === "player:available");

  assert.deepEqual(starter?.placement.options.map((option) => option.value), [
    "unselected",
    "lineup:cm",
  ]);
  assert.equal(substitute?.placement.value, "bench:bench-2");
  assert.deepEqual(
    substitute?.placement.options.find((option) => option.kind === "bench"),
    {
      kind: "bench",
      value: "bench:bench-2",
      labelKey: "career.squad.placement.bench",
      slotKey: "bench-2",
      isEmpty: false,
      occupantPlayerId: "player:substitute",
    },
  );
  assert.deepEqual(substitute?.placement.options.map((option) => option.value), [
    "unselected",
    "bench:bench-2",
    "lineup:cm",
  ]);
  assert.deepEqual(
    available?.placement.options.find((option) => option.kind === "bench"),
    {
      kind: "bench",
      value: "bench:bench-3",
      labelKey: "career.squad.placement.bench",
      slotKey: "bench-3",
      isEmpty: true,
    },
  );
  assert.deepEqual(available?.placement.options.map((option) => option.value), [
    "unselected",
    "bench:bench-3",
  ]);
});

test("sorts the placement column as XI, bench, then unselected", () => {
  const view = buildCareerSquadView({
    players: [
      player({ playerId: "player:unselected" }),
      player({
        playerId: "player:substitute",
        selection: "substitute",
        selectedBenchSlotKey: "bench-2",
      }),
      player({
        playerId: "player:starter",
        selection: "starting_xi",
        selectedLineupSlotKey: "cm",
        lineupSlotChoices: [slot("cm", "natural", "player:starter", "Starter Player")],
      }),
    ],
    sort: { key: "placement", direction: "ascending" },
  });

  assert.deepEqual(view.rows.map((row) => row.playerId), [
    "player:starter",
    "player:substitute",
    "player:unselected",
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

test("preserves half-star ratings as copies and sorts elite above ordinary five stars", () => {
  const currentRating = { stars: 3.5 } as const;
  const view = buildCareerSquadView({
    players: [
      player({
        playerId: "player:half",
        currentRating,
        potentialRange: { lowerStars: 3.5, upperStars: 4.5 },
      }),
      player({
        playerId: "player:five",
        currentRating: { stars: 5 },
        potentialRange: { lowerStars: 5, upperStars: 5 },
      }),
      player({
        playerId: "player:elite",
        currentRating: { stars: 6 },
        potentialRange: { lowerStars: 6, upperStars: 6 },
      }),
    ],
    sort: { key: "current_level", direction: "ascending" },
  });

  assert.deepEqual(view.rows.map((row) => row.playerId), [
    "player:half",
    "player:five",
    "player:elite",
  ]);
  assert.deepEqual(view.rows[0]?.currentRating, currentRating);
  assert.notEqual(view.rows[0]?.currentRating, currentRating);
});

test("sorts potential by lower estimate, upper ceiling, current rating, then ID", () => {
  const view = buildCareerSquadView({
    players: [
      player({
        playerId: "player:lottery",
        currentRating: { stars: 2 },
        potentialRange: { lowerStars: 2, upperStars: 6 },
      }),
      player({
        playerId: "player:narrow",
        currentRating: { stars: 4 },
        potentialRange: { lowerStars: 4, upperStars: 5.5 },
      }),
      player({
        playerId: "player:narrow-b",
        currentRating: { stars: 3.5 },
        potentialRange: { lowerStars: 4, upperStars: 5.5 },
      }),
    ],
    sort: { key: "potential_level", direction: "descending" },
  });

  assert.deepEqual(view.rows.map((row) => row.playerId), [
    "player:narrow",
    "player:narrow-b",
    "player:lottery",
  ]);
});

test("keeps Placement next to Role and exposes a sortable canonical age column", () => {
  const view = buildCareerSquadView({
    players: [
      player({ playerId: "player:older", age: 33 }),
      player({ playerId: "player:younger", age: 18 }),
      player({ playerId: "player:middle", age: 26 }),
    ],
    sort: { key: "age", direction: "ascending" },
  });

  assert.deepEqual(view.columns.map((column) => column.key), [
    "number",
    "role",
    "placement",
    "player",
    "age",
    "condition",
    "morale",
    "status",
    "value",
    "current_level",
    "potential_level",
    "action",
  ]);
  assert.equal(
    view.columns.find((column) => column.key === "age")?.sortKey,
    "age",
  );
  assert.deepEqual(view.rows.map((row) => row.age), [18, 26, 33]);
  assert.deepEqual(
    buildCareerSquadView({
      players: [
        player({ playerId: "player:older", age: 33 }),
        player({ playerId: "player:younger", age: 18 }),
        player({ playerId: "player:middle", age: 26 }),
      ],
      sort: { key: "age", direction: "descending" },
    }).rows.map((row) => row.age),
    [33, 26, 18],
  );
});

function player(overrides: Partial<CareerSquadPlayerInput> = {}): CareerSquadPlayerInput {
  return {
    playerId: "player:base",
    shirtNumber: 10,
    firstName: "Test",
    lastName: "Player",
    age: 24,
    primaryRole: "central_midfielder",
    condition: 91,
    morale: 64,
    selection: "unselected",
    availabilityReasons: [],
    value: nonNegativeMoney(750_000_00),
    currency: "EUR",
    currentRating: { stars: 3.5 },
    potentialRange: { lowerStars: 3.5, upperStars: 4.5 },
    hasExpiringContract: false,
    lineupSlotChoices: [],
    ...overrides,
  };
}

function slot(
  slotKey: string,
  suitability: "natural" | "adapted" | "weak" | "invalid",
  occupantPlayerId?: string,
  occupantName?: string,
  labelKey = "career.matchPreparation.slot.cm",
): CareerSquadPlayerInput["lineupSlotChoices"][number] {
  return {
    slotKey,
    labelKey,
    role: slotKey.startsWith("st") ? "striker" : "central_midfielder",
    suitability,
    ...(occupantPlayerId === undefined ? {} : { occupantPlayerId }),
    ...(occupantName === undefined ? {} : { occupantName }),
  };
}
