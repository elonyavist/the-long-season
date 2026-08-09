import assert from "node:assert/strict";
import { test } from "vitest";

import {
  abilityValue,
  clubId,
  gameDate,
  getFormation,
  playerId,
  stateValue,
  type Formation,
  type Player,
  type PlayerAbilities,
  type PlayerId,
  type PlayerPosition,
} from "@game/domain";

import {
  AiSquadSelectionError,
  buildAiSquadMatchTeamContext,
  selectAiMatchSquad,
} from "./ai-squad-selection.ts";
import type { RoleWeightProfile } from "../match-engine/index.ts";
import type { PublicPlayerAssessment } from "../squad/public-player-assessment.ts";
import { matchTacticsCalibrationFixture } from "../test-fixtures/match-tactics-calibration.ts";


test("selectAiMatchSquad builds a valid XI and bench without duplicate players", () => {
  const input = squadInput({
    formation: getFormation("4-4-2"),
    playerIds: fullSquadIds(),
    players: fullSquadPlayers(),
  });
  const selection = selectAiMatchSquad(input);
  const selectedIds = [...selection.lineup.map((slot) => slot.playerId), ...selection.benchPlayerIds];

  assert.equal(selection.lineup.length, 11);
  assert.equal(selection.benchPlayerIds.length, 8);
  assert.equal(new Set(selectedIds).size, selectedIds.length);
  assert.equal(selection.lineup[0]?.canonicalRole, "goalkeeper");
  assert.equal(selection.benchPlayerIds.includes(playerId("player:gk-02")), true);
  assert.equal(selection.reasons.filter((reason) => reason.selection === "lineup").length, 11);
});

test("selectAiMatchSquad prefers a clearly stronger adapted player over a weak natural player", () => {
  const formation: Formation = {
    key: "4-4-2",
    slots: [
      {
        slotKey: "st",
        line: "forward_line",
        department: "attack",
        playerRole: "striker",
        positionFamily: "striker",
        side: "center",
      },
    ],
  };
  const adaptedId = playerId("player:adapted-am");
  const naturalId = playerId("player:natural-st");
  const selection = selectAiMatchSquad(squadInput({
    formation,
    playerIds: [naturalId, adaptedId],
    players: {
      [naturalId]: makePlayer(naturalId, ["st"], 8),
      [adaptedId]: makePlayer(adaptedId, ["am"], 13),
    },
    benchSize: 0,
  }));

  assert.equal(selection.lineup[0]?.playerId, adaptedId);
  assert.equal(selection.reasons[0]?.suitability, "adapted");
});

test("selectAiMatchSquad preserves a later-slot specialist when greedy selection would dead-end", () => {
  const leftBackCoverId = playerId("player:a-left-back-cover");
  const leftWingBackId = playerId("player:z-left-wing-back");
  const firstCentralMidfielderId = playerId("player:cm-a");
  const secondCentralMidfielderId = playerId("player:cm-b");
  const selection = selectAiMatchSquad(squadInput({
    formation: hallCounterexampleFormation(),
    playerIds: [leftWingBackId, firstCentralMidfielderId, secondCentralMidfielderId, leftBackCoverId],
    players: {
      [leftBackCoverId]: makePlayer(leftBackCoverId, ["cb"], 8),
      [leftWingBackId]: makePlayer(leftWingBackId, ["lwb"], 14),
      [firstCentralMidfielderId]: makePlayer(firstCentralMidfielderId, ["cm"], 10),
      [secondCentralMidfielderId]: makePlayer(secondCentralMidfielderId, ["cm"], 10),
    },
    benchSize: 0,
  }));

  assert.deepEqual(selection.lineup.map(({ playerId: selectedPlayerId }) => selectedPlayerId), [
    leftBackCoverId,
    firstCentralMidfielderId,
    secondCentralMidfielderId,
    leftWingBackId,
  ]);
  assert.deepEqual(selection.reasons.map(({ suitability }) => suitability), [
    "weak",
    "natural",
    "natural",
    "natural",
  ]);
});

/**
 * Fixes what a roster with no *usable* complete assignment does (Step 14).
 *
 * The four footballers here cover only three of the four slots between them -
 * the striker is an invalid fit for every one of them - so no assignment exists
 * that keeps everybody in a position he can play. That used to end the fixture.
 * There are four players for four slots, so "not enough players" was never the
 * truth about this roster: somebody is out of position, which is a different
 * sentence and the one football says.
 *
 * The global-versus-greedy property this shape was built to prove is owned by
 * `football-xi-assignment.test.ts`, which tests it on the Module directly.
 */
