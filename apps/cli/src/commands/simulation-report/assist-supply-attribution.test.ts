import assert from "node:assert/strict";
import { test } from "vitest";

import {
  assistGoalKind,
  evaluateDeadBallAttributionCheckpoint,
  evaluateDirectFreeKickGeometryCheckpoint,
  evaluateDirectFreeKickPathCheckpoint,
  evaluatePenaltyAwardRetryCheckpoint,
  evaluateAssistEligibilityCheckpoint,
  evaluateAssistSupplyCheckpoint,
  type AssistSupplyWorldFacts,
} from "./assist-supply-attribution.ts";

test("durable goal shapes classify into one total vocabulary", () => {
  assert.equal(assistGoalKind(goal()), "penalty");
  assert.equal(assistGoalKind(goal({ deadBallKind: "direct_free_kick" })), "direct_free_kick");
  assert.equal(assistGoalKind(goal({ route: "central" })), "self_created");
  assert.equal(assistGoalKind(goal({ route: "central", creatorPlayerId: "player:creator" })), "distinct_uncredited");
  assert.equal(assistGoalKind(goal({ route: "central", assistPlayerId: "player:assist" })), "credited_assist");
  assert.throws(() => assistGoalKind(goal({
    route: "central",
    creatorPlayerId: "player:creator",
    assistPlayerId: "player:assist",
  })));
});

test("same-population ceiling assigns probability only when distinct creators suffice", () => {
  assert.equal(evaluateAssistSupplyCheckpoint([
    world({ penalty: 5, self_created: 20, distinct_uncredited: 30, credited_assist: 45 }),
  ], "competition:ita-1").decision, "assist_credit_probability");
  assert.equal(evaluateAssistSupplyCheckpoint([
    world({ penalty: 5, self_created: 45, distinct_uncredited: 5, credited_assist: 45 }),
  ], "competition:ita-1").decision, "creator_shooter_overlap");
});

test("reachability and reconciliation fail closed", () => {
  const missingPenalty = world({ penalty: 0, self_created: 10, distinct_uncredited: 20, credited_assist: 70 });
  assert.equal(evaluateAssistSupplyCheckpoint([missingPenalty], "competition:ita-1").decision, "STOP_RETHINK");
  const broken = world({ penalty: 5, self_created: 10, distinct_uncredited: 20, credited_assist: 65 }, 1);
  assert.equal(evaluateAssistSupplyCheckpoint([broken], "competition:ita-1").decision, "STOP_RETHINK");
});

test("eligibility checkpoint separates a healthy ordinary share from low dead-ball supply", () => {
  const result = evaluateAssistEligibilityCheckpoint([
    world({ penalty: 5, self_created: 15, distinct_uncredited: 10, credited_assist: 70 }),
  ], "competition:ita-1");

  assert.equal(result.decision, "GO");
  assert.equal(result.residualOwner, "dead_ball_supply");
  assert.equal(result.nonSetPieceGoalCount, 95);
  assert.equal(result.nonSetPieceTargetHeld, true);
  assert.equal(result.allGoalTargetHeld, false);
});

test("eligibility checkpoint reopens semantics when the ordinary share misses", () => {
  const result = evaluateAssistEligibilityCheckpoint([
    world({ penalty: 10, self_created: 35, distinct_uncredited: 5, credited_assist: 50 }),
  ], "competition:ita-1");

  assert.equal(result.decision, "REFINE");
  assert.equal(result.residualOwner, "unresolved");
});

test("eligibility checkpoint fails closed on a residual its truth table cannot assign", () => {
  const result = evaluateAssistEligibilityCheckpoint([
    world({ penalty: 20, self_created: 10, distinct_uncredited: 10, credited_assist: 60 }),
  ], "competition:ita-1");

  assert.equal(result.nonSetPieceTargetHeld, true);
  assert.equal(result.allGoalTargetHeld, false);
  assert.equal(result.decision, "STOP_RETHINK");
  assert.equal(result.residualOwner, "unresolved");
});

