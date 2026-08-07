import assert from "node:assert/strict";
import { test } from "vitest";

import { clubId, fixtureId, playerId, PLAYER_ROLES, type CareerState, type PlayerId } from "@game/domain";

import {
  buildTacticalAgencyAuditReport,
  isValidTacticalAgencyCheckpointWorkerCount,
  legacyPhase81ControlWeightReference,
  runTacticalAgencyOwnershipReplay,
  runTacticalAgencySelectionSeries,
  summarizeTacticalAgencyPrimaryRoles,
  summarizeTacticalAgencySelections,
  TACTICAL_AGENCY_AUDIT_CONTRACT_VERSION,
  TACTICAL_AGENCY_CHECKPOINT_WORKER_COUNT,
  TacticalAgencyAuditError,
  type TacticalAgencyLowBlockResult,
  type TacticalAgencyPopulationManifest,
  type TacticalAgencySelectionRow,
} from "./tactical-agency-audit.ts";

/**
 * These tests own the audit's arithmetic and its refusals. The traversal of a
 * real generated world belongs to the CLI command, because this package may not
 * import content and a hand-built career would not be the population the step
 * exists to measure.
 */

test("a tie at the top is what catalog order decides, and it is counted separately", () => {
  // The headline before-state number. A squad whose best two shapes score
  // exactly the same has no football reason to prefer either, so the selector's
  // strictly-greater walk hands it whichever `FORMATIONS` lists first. Reordering
  // the catalog can change the outcome for exactly these selections and no
  // others, which is why sensitivity is read here rather than by permuting.
  const summary = summarizeTacticalAgencySelections([
    selectionRow({ formationKey: "4-4-2", tiedAtBestCount: 4 }),
    selectionRow({ formationKey: "4-4-2", tiedAtBestCount: 1 }),
    selectionRow({ formationKey: "4-3-3", tiedAtBestCount: 1 }),
  ]);

  assert.equal(summary.selectionCount, 3);
  assert.equal(summary.tieDecidedShare, 1 / 3);
  assert.equal(summary.topFormationShare, 2 / 3);
  assert.equal(summary.distinctFormationCount, 2);
  assert.deepEqual(summary.formationShares.map((row) => row.formationKey), ["4-4-2", "4-3-3"]);
});

test("a squad with one fillable shape is a squad with no choice, not an obvious one", () => {
  // Two different findings that a single "the shape was never in doubt" number
  // would merge. One club is built for something; the other cannot field
  // anything else at all.
  const summary = summarizeTacticalAgencySelections([
    selectionRow({ fillableShapeCount: 1, tiedAtBestCount: 1 }),
    selectionRow({ fillableShapeCount: 12, tiedAtBestCount: 1 }),
  ]);

  assert.equal(summary.noChoiceShare, 0.5);
  assert.equal(summary.tieDecidedShare, 0);
});

test("the gap to the runner-up ignores selections that had no runner-up", () => {
  // A club with one fillable shape contributes no gap. Folding it in as zero
  // would read as "the shape barely won" when nothing ran against it.
  const summary = summarizeTacticalAgencySelections([
    selectionRow({ bestStructuralScore: 30, secondStructuralScore: 26 }),
    selectionRow({ bestStructuralScore: 30, fillableShapeCount: 1 }),
  ]);

  assert.equal(summary.meanBestMinusSecond, 4);
});

test("all ten primary roles are reported, including the ones nobody has", () => {
  // The finding this audit exists to record is which roles the generator never
  // produces. A row missing from the table reads as a row that was not measured.
  const summary = summarizeTacticalAgencyPrimaryRoles(
    careerStateWithRoles({ "player:a": "center_back", "player:b": "striker", "player:c": "striker" }),
    [playerId("player:a"), playerId("player:b"), playerId("player:c")],
  );

  assert.deepEqual(summary.roleShares.map((row) => row.role), [...PLAYER_ROLES]);
  assert.equal(summary.roleShares.length, 10);
  assert.equal(summary.playerCount, 3);
  assert.equal(summary.roleShares.find((row) => row.role === "striker")?.share, 2 / 3);
  assert.equal(summary.absentRoles.includes("attacking_midfielder"), true);
  assert.equal(summary.absentRoles.includes("striker"), false);
});