test("a roster that cannot cover every slot is fielded out of position", () => {
  const leftWingBackId = playerId("player:left-wing-back");
  const firstCentralMidfielderId = playerId("player:cm-a");
  const secondCentralMidfielderId = playerId("player:cm-b");
  const invalidCoverId = playerId("player:striker");
  const players = {
    [leftWingBackId]: makePlayer(leftWingBackId, ["lwb"], 14),
    [firstCentralMidfielderId]: makePlayer(firstCentralMidfielderId, ["cm"], 10),
    [secondCentralMidfielderId]: makePlayer(secondCentralMidfielderId, ["cm"], 10),
    [invalidCoverId]: makePlayer(invalidCoverId, ["st"], 10),
  };

  const selection = selectAiMatchSquad(squadInput({
    formation: hallCounterexampleFormation(),
    playerIds: [leftWingBackId, firstCentralMidfielderId, secondCentralMidfielderId, invalidCoverId],
    players,
    benchSize: 0,
  }));

  assert.equal(selection.lineup.length, 4);
  assert.equal(new Set(selection.lineup.map((slot) => slot.playerId)).size, 4);
  assert.equal(
    selection.reasons.filter((reason) => reason.suitability === "invalid").length,
    1,
  );
});

/** `not_enough_players` keeps the one meaning its name has. */
test("selectAiMatchSquad still rejects a roster with fewer players than slots", () => {
  const leftWingBackId = playerId("player:left-wing-back");
  const firstCentralMidfielderId = playerId("player:cm-a");
  const secondCentralMidfielderId = playerId("player:cm-b");
  const players = {
    [leftWingBackId]: makePlayer(leftWingBackId, ["lwb"], 14),
    [firstCentralMidfielderId]: makePlayer(firstCentralMidfielderId, ["cm"], 10),
    [secondCentralMidfielderId]: makePlayer(secondCentralMidfielderId, ["cm"], 10),
  };

  assert.throws(
    () => selectAiMatchSquad(squadInput({
      formation: hallCounterexampleFormation(),
      playerIds: [leftWingBackId, firstCentralMidfielderId, secondCentralMidfielderId],
      players,
      benchSize: 0,
    })),
    (error) => error instanceof AiSquadSelectionError
      && error.code === "not_enough_players",
  );
});

test("selectAiMatchSquad cannot assign a duplicated roster ID to two slots", () => {
  const duplicatedPlayerId = playerId("player:duplicated-striker");
  const player = makePlayer(duplicatedPlayerId, ["st"], 10);
  const formation: Formation = {
    key: "4-4-2",
    slots: [
      {
        slotKey: "st-right",
        line: "forward_line",
        department: "attack",
        playerRole: "striker",
        positionFamily: "striker",
        side: "right_center",
      },
      {
        slotKey: "st-left",
        line: "forward_line",
        department: "attack",
        playerRole: "striker",
        positionFamily: "striker",
        side: "left_center",
      },
    ],
  };

  assert.throws(
    () => selectAiMatchSquad(squadInput({
      formation,
      playerIds: [duplicatedPlayerId, duplicatedPlayerId],
      players: { [duplicatedPlayerId]: player },
      benchSize: 0,
    })),
    (error) => error instanceof AiSquadSelectionError
      && error.code === "not_enough_players",
  );
});

test("selectAiMatchSquad rotates from tired recent starters to credible alternatives", () => {
  const starterId = playerId("player:cm-01");
  const restedId = playerId("player:cm-03");
  const selection = selectAiMatchSquad(squadInput({
    playerIds: [starterId, restedId],
    players: {
      [starterId]: makePlayer(starterId, ["cm"], 10.6),
      [restedId]: makePlayer(restedId, ["cm"], 10),
    },
    formation: oneSlotFormation("central_midfielder"),
    benchSize: 0,
    playerStates: {
      [starterId]: playerState(62),
      [restedId]: playerState(100),
    },
    recentUse: {
      [starterId]: { recentMinutes: 270, recentStarts: 3 },
      [restedId]: { recentMinutes: 0, recentStarts: 0 },
    },
  }));

  assert.equal(selection.lineup[0]?.playerId, restedId);
});