test("dead-ball attribution keeps a healthy penalty lane separate from the missing free-kick path", () => {
  const result = evaluateDeadBallAttributionCheckpoint([
    world(
      { penalty: 19, self_created: 10, distinct_uncredited: 10, credited_assist: 60 },
      0,
      { fixtureCount: 100, scored: 19, saved: 4, missed: 3 },
    ),
  ], "competition:ita-1");

  assert.equal(result.decision, "OWNER_IDENTIFIED");
  assert.deepEqual(result.owners, ["direct_free_kick_path"]);
  assert.equal(result.penaltyAwardedCount, 26);
});

test("dead-ball attribution can identify both independent penalty owners", () => {
  const result = evaluateDeadBallAttributionCheckpoint([
    world(
      { penalty: 9, self_created: 10, distinct_uncredited: 10, credited_assist: 60 },
      0,
      { fixtureCount: 100, scored: 9, saved: 4, missed: 2 },
    ),
  ], "competition:ita-1");

  assert.equal(result.decision, "OWNER_IDENTIFIED");
  assert.deepEqual(result.owners, [
    "penalty_award_frequency",
    "penalty_conversion",
    "direct_free_kick_path",
  ]);
});

test("dead-ball attribution requires every penalty outcome and reconciliation", () => {
  const result = evaluateDeadBallAttributionCheckpoint([
    world(
      { penalty: 19, self_created: 10, distinct_uncredited: 10, credited_assist: 60 },
      0,
      { fixtureCount: 100, scored: 19, saved: 7, missed: 0 },
    ),
  ], "competition:ita-1");

  assert.equal(result.decision, "STOP_RETHINK");
});

test("penalty retry accepts frequency only with conversion, assists, and version intact", () => {
  const current = world(
    { penalty: 19, self_created: 10, distinct_uncredited: 13, credited_assist: 70 },
    0,
    { fixtureCount: 100, scored: 19, saved: 4, missed: 3 },
  );
  assert.equal(evaluatePenaltyAwardRetryCheckpoint(
    [current],
    "competition:ita-1",
    ["match-discipline-calibration-v1"],
    "match-discipline-calibration-v1",
  ).decision, "GO");
  assert.equal(evaluatePenaltyAwardRetryCheckpoint(
    [current],
    "competition:ita-1",
    ["wrong"],
    "match-discipline-calibration-v1",
  ).decision, "STOP_RETHINK");
});

test("direct-free-kick geometry selects on seven worlds and holds on seven unseen worlds", () => {
  const calibration = Array.from({ length: 7 }, (_, index) => world(
    { penalty: 19, self_created: 10, distinct_uncredited: 13, credited_assist: 70 },
    0,
    { fixtureCount: 100, scored: 19, saved: 4, missed: 3 },
    geometryCounts(115),
    `world:calibration-${index}`,
  ));
  const validation = Array.from({ length: 7 }, (_, index) => world(
    { penalty: 19, self_created: 10, distinct_uncredited: 13, credited_assist: 70 },
    0,
    { fixtureCount: 100, scored: 19, saved: 4, missed: 3 },
    geometryCounts(118),
    `world:validation-${index}`,
  ));

  const result = evaluateDirectFreeKickGeometryCheckpoint(
    [...calibration, ...validation],
    "competition:ita-1",
  );

  assert.equal(result.decision, "GO", JSON.stringify(result));
  assert.equal(result.selectedMinimumZoneDangerBasisPoints, 7000);
  assert.equal(result.calibrationAttemptsPerMatch, 1.15);
  assert.equal(result.validationAttemptsPerMatch, 1.18);
});

test("direct-free-kick geometry fails closed when nested candidate facts disagree", () => {
  const broken = geometryCounts(115).map((row, index) =>
    index === 10 ? { ...row, eligibleFoulCount: 200 } : row
  );
  const worlds = Array.from({ length: 14 }, (_, index) => world(
    { penalty: 19, self_created: 10, distinct_uncredited: 13, credited_assist: 70 },
    0,
    { fixtureCount: 100, scored: 19, saved: 4, missed: 3 },
    index === 0 ? broken : geometryCounts(115),
    `world:${index}`,
  ));

  assert.equal(
    evaluateDirectFreeKickGeometryCheckpoint(worlds, "competition:ita-1").decision,
    "STOP_RETHINK",
  );
});