test("a footballer with no declared primary role is counted, never folded into one", () => {
  const summary = summarizeTacticalAgencyPrimaryRoles(
    careerStateWithRoles({ "player:a": "striker", "player:b": undefined }),
    [playerId("player:a"), playerId("player:b")],
  );

  assert.equal(summary.undeclaredRoleCount, 1);
  assert.equal(summary.playerCount, 2);
  assert.equal(summary.roleShares.find((row) => row.role === "striker")?.share, 1);
});

test("a checkpoint pins its worker count rather than capping it", () => {
  // Worker count never changes a number, but it changes the wall clock, and the
  // wall clock is what the next checkpoint is budgeted from. A run that quietly
  // dropped to one worker would report an honest result with a useless cost.
  assert.equal(TACTICAL_AGENCY_CHECKPOINT_WORKER_COUNT, 7);
  assert.equal(isValidTacticalAgencyCheckpointWorkerCount(7), true);
  assert.equal(isValidTacticalAgencyCheckpointWorkerCount(1), false);
  assert.equal(isValidTacticalAgencyCheckpointWorkerCount(8), false);
});

test("an empty population is refused rather than summarized into zeros", () => {
  assert.throws(
    () => summarizeTacticalAgencySelections([]),
    (error: unknown) => error instanceof TacticalAgencyAuditError && error.code === "empty_work_items",
  );
  assert.throws(
    () =>
      runTacticalAgencySelectionSeries(
        {
          careerState: careerStateWithRoles({}),
          workItems: [],
          policy: { roleWeights: {}, tacticalDistribution: neutralTactics() },
          matchTacticsCalibration: {} as never,
          valuationConfig: {} as never,
        },
        () => 0,
      ),
    (error: unknown) => error instanceof TacticalAgencyAuditError && error.code === "empty_work_items",
  );
});

test("the report carries what it was measured on, and what it cost", () => {
  const report = buildTacticalAgencyAuditReport({
    manifest: manifest(),
    selectionSeries: { rows: [selectionRow({})], elapsedMilliseconds: 500 },
    roles: summarizeTacticalAgencyPrimaryRoles(careerStateWithRoles({ "player:a": "striker" }), [
      playerId("player:a"),
    ]),
    lowBlock: lowBlockResult(),
  });

  assert.equal(report.contractVersion, TACTICAL_AGENCY_AUDIT_CONTRACT_VERSION);
  assert.equal(report.manifest.workerCount, 7);
  assert.equal(report.manifest.matchTacticsCalibrationVersion, "match-tactics-calibration-v1");
  assert.equal(report.selectionsPerSecond, 2);
  assert.deepEqual(JSON.parse(JSON.stringify(report)), report);
});

test("a block that concedes no less has no exchange rate, and does not report a free one", () => {
  // `0` here would read as "it cost nothing" and `Infinity` would not survive
  // being written to a file - `JSON.stringify` turns it into `null`. The block
  // bought nothing, so the ratio the Step 05 gate is written in is named.
  const nothingBought = lowBlockResult();

  assert.equal(nothingBought.ownLossPerConcededReduction, "no_reduction");
  assert.equal(nothingBought.concededExpectedGoalsReduction, 0);
});

/** One selection row with everything unset at a neutral, unremarkable value. */
function selectionRow(
  overrides: Partial<TacticalAgencySelectionRow>,
): TacticalAgencySelectionRow {
  return {
    clubId: clubId("club:home"),
    fixtureId: fixtureId("fixture:000001"),
    formationKey: "4-4-2",
    fillableShapeCount: 12,
    bestStructuralScore: 30,
    tiedAtBestCount: 1,
    outOfPositionSlotCount: 0,
    tactic: neutralTactics(),
    ...overrides,
  };
}

function neutralTactics(): TacticalAgencySelectionRow["tactic"] {
  return { directness: 0.5, pressing: 0.5, width: 0.5, risk: 0.5, mentality: "balanced" };
}

function manifest(): TacticalAgencyPopulationManifest {
  return {
    worldSeeds: ["agency-world-001"],
    lowBlockSeedPrefix: "agency-replay",
    matchTacticsCalibrationVersion: "match-tactics-calibration-v1",
    workerCount: 7,
    checkpointMode: true,
  };
}