test("buildAiSquadMatchTeamContext derives strength from the selected AI lineup", () => {
  const result = buildAiSquadMatchTeamContext({
    ...squadInput({
      formation: getFormation("4-4-2"),
      playerIds: fullSquadIds(),
      players: fullSquadPlayers(),
    }),
    tacticalDistribution: () => ({
      directness: 0.5,
      pressing: 0.5,
      width: 0.5,
      risk: 0.5,
      mentality: "balanced",
    }),
    matchTacticsCalibration: matchTacticsCalibrationFixture(),
  });

  assert.equal(result.teamContext.clubId, clubId("club:ai"));
  assert.equal(result.teamContext.lineup.length, 11);
  assert.equal(result.teamContext.strength.overall > 0, true);
});

test("selectAiMatchSquad cannot prefer a hidden ceiling over equal public assessments", () => {
  const lowerCeilingId = playerId("player:a-lower-ceiling");
  const higherCeilingId = playerId("player:z-higher-ceiling");
  const lowerCeilingPlayer = makePlayer(lowerCeilingId, ["st"], 10);
  const higherCeilingPlayer = {
    ...makePlayer(higherCeilingId, ["st"], 10),
    potential: abilitySet(20),
  };
  const publicAssessments = {
    [lowerCeilingId]: publicAssessment(lowerCeilingId, 24, 10, 13),
    [higherCeilingId]: publicAssessment(higherCeilingId, 24, 10, 13),
  };

  const selection = selectAiMatchSquad(squadInput({
    formation: oneSlotFormation("striker"),
    playerIds: [higherCeilingId, lowerCeilingId],
    players: {
      [lowerCeilingId]: lowerCeilingPlayer,
      [higherCeilingId]: higherCeilingPlayer,
    },
    publicAssessments,
    benchSize: 0,
  }));

  assert.equal(selection.lineup[0]?.playerId, lowerCeilingId);
  assert.deepEqual(selection.reasons.map(({ prospectOpportunity }) => prospectOpportunity), [0]);
});

/**
 * Fixes the defect Step 09 measured in the greedy slot-order selector.
 *
 * Walking the slots and giving each its best remaining player answers "who is
 * the best right back", not "which eleven is the best team". The centre back who
 * can also play right back was taken by the right-back slot because it came
 * first, and a specialist right back then played centre back. Greedy scored
 * `29.45` here where the best eleven scores `35.35`.
 */
test("a versatile defender is not consumed by the slot that happens to come first", () => {
  const versatileId = playerId("player:versatile-cb-rb");
  const specialistId = playerId("player:specialist-rb");
  const selection = selectAiMatchSquad(squadInput({
    formation: rightSideDefenceFormation(),
    playerIds: [versatileId, specialistId],
    players: {
      [versatileId]: makePlayer(versatileId, ["cb", "rb"], 15),
      [specialistId]: makePlayer(specialistId, ["rb"], 14.5),
    },
    benchSize: 0,
  }));

  assert.deepEqual(selection.lineup.map((slot) => slot.playerId), [specialistId, versatileId]);
  assert.deepEqual(selection.reasons.map(({ suitability }) => suitability), ["natural", "natural"]);
});

test("the same squad in a different roster order selects the same eleven", () => {
  const players = fullSquadPlayers();
  const forward = selectAiMatchSquad(squadInput({ playerIds: fullSquadIds(), players }));
  const reversed = selectAiMatchSquad(squadInput({ playerIds: [...fullSquadIds()].reverse(), players }));

  assert.deepEqual(
    [...reversed.lineup.map((slot) => slot.playerId)].sort(),
    [...forward.lineup.map((slot) => slot.playerId)].sort(),
  );
  assert.equal(reversed.formation.key, forward.formation.key);
});

/**
 * Holds the world coherent for clubs nobody is preparing (A2).
 *
 * A club lines up in a real catalog shape chosen from its own footballers, not
 * in one fixed shape every club in the league shares. Until Step 09 every AI
 * club fielded the same `4-4-2` composed by roster order, which is also why
 * Step 11B could not measure a counter-move: there was only one thing to counter.
 */
