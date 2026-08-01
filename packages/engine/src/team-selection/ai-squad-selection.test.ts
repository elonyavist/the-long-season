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

test("selectAiMatchSquad builds a valid XI and bench without duplicate players", () => {
  const input = squadInput({
    playerIds: fullSquadIds(),
    players: fullSquadPlayers(),
  });
  const selection = selectAiMatchSquad(input);
  const selectedIds = [...selection.lineup.map((slot) => slot.playerId), ...selection.benchPlayerIds];

  assert.equal(selection.lineup.length, 11);
  assert.equal(selection.benchPlayerIds.length, 8);
  assert.equal(new Set(selectedIds).size, selectedIds.length);
  assert.equal(selection.lineup[0]?.roleKey, "gk");
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

test("selectAiMatchSquad still rejects a roster with no complete usable assignment", () => {
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

  assert.throws(
    () => selectAiMatchSquad(squadInput({
      formation: hallCounterexampleFormation(),
      playerIds: [leftWingBackId, firstCentralMidfielderId, secondCentralMidfielderId, invalidCoverId],
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
      playerIds: fullSquadIds(),
      players: fullSquadPlayers(),
    }),
    tacticalDistribution: {
      directness: 0.5,
      pressing: 0.5,
      width: 0.5,
      risk: 0.5,
    },
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
    formation: input.formation ?? getFormation("4-4-2"),
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