test("direct-free-kick path holds frequency, conversion, goals, penalties, assists, and version together", () => {
  const worlds = Array.from({ length: 7 }, (_, index) => worldWithDirectFreeKicks(index));
  const result = evaluateDirectFreeKickPathCheckpoint(
    worlds,
    "competition:ita-1",
    worlds.map(() => "match-discipline-calibration-v2"),
    "match-discipline-calibration-v2",
  );

  assert.equal(result.decision, "GO");
  assert.deepEqual(result.refinementOwners, []);
  assert.deepEqual(result.reachedDirectFreeKickOutcomes, ["scored", "saved", "missed"]);
});

function world(
  counts: { readonly penalty: number; readonly self_created: number; readonly distinct_uncredited: number; readonly credited_assist: number },
  reconciliationFailureCount = 0,
  penalty: {
    readonly fixtureCount: number;
    readonly scored: number;
    readonly saved: number;
    readonly missed: number;
  } = { fixtureCount: 100, scored: counts.penalty, saved: 2, missed: 1 },
  directFreeKickCandidateCounts = geometryCounts(115),
  worldSeed = "world:test",
): AssistSupplyWorldFacts {
  return {
    worldSeed,
    seasons: [{
      competitionId: "competition:ita-1",
      seasonNumber: 1,
      fixtureCount: penalty.fixtureCount,
      counts: { ...counts, direct_free_kick: 0 },
      countsByChanceAndShot: {},
      penaltyAwardedCount: penalty.scored + penalty.saved + penalty.missed,
      penaltyOutcomeCounts: {
        scored: penalty.scored,
        saved: penalty.saved,
        missed: penalty.missed,
      },
      directFreeKickOutcomeCounts: { scored: 0, saved: 0, missed: 0 },
      foulCount: 500,
      penaltyAssociatedFoulCount: penalty.scored + penalty.saved + penalty.missed,
      directFreeKickCandidateCounts,
      reconciliationFailureCount,
    }],
  };
}

function geometryCounts(at7000: number) {
  const counts = [300, 275, 250, 225, 200, 175, 150, 130, at7000, 90, 70, 50, 30, 10];
  return [5000, 5250, 5500, 5750, 6000, 6250, 6500, 6750, 7000, 7250, 7500, 7750, 8000, 8250]
    .map((minimumZoneDangerBasisPoints, index) => ({
      minimumZoneDangerBasisPoints,
      eligibleFoulCount: counts[index] ?? 0,
    }));
}

function worldWithDirectFreeKicks(index: number): AssistSupplyWorldFacts {
  const base = world(
    { penalty: 19, self_created: 10, distinct_uncredited: 13, credited_assist: 70 },
    0,
    { fixtureCount: 100, scored: 19, saved: 4, missed: 3 },
    geometryCounts(115),
    `world:direct-${index}`,
  );
  const season = base.seasons[0];
  if (season === undefined) throw new Error("test world omitted its season");
  return {
    ...base,
    seasons: [{
      ...season,
      counts: { ...season.counts, direct_free_kick: 7 },
      directFreeKickOutcomeCounts: { scored: 7, saved: 60, missed: 48 },
    }],
  };
}

function goal(input: {
  readonly route?: "central";
  readonly deadBallKind?: "direct_free_kick";
  readonly creatorPlayerId?: string;
  readonly assistPlayerId?: string;
} = {}) {
  return {
    type: "goal",
    shot: {
      minute: 10,
      side: "home",
      quality: 0.5,
      isShotOnTarget: true,
      shotType: "normal",
      chanceType: "clear",
      ...(input.route === undefined ? {} : { route: input.route }),
      ...(input.deadBallKind === undefined ? {} : { deadBallKind: input.deadBallKind }),
    },
    scorerPlayerId: "player:scorer",
    ...(input.creatorPlayerId === undefined ? {} : { creatorPlayerId: input.creatorPlayerId }),
    ...(input.assistPlayerId === undefined ? {} : { assistPlayerId: input.assistPlayerId }),
  } as never;
}