test("a squad built for a back three lines up in one", () => {
  const players: Record<PlayerId, Player> = {};
  const ids: PlayerId[] = [];
  const specs: ReadonlyArray<readonly [string, PlayerPosition]> = [
    ["gk", "gk"],
    ["cb-1", "cb"], ["cb-2", "cb"], ["cb-3", "cb"], ["cb-4", "cb"],
    ["rwb", "rwb"], ["lwb", "lwb"],
    ["cm-1", "cm"], ["cm-2", "cm"], ["dm", "dm"],
    ["st-1", "st"], ["st-2", "st"],
  ];
  for (const [name, position] of specs) {
    const id = playerId(`player:${name}`);
    ids.push(id);
    players[id] = makePlayer(id, [position], 12);
  }

  const selection = selectAiMatchSquad(squadInput({ playerIds: ids, players, benchSize: 1 }));
  const backLine = selection.lineup.filter((slot) => slot.canonicalRole === "center_back");

  assert.equal(selection.formation.key.startsWith("3-"), true);
  assert.equal(backLine.length, 3);
  assert.equal(selection.lineup[0]?.canonicalRole, "goalkeeper");
});

/**
 * Fixes what a club does when it has run out of goalkeepers.
 *
 * Nothing but a natural goalkeeper is even a weak fit for the role, so refusing
 * to name an eleven means the fixture cannot be played at all - which is not
 * what football does, and not what this engine does when a keeper is sent off
 * mid-match. Somebody puts the gloves on, and it is the best of a bad set.
 */
test("a squad with no goalkeeper still fields an eleven, gloves to the best of them", () => {
  const { players, ids } = keeperlessSquad();
  const handiestId = playerId("player:cm-2");
  players[handiestId] = withGoalkeeping(players[handiestId] as Player, 14);

  const selection = selectAiMatchSquad(squadInput({ playerIds: ids, players, benchSize: 0 }));
  const inGoal = selection.lineup.find((slot) => slot.canonicalRole === "goalkeeper");

  assert.equal(selection.lineup.length, 11);
  assert.equal(inGoal?.playerId, handiestId);
  assert.equal(
    selection.reasons.find((reason) => reason.slotKey.includes("gk"))?.suitability,
    "invalid",
  );
});

test("a real goalkeeper is always preferred to an emergency one", () => {
  const { players, ids } = keeperlessSquad();
  for (const id of ids) {
    players[id] = withGoalkeeping(players[id] as Player, 19);
  }
  const keeperId = playerId("player:keeper");
  players[keeperId] = makePlayer(keeperId, ["gk"], 5);

  const selection = selectAiMatchSquad(squadInput({
    playerIds: [...ids, keeperId],
    players,
    benchSize: 0,
  }));
  const inGoal = selection.lineup.find((slot) => slot.canonicalRole === "goalkeeper");

  assert.equal(inGoal?.playerId, keeperId);
});

/**
 * Fixes what a *given* shape does to a squad that cannot fill it (Step 14).
 *
 * A caller who supplies the formation has taken the choice away from the club,
 * so "I have nobody for that" stops being an answer the club can act on. Before
 * this it threw, and the fixture it was throwing inside simply ended - which is
 * how the Step 12 inspection lost five of twenty worlds. Football plays somebody
 * out of position instead, and records that it did.
 */
test("a shape the squad cannot fill is filled out of position, not refused", () => {
  const { players, ids } = oneStrikerSquad();

  const selection = selectAiMatchSquad(squadInput({
    formation: getFormation("4-4-2"),
    playerIds: ids,
    players,
    benchSize: 0,
  }));
  const forwards = selection.lineup.filter((slot) => slot.canonicalRole === "striker");

  assert.equal(selection.formation.key, "4-4-2");
  assert.equal(selection.lineup.length, 11);
  assert.equal(new Set(selection.lineup.map((slot) => slot.playerId)).size, 11);
  assert.equal(forwards.length, 2);
  // Exactly one of them is a man out of position, which is the whole cost.
  assert.equal(
    selection.reasons.filter((reason) => reason.suitability === "invalid").length,
    1,
  );
});

/**
 * The club's own choice is untouched: it picks a shape it can actually fill.
 *
 * `strongestCatalogShape` searches with the `invalid` filter still on, so a
 * club that is free to choose never reaches the second attempt. The same squad
 * that needs a man out of position to line up as `4-4-2` lines up with nobody
 * out of position when nobody forces the shape.
 */