/** A low block that gave up attacks and took nothing off the opponent. */
function lowBlockResult(): TacticalAgencyLowBlockResult {
  return {
    matchesPerArm: 2,
    neutral: { created: 1.4, conceded: 1.2, opportunities: 12.9 },
    lowBlock: { created: 1.1, conceded: 1.2, opportunities: 10 },
    concededExpectedGoalsReduction: 0,
    ownLossPerConcededReduction: "no_reduction",
  };
}

/**
 * The narrowest career state the role summary can read.
 *
 * Only `gameState.players[id].primaryRole` is touched, so building a whole
 * world here would be fixture that proves nothing. The traversal that needs a
 * real one is the CLI's.
 */
function careerStateWithRoles(
  rolesByPlayerId: Readonly<Record<string, TacticalAgencySelectionRow["formationKey"] | undefined>>,
): CareerState {
  const players: Record<PlayerId, { readonly primaryRole?: string }> = {};
  for (const [rawId, role] of Object.entries(rolesByPlayerId)) {
    players[playerId(rawId)] = role === undefined ? {} : { primaryRole: role };
  }

  return { gameState: { players } } as unknown as CareerState;
}

test("the migrated control magnitudes reproduce the old arithmetic on every reachable point", () => {
  // Checkpoint A's ownership replay. The intended form - same matches before and
  // after Step 01 - is unavailable: `controlWeight(...)` has no injection point,
  // so the old arm would need a legacy switch in the production engine or a
  // second minute loop, and both are refused. This is the declared fallback and
  // it is stronger for what it covers: the control term is a pure function of
  // four bounded intensities, so a dense sweep of that space beats any sample of
  // matches. `differingPoints` must be exactly zero; a single ulp is a failure.
  const replay = runTacticalAgencyOwnershipReplay({
    gridSteps: 24,
    controlBasisPointsByKnob: { directness: 800, pressing: 1_200, width: 300, risk: 400 },
    controlDirectionByKnob: {
      directness: "decrease",
      pressing: "increase",
      width: "increase",
      risk: "increase",
    },
  });

  assert.equal(replay.comparedPoints, 25 ** 4);
  assert.equal(replay.differingPoints, 0);
  assert.equal(replay.maximumAbsoluteDifference, 0);
});

test("the replay is a real gate: wrong magnitudes fail it", () => {
  // A sweep that cannot fail is not a proof. One basis point of drift on one
  // knob must be caught, or the whole ownership argument is decoration.
  const drifted = runTacticalAgencyOwnershipReplay({
    gridSteps: 8,
    controlBasisPointsByKnob: { directness: 800, pressing: 1_201, width: 300, risk: 400 },
    controlDirectionByKnob: {
      directness: "decrease",
      pressing: "increase",
      width: "increase",
      risk: "increase",
    },
  });
  const flipped = runTacticalAgencyOwnershipReplay({
    gridSteps: 8,
    controlBasisPointsByKnob: { directness: 800, pressing: 1_200, width: 300, risk: 400 },
    controlDirectionByKnob: {
      directness: "increase",
      pressing: "increase",
      width: "increase",
      risk: "increase",
    },
  });

  assert.equal(drifted.differingPoints > 0, true, "a one-basis-point drift must be caught");
  assert.equal(flipped.differingPoints > 0, true, "a flipped direction must be caught");
});

test("the legacy reference keeps the literals it exists to preserve", () => {
  // It may never read the new asset: an oracle calibrated from the thing it is
  // auditing proves nothing.
  assert.equal(legacyPhase81ControlWeightReference(neutralIntensity()), 1.055);
  assert.equal(
    legacyPhase81ControlWeightReference({ directness: 1, pressing: 0, width: 0, risk: 0 }),
    0.92,
  );
  assert.equal(
    legacyPhase81ControlWeightReference({ directness: 0, pressing: 1, width: 0, risk: 0 }),
    1.12,
  );
});

function neutralIntensity(): Parameters<typeof legacyPhase81ControlWeightReference>[0] {
  return { directness: 0.5, pressing: 0.5, width: 0.5, risk: 0.5 };
}