test("choosing a shape is unaffected: the same squad picks one it can fill", () => {
  const { players, ids } = oneStrikerSquad();

  const selection = selectAiMatchSquad(squadInput({ playerIds: ids, players, benchSize: 0 }));

  assert.equal(selection.lineup.length, 11);
  assert.notEqual(selection.formation.key, "4-4-2");
  assert.equal(
    selection.reasons.some((reason) => reason.suitability === "invalid"),
    false,
  );
});

/**
 * A depleted club may still have eleven available footballers without having a
 * forward. The catalog must choose the least-bad emergency shape rather than
 * ending the fixture or reaching back into the unavailable squad.
 */
test("a free selector fields and records a least-bad emergency shape when no catalog XI is usable", () => {
  const { players, ids } = forwardlessEmergencySquad();

  const selection = selectAiMatchSquad(squadInput({ playerIds: ids, players, benchSize: 4 }));
  const invalidLineupReasons = selection.reasons.filter(
    (reason) => reason.selection === "lineup" && reason.suitability === "invalid",
  );

  assert.equal(selection.lineup.length, 11);
  assert.equal(new Set(selection.lineup.map((slot) => slot.playerId)).size, 11);
  assert.equal(selection.catalogChoice?.fillableShapeCount, 0);
  assert.equal(invalidLineupReasons.length > 0, true);
  assert.equal(selection.benchPlayerIds.length, 4);
  assert.equal(selection.reasons.filter((reason) => reason.selection === "bench").length, 4);
});

/**
 * Eleven footballers with exactly one striker.
 *
 * `4-4-2` needs two, and the only non-`invalid` cover for a striker slot is a
 * natural striker or an attacking midfielder - a role this squad, like every
 * generated world, does not have. So the shape is fillable only out of
 * position, while a one-striker shape from the catalog is not.
 */
function oneStrikerSquad(): {
  players: Record<PlayerId, Player>;
  ids: readonly PlayerId[];
} {
  const players: Record<PlayerId, Player> = {};
  const ids: PlayerId[] = [];
  const specs: ReadonlyArray<readonly [string, PlayerPosition]> = [
    ["gk", "gk"],
    ["cb-1", "cb"], ["cb-2", "cb"], ["cb-3", "cb"], ["cb-4", "cb"],
    ["rwb", "rwb"], ["lwb", "lwb"],
    ["cm-1", "cm"], ["cm-2", "cm"], ["cm-3", "cm"],
    ["st", "st"],
  ];
  for (const [name, position] of specs) {
    const id = playerId(`player:${name}`);
    ids.push(id);
    players[id] = makePlayer(id, [position], 12);
  }

  return { players, ids };
}

/** The exact role coverage that stopped the first two 06B5 refinement runs. */
function forwardlessEmergencySquad(): {
  players: Record<PlayerId, Player>;
  ids: readonly PlayerId[];
} {
  const players: Record<PlayerId, Player> = {};
  const ids: PlayerId[] = [];
  const specs: ReadonlyArray<readonly [string, PlayerPosition]> = [
    ["gk-1", "gk"], ["gk-2", "gk"],
    ["cb-1", "cb"], ["cb-2", "cb"], ["cb-3", "cb"], ["cb-4", "cb"],
    ["rb-1", "rb"], ["rb-2", "rb"], ["lb", "lb"],
    ["dm-1", "dm"], ["dm-2", "dm"], ["cm-1", "cm"], ["cm-2", "cm"],
    ["lm", "lm"], ["rm", "rm"],
  ];
  for (const [name, position] of specs) {
    const id = playerId(`player:${name}`);
    ids.push(id);
    players[id] = makePlayer(id, [position], 12);
  }

  return { players, ids };
}

/** Twelve outfielders who between them can fill any curated shape but the goal. */
function keeperlessSquad(): {
  players: Record<PlayerId, Player>;
  ids: readonly PlayerId[];
} {
  const players: Record<PlayerId, Player> = {};
  const ids: PlayerId[] = [];
  const specs: ReadonlyArray<readonly [string, PlayerPosition]> = [
    ["rb", "rb"], ["cb-1", "cb"], ["cb-2", "cb"], ["cb-3", "cb"], ["lb", "lb"],
    ["rwb", "rwb"], ["lwb", "lwb"],
    ["cm-1", "cm"], ["cm-2", "cm"], ["cm-3", "cm"],
    ["st-1", "st"], ["st-2", "st"],
  ];
  for (const [name, position] of specs) {
    const id = playerId(`player:${name}`);
    ids.push(id);
    players[id] = makePlayer(id, [position], 12);
  }

  return { players, ids };
}

/**
 * Fixes a club's shape against the circumstances of one Saturday (Step 09).
 *
 * Shape and eleven were chosen by the same score, so a tired defender could
 * lower a back three below a back four and change the side's formation for one
 * week. A squad is built for a shape over a season; fatigue is not a reason to
 * change system.
 */
test("fatigue changes who plays, never the shape the squad is built for", () => {
  const players: Record<PlayerId, Player> = {};
  const ids: PlayerId[] = [];
  const specs: ReadonlyArray<readonly [string, PlayerPosition]> = [
    ["gk", "gk"],
    ["cb-1", "cb"], ["cb-2", "cb"], ["cb-3", "cb"], ["cb-4", "cb"],
    ["rwb", "rwb"], ["lwb", "lwb"],
    ["cm-1", "cm"], ["cm-2", "cm"], ["dm", "dm"],
    ["st-1", "st"], ["st-2", "st"],
  ];
  for (const [name, position] of specs) {
    const id = playerId(`player:${name}`);
    ids.push(id);
    players[id] = makePlayer(id, [position], 12);
  }

  const fresh = selectAiMatchSquad(squadInput({ playerIds: ids, players, benchSize: 1 }));
  const exhausted = selectAiMatchSquad(squadInput({
    playerIds: ids,
    players,
    benchSize: 1,
    playerStates: Object.fromEntries(
      ["cb-1", "cb-2", "cb-3"].map((name) => [playerId(`player:${name}`), playerState(45)]),
    ),
  }));

  assert.equal(exhausted.formation.key, fresh.formation.key);
  assert.notDeepEqual(
    exhausted.lineup.map((slot) => slot.playerId),
    fresh.lineup.map((slot) => slot.playerId),
  );
});

test("live XI quality resolves an otherwise catalog-sensitive structural tie", () => {
  const players = fullSquadPlayers();
  const allPlayerIds = fullSquadIds();
  let reachable:
    | { readonly fresh: ReturnType<typeof selectAiMatchSquad>; readonly resolved: ReturnType<typeof selectAiMatchSquad> }
    | undefined;

  // Search a stable slice of the real selector input space instead of pinning
  // one synthetic catalog accident. Removing up to two squad players reaches
  // the same depleted-roster ties that long careers create through availability.
  const rosters = [
    allPlayerIds,
    ...allPlayerIds.map((removed) => allPlayerIds.filter((id) => id !== removed)),
    ...allPlayerIds.flatMap((left, leftIndex) =>
      allPlayerIds.slice(leftIndex + 1).map((right) =>
        allPlayerIds.filter((id) => id !== left && id !== right)
      )
    ),
  ];
  for (const playerIds of rosters) {
    const fresh = selectAiMatchSquad(squadInput({ playerIds, players, benchSize: 0 }));
    for (const tiredPlayerId of playerIds) {
      const resolved = selectAiMatchSquad(squadInput({
        playerIds,
        players,
        benchSize: 0,
        playerStates: { [tiredPlayerId]: playerState(45) },
      }));
      if (resolved.formation.key !== fresh.formation.key) {
        reachable = { fresh, resolved };
        break;
      }
    }
    if (reachable !== undefined) break;
  }

  assert.notEqual(reachable, undefined);
  assert.equal(reachable?.fresh.catalogChoice?.tiedAtBestCount, 1);
  assert.equal(reachable?.resolved.catalogChoice?.tiedAtBestCount, 1);
});

test("a stronger squad selects a stronger eleven from the same shape", () => {
  const strong = selectAiMatchSquad(squadInput({
    formation: getFormation("4-4-2"),
    playerIds: fullSquadIds(),
    players: fullSquadPlayers(),
    benchSize: 0,
  }));
  const weakPlayers = Object.fromEntries(
    Object.entries(fullSquadPlayers()).map(([id, player]) => [
      id,
      makePlayer(playerId(id), player.naturalPositions, 6),
    ]),
  ) as Readonly<Record<PlayerId, Player>>;
  const weak = selectAiMatchSquad(squadInput({
    formation: getFormation("4-4-2"),
    playerIds: fullSquadIds(),
    players: weakPlayers,
    benchSize: 0,
  }));

  assert.equal(totalLineupScore(strong) > totalLineupScore(weak), true);
});

test("selectAiMatchSquad rejects a public assessment from a different fixture date", () => {
  const id = playerId("player:stale-assessment");
  const player = makePlayer(id, ["st"], 10);
  const staleAssessment = {
    ...publicAssessment(id, 18, 10, 13),
    assessedOn: gameDate(19_999),
  };

  assert.throws(
    () => selectAiMatchSquad(squadInput({
      formation: oneSlotFormation("striker"),
      playerIds: [id],
      players: { [id]: player },
      publicAssessments: { [id]: staleAssessment },
      benchSize: 0,
    })),
    (error) => error instanceof AiSquadSelectionError
      && error.code === "stale_public_assessment",
  );
});

function squadInput(input: {
  readonly formation?: Formation;
  readonly playerIds: readonly PlayerId[];
  readonly players: Readonly<Record<PlayerId, Player>>;
  readonly publicAssessments?: Readonly<Record<PlayerId, PublicPlayerAssessment>>;
  readonly benchSize?: number;
  readonly playerStates?: Parameters<typeof selectAiMatchSquad>[0]["playerStates"];
  readonly recentUse?: Parameters<typeof selectAiMatchSquad>[0]["recentUse"];
}): Parameters<typeof selectAiMatchSquad>[0] {
  return {
    clubId: clubId("club:ai"),
    ...(input.formation === undefined ? {} : { formation: input.formation }),
    playerIds: input.playerIds,
    players: input.players,
    publicAssessments:
      input.publicAssessments ?? publicAssessmentsForPlayers(input.players),
    currentDate: gameDate(20_000),
    roleWeights,
    ...(input.benchSize === undefined ? {} : { benchSize: input.benchSize }),
    ...(input.playerStates === undefined ? {} : { playerStates: input.playerStates }),
    ...(input.recentUse === undefined ? {} : { recentUse: input.recentUse }),
  };
}

/** Supplies safe public facts for selector tests that do not exercise upside. */
function publicAssessmentsForPlayers(
  players: Readonly<Record<PlayerId, Player>>,
): Readonly<Record<PlayerId, PublicPlayerAssessment>> {
  const assessments: Record<PlayerId, PublicPlayerAssessment> = {};
  for (const playerIdValue of Object.keys(players).sort() as PlayerId[]) {
    assessments[playerIdValue] = publicAssessment(playerIdValue, 24, 10, 10);
  }
  return assessments;
}

/** Builds one explicit dated assessment without consulting stored potential. */
function publicAssessment(
  id: PlayerId,
  age: number,
  currentAbility: number,
  upperAbility: number,
): PublicPlayerAssessment {
  return {
    playerId: id,
    assessedOn: gameDate(20_000),
    age,
    roleFamily: "outfield",
    currentAbility,
    p50Ability: currentAbility,
    upperAbility,
    currentRating: { stars: 3 },
    p50Rating: { stars: 3 },
    upperRating: { stars: 4 },
  };
}

/** Sums what the selected eleven is worth, for comparisons between squads. */
function totalLineupScore(selection: ReturnType<typeof selectAiMatchSquad>): number {
  return selection.reasons
    .filter((reason) => reason.selection === "lineup")
    .reduce((total, reason) => total + reason.score, 0);
}

/** Two defensive slots one versatile footballer is credible in. */
function rightSideDefenceFormation(): Formation {
  return {
    key: "4-4-2",
    slots: [
      {
        slotKey: "rb",
        line: "defensive_line",
        department: "defense",
        playerRole: "right_full_back",
        positionFamily: "right_full_back",
        side: "right",
      },
      {
        slotKey: "cb-right",
        line: "defensive_line",
        department: "defense",
        playerRole: "center_back",
        positionFamily: "center_back",
        side: "right_center",
      },
    ],
  };
}

function oneSlotFormation(role: Formation["slots"][number]["playerRole"]): Formation {
  return {
    key: "4-4-2",
    slots: [
      {
        slotKey: role,
        line: role === "striker" ? "forward_line" : "midfield_line",
        department: role === "striker" ? "attack" : "midfield",
        playerRole: role,
        positionFamily: role,
        side: "center",
      },
    ],
  };
}

/** Reproduces the world-21 overlap where one LWB is needed after the LB slot. */
function hallCounterexampleFormation(): Formation {
  return {
    key: "4-4-2",
    slots: [
      {
        slotKey: "lb",
        line: "defensive_line",
        department: "defense",
        playerRole: "left_full_back",
        positionFamily: "left_full_back",
        side: "left",
      },
      {
        slotKey: "cm-right",
        line: "midfield_line",
        department: "midfield",
        playerRole: "central_midfielder",
        positionFamily: "central_midfielder",
        side: "right_center",
      },
      {
        slotKey: "cm-left",
        line: "midfield_line",
        department: "midfield",
        playerRole: "central_midfielder",
        positionFamily: "central_midfielder",
        side: "left_center",
      },
      {
        slotKey: "lm",
        line: "midfield_line",
        department: "midfield",
        playerRole: "left_midfielder",
        positionFamily: "left_midfielder",
        side: "left",
      },
    ],
  };
}

function fullSquadIds(): readonly PlayerId[] {
  return [
    "gk-01",
    "gk-02",
    "rb-01",
    "cb-01",
    "cb-02",
    "lb-01",
    "rm-01",
    "cm-01",
    "cm-02",
    "lm-01",
    "st-01",
    "st-02",
    "cb-03",
    "fb-01",
    "cm-03",
    "am-01",
    "rw-01",
    "lw-01",
    "st-03",
    "dm-01",
  ].map((id) => playerId(`player:${id}`));
}

function fullSquadPlayers(): Readonly<Record<PlayerId, Player>> {
  const players: Record<PlayerId, Player> = {};
  const specs: ReadonlyArray<readonly [string, readonly PlayerPosition[], number]> = [
    ["gk-01", ["gk"], 11],
    ["gk-02", ["gk"], 8],
    ["rb-01", ["rb"], 10],
    ["cb-01", ["cb"], 10],
    ["cb-02", ["cb"], 10],
    ["lb-01", ["lb"], 10],
    ["rm-01", ["rw"], 10],
    ["cm-01", ["cm"], 10],
    ["cm-02", ["cm"], 10],
    ["lm-01", ["lw"], 10],
    ["st-01", ["st"], 10],
    ["st-02", ["st"], 10],
    ["cb-03", ["cb"], 8],
    ["fb-01", ["rb"], 8],
    ["cm-03", ["cm"], 8],
    ["am-01", ["am"], 9],
    ["rw-01", ["rw"], 8],
    ["lw-01", ["lw"], 8],
    ["st-03", ["st"], 8],
    ["dm-01", ["dm"], 8],
  ];

  for (const [id, positions, ability] of specs) {
    const idValue = playerId(`player:${id}`);
    players[idValue] = makePlayer(idValue, positions, ability);
  }

  return players;
}

const roleWeights: Readonly<Record<string, RoleWeightProfile>> = {
  gk: {
    roleKey: "gk",
    department: "goalkeeper",
    abilityWeights: {
      "goalkeeping.reflexes": 3,
      "goalkeeping.handling": 2,
      "goalkeeping.goalkeeperPositioning": 2,
    },
  },
  defender: {
    roleKey: "defender",
    department: "defense",
    abilityWeights: {
      "technical.tackling": 2,
      "mental.positioning": 2,
      "physical.heading": 1,
    },
  },
  midfielder: {
    roleKey: "midfielder",
    department: "midfield",
    abilityWeights: {
      "technical.passing": 2,
      "mental.vision": 2,
      "physical.stamina": 1,
    },
  },
  attacker: {
    roleKey: "attacker",
    department: "attack",
    abilityWeights: {
      "technical.finishing": 3,
      "mental.composure": 2,
      "physical.heading": 1,
    },
  },
};

function makePlayer(id: PlayerId, positions: readonly PlayerPosition[], ability: number): Player {
  const abilities = abilitySet(ability);

  return {
    id,
    firstName: "AI",
    lastName: String(id),
    birthDate: gameDate(14_000),
    naturalPositions: positions,
    abilities,
    potential: abilitySet(Math.min(20, ability + 2)),
  };
}

/** Gives one footballer real hands without touching the rest of him. */
function withGoalkeeping(player: Player, value: number): Player {
  const ability = abilityValue(value);

  return {
    ...player,
    abilities: {
      ...player.abilities,
      goalkeeping: { ...player.abilities.goalkeeping, reflexes: ability, handling: ability },
    },
  };
}

function playerState(fitness: number) {
  return {
    fitness: stateValue(fitness),
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
