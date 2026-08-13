import assert from "node:assert/strict";
import { test } from "vitest";

import {
  clubId,
  fixtureId,
  playerId,
  PLAYER_ROLES,
  TACTICAL_SHAPE_TASKS,
  type CareerState,
  type PlayerId,
} from "@game/domain";

import {
  buildTacticalAgencyConditionedResponses,
  decideTacticalAgencyChanceToResultOwner,
  decideTacticalAgencyResultResolutionOwner,
  buildTacticalAgencyStructuralActions,
  buildTacticalAgencyAuditReport,
  countTacticalAgencyOutOfPositionSlots,
  isValidTacticalAgencyCheckpointWorkerCount,
  legacyPhase81ControlWeightReference,
  poolTacticalAgencyLowBlockResults,
  runTacticalAgencyOwnershipReplay,
  runTacticalAgencyConditionedAnalyticPartition,
  selectTacticalAgencyConditionedReplayContexts,
  runTacticalAgencySelectionSeries,
  runTacticalAgencyStructuralAnalyticPartition,
  summarizeTacticalContributionConservation,
  summarizeTacticalAgencyPrimaryRoles,
  summarizeTacticalAgencySelections,
  summarizeTacticalAgencySquadIdentities,
  summarizeTacticalAgencyStructuralAnalysis,
  summarizeTacticalAgencyConditionedAnalysis,
  summarizeTacticalAgencyConditionedMateriality,
  summarizeTacticalAgencyConditionedReplay,
  tacticalAgencyReorderInvariantShare,
  TACTICAL_AGENCY_AUDIT_CONTRACT_VERSION,
  TACTICAL_AGENCY_CHECKPOINT_WORKER_COUNT,
  TacticalAgencyAuditError,
  type TacticalAgencyLowBlockResult,
  type TacticalAgencyConditionedMaterialityContextResult,
  type TacticalAgencyConditionedReplayContextResult,
  type TacticalAgencyPopulationManifest,
  type TacticalAgencySelectionRow,
} from "./tactical-agency-audit.ts";
import { matchTacticsCalibrationFixture } from "../test-fixtures/match-tactics-calibration.ts";
import type { MatchEngineConfig, MatchTeamContext } from "@game/engine";

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

test("the shared out-of-position reader counts weak slots and ignores natural ones", () => {
  const natural = playerId("player:natural");
  const weak = playerId("player:weak");
  const careerState = {
    gameState: {
      players: {
        [natural]: { naturalPositions: ["cb"] },
        [weak]: { naturalPositions: ["st"] },
      },
    },
  } as unknown as CareerState;

  assert.equal(countTacticalAgencyOutOfPositionSlots({
    careerState,
    lineup: [
      { slotId: "slot:natural", playerId: natural, canonicalRole: "center_back", side: "center" },
      { slotId: "slot:weak", playerId: weak, canonicalRole: "center_back", side: "center" },
    ],
  }), 1);
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

test("the conservation diagnostic reports one exact budget and goalkeeper isolation", () => {
  const summary = summarizeTacticalContributionConservation(matchTacticsCalibrationFixture());

  assert.equal(summary.calibrationVersion, "match-tactics-simulation-tools-fixture");
  assert.equal(summary.rows.length, 12);
  for (const row of summary.rows) {
    assert.equal(row.budgetDeltaBasisPoints, 0, row.role);
    assert.equal(
      row.positiveTaskCount,
      row.role === "goalkeeper" ? 0 : TACTICAL_SHAPE_TASKS.length,
      row.role,
    );
  }
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

test("reorder invariance is the untied share, because a unique maximum cannot be reordered", () => {
  // `strongestCatalogShape(...)` keeps the first strict maximum. A unique
  // maximum wins under every catalog order; two tied shapes hand the decision
  // to whichever the catalog lists first, and reversing it picks the other.
  // So invariance is exactly the untied share - no second selection pass can
  // discover anything this does not already determine.
  assert.equal(tacticalAgencyReorderInvariantShare({ tieDecidedShare: 0 }), 1);
  assert.equal(tacticalAgencyReorderInvariantShare({ tieDecidedShare: 0.25 }), 0.75);
  assert.equal(tacticalAgencyReorderInvariantShare({ tieDecidedShare: 1 }), 0);
});

test("an identity no club drew is not_evaluated, and never clears the distinctness gate", () => {
  const summary = summarizeTacticalAgencySquadIdentities(
    [
      selectionRow({ formationKey: "4-4-2", squadIdentityKey: "alpha" }),
      selectionRow({ formationKey: "4-4-2", squadIdentityKey: "alpha" }),
      selectionRow({ formationKey: "4-2-4", squadIdentityKey: "beta" }),
    ],
    ["alpha", "beta", "gamma"],
  );

  assert.deepEqual(summary.unevaluatedIdentityKeys, ["gamma"]);
  assert.equal(summary.rows[2]?.modalFormationKey, "not_evaluated");
  // Two observed identities produced two shapes. `gamma` contributes nothing,
  // rather than contributing an absent row that could be read as a third.
  assert.equal(summary.distinctModalFormationCount, 2);
});

test("the modal shape is the most frequent one, and it carries its own count", () => {
  const summary = summarizeTacticalAgencySquadIdentities(
    [
      selectionRow({ formationKey: "4-4-2", squadIdentityKey: "alpha" }),
      selectionRow({ formationKey: "4-4-2", squadIdentityKey: "alpha" }),
      selectionRow({ formationKey: "3-5-2", squadIdentityKey: "alpha" }),
    ],
    ["alpha"],
  );

  assert.equal(summary.rows[0]?.modalFormationKey, "4-4-2");
  assert.equal(summary.rows[0]?.modalFormationCount, 2);
  assert.equal(summary.rows[0]?.selectionCount, 3);
});

test("selections with no identity are counted rather than dropped", () => {
  // A row silently discarded would shrink every denominator below it without
  // saying so, which is how a coverage table starts describing a population it
  // never measured.
  const summary = summarizeTacticalAgencySquadIdentities(
    [
      selectionRow({ squadIdentityKey: "alpha" }),
      selectionRow({}),
      selectionRow({ squadIdentityKey: "not-declared" }),
    ],
    ["alpha"],
  );

  assert.equal(summary.unattributedSelectionCount, 2);
  assert.equal(summary.rows[0]?.selectionCount, 1);
});

test("pooling low-block readings adds the goals instead of averaging the ratios", () => {
  // The failure this exists for. One world that saved almost nothing produces a
  // huge exchange rate on a tiny denominator. Averaging the ratios would let it
  // dominate a reading it contributed almost no football to; pooling gives each
  // world the weight of the expected goals it actually produced.
  const bulk = pooledArm({ neutralCreated: 100, neutralConceded: 100, blockCreated: 90, blockConceded: 80 });
  const sliver = pooledArm({ neutralCreated: 10, neutralConceded: 10, blockCreated: 1, blockConceded: 9.9 });

  const pooled = poolTacticalAgencyLowBlockResults([bulk, sliver]);

  // Pooled: own loss 19, conceded saved 20.1 -> 0.945. The mean of the two
  // ratios would be (0.5 + 90) / 2 = 45.25, which is the sliver's arithmetic
  // rather than the population's football.
  assert.equal(bulk.ownLossPerConcededReduction, 0.5);
  // Around `90`, and asserted as "enormous" rather than pinned: the exact float
  // is an artefact of the fixture's arithmetic, and this test is about the
  // weighting, not about rounding.
  assert.ok((sliver.ownLossPerConcededReduction as number) > 50);
  assert.ok(typeof pooled.ownLossPerConcededReduction === "number");
  assert.ok((pooled.ownLossPerConcededReduction as number) < 1);
  assert.equal(pooled.matchesPerArm, bulk.matchesPerArm + sliver.matchesPerArm);
});

test("pooled readings that saved nothing report no_reduction rather than a free block", () => {
  const pooled = poolTacticalAgencyLowBlockResults([
    pooledArm({ neutralCreated: 10, neutralConceded: 10, blockCreated: 5, blockConceded: 10 }),
  ]);

  assert.equal(pooled.ownLossPerConcededReduction, "no_reduction");
  assert.equal(pooled.concededExpectedGoalsReduction, 0);
});

function pooledArm(input: {
  readonly neutralCreated: number;
  readonly neutralConceded: number;
  readonly blockCreated: number;
  readonly blockConceded: number;
}): TacticalAgencyLowBlockResult {
  const concededSaved = input.neutralConceded - input.blockConceded;
  const ownLoss = Math.max(0, input.neutralCreated - input.blockCreated);

  return {
    matchesPerArm: 80,
    neutral: { created: input.neutralCreated, conceded: input.neutralConceded, opportunities: 0 },
    lowBlock: { created: input.blockCreated, conceded: input.blockConceded, opportunities: 0 },
    concededExpectedGoalsReduction:
      input.neutralConceded === 0 ? 0 : concededSaved / input.neutralConceded,
    ownLossPerConcededReduction: concededSaved <= 0 ? "no_reduction" : ownLoss / concededSaved,
  };
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

test("Checkpoint B enumerates the declared complete space and conserves every route budget", () => {
  const calibration = matchTacticsCalibrationFixture();
  const actions = buildTacticalAgencyStructuralActions({
    referenceBand: {
      bandKey: "checkpoint_b_uniform",
      goalkeeper: 10,
      defense: 10,
      midfield: 10,
      attack: 10,
    },
    matchTacticsCalibration: calibration,
  });
  assert.equal(actions.length, 23 * 3 * 3);
  assert.equal(new Set(actions.map((action) => action.actionId)).size, actions.length);
  assert.deepEqual(new Set(actions.map((action) => action.tacticKey)), new Set([
    "high_pressing",
    "direct_play",
    "low_block",
  ]));
  assert.deepEqual(new Set(actions.map((action) => action.lateralFocus)), new Set([
    "balanced",
    "left",
    "right",
  ]));

  const engineConfig = {
    tacticalDistributionCaps: {
      directness: { minInclusive: 0, maxInclusive: 1 },
      pressing: { minInclusive: 0, maxInclusive: 1 },
      width: { minInclusive: 0, maxInclusive: 1 },
      risk: { minInclusive: 0, maxInclusive: 1 },
    },
  } as MatchEngineConfig;
  const contexts = runTacticalAgencyStructuralAnalyticPartition({
    actions,
    opponentIndexes: actions.map((_, index) => index),
    engineConfig,
    matchTacticsCalibration: calibration,
  });
  const analysis = summarizeTacticalAgencyStructuralAnalysis({ actions, contexts });

  for (let first = 0; first < actions.length; first += 1) {
    for (let second = 0; second < actions.length; second += 1) {
      assert.equal(
        (contexts[second]?.candidates[first]?.payoffBasisPoints ?? 0)
          + (contexts[first]?.candidates[second]?.payoffBasisPoints ?? 0),
        10_000,
        "swapping the two complete actions must complement the analytic share",
      );
    }
  }

  assert.equal(analysis.rawActionCount, 207);
  assert.equal(analysis.conservationMismatchCount, 0);
  assert.equal(analysis.effectiveSignatureCount > 0, true);
  assert.equal(analysis.effectiveSignatureCount <= analysis.rawActionCount, true);
  assert.equal(Number.isFinite(analysis.bestResponseUbiquityMultiple), true);
});

test("Checkpoint B2 fixes real shapes, enumerates nine responses and mirrors exactly", () => {
  const calibration = matchTacticsCalibrationFixture();
  const structural = buildTacticalAgencyStructuralActions({
    referenceBand: {
      bandKey: "checkpoint_b2_uniform",
      goalkeeper: 10,
      defense: 10,
      midfield: 10,
      attack: 10,
    },
    matchTacticsCalibration: calibration,
  });
  const first = structural.find(({ formationKey }) => formationKey === "4-4-2");
  const second = structural.find(({ formationKey }) => formationKey === "3-5-2");
  if (first === undefined || second === undefined) {
    throw new Error("The B2 test requires both catalog formations");
  }
  const responses = buildTacticalAgencyConditionedResponses();
  const matchups = [
    {
      matchupId: "fixture:test|home",
      ownShape: first.shape,
      opponentShape: second.shape,
    },
    {
      matchupId: "fixture:test|away",
      ownShape: second.shape,
      opponentShape: first.shape,
    },
  ];
  const engineConfig = {
    tacticalDistributionCaps: {
      directness: { minInclusive: 0, maxInclusive: 1 },
      pressing: { minInclusive: 0, maxInclusive: 1 },
      width: { minInclusive: 0, maxInclusive: 1 },
      risk: { minInclusive: 0, maxInclusive: 1 },
    },
  } as MatchEngineConfig;
  const contexts = runTacticalAgencyConditionedAnalyticPartition({
    responses,
    matchups,
    contextIndexes: Array.from({ length: matchups.length * responses.length }, (_, index) => index),
    engineConfig,
    matchTacticsCalibration: calibration,
  });
  const analysis = summarizeTacticalAgencyConditionedAnalysis({ responses, contexts });

  assert.equal(responses.length, 9);
  assert.equal(contexts.length, 18);
  assert.equal(analysis.rawResponseCount, 9);
  assert.equal(analysis.matchupCount, 2);
  assert.equal(analysis.declaredContextCount, 18);
  assert.equal(analysis.conservationMismatchCount, 0);
  assert.equal(analysis.mirrorMismatchCount, 0);
  assert.equal(
    analysis.bestResponseUbiquityMultiple,
    analysis.maximumResponseContextCount * analysis.effectiveSignatureCount / contexts.length,
  );

  assert.throws(
    () => summarizeTacticalAgencyConditionedAnalysis({
      responses,
      contexts: contexts.map((context, index) => index === 1
        ? { ...context, opponentResponseIndex: 0 }
        : context),
    }),
    /does not contain each opponent response exactly once/,
  );
});

test("B2 replay sampling covers every response stratum and preserves population weights", () => {
  const calibration = matchTacticsCalibrationFixture();
  const structural = buildTacticalAgencyStructuralActions({
    referenceBand: {
      bandKey: "checkpoint_b2_replay",
      goalkeeper: 10,
      defense: 10,
      midfield: 10,
      attack: 10,
    },
    matchTacticsCalibration: calibration,
  });
  const first = structural.find(({ formationKey }) => formationKey === "4-4-2");
  const second = structural.find(({ formationKey }) => formationKey === "3-5-2");
  if (first === undefined || second === undefined) throw new Error("B2 replay shapes are missing");
  const responses = buildTacticalAgencyConditionedResponses();
  const matchups = [
    { matchupId: "replay|home", ownShape: first.shape, opponentShape: second.shape },
    { matchupId: "replay|away", ownShape: second.shape, opponentShape: first.shape },
  ];
  const engineConfig = {
    tacticalDistributionCaps: {
      directness: { minInclusive: 0, maxInclusive: 1 },
      pressing: { minInclusive: 0, maxInclusive: 1 },
      width: { minInclusive: 0, maxInclusive: 1 },
      risk: { minInclusive: 0, maxInclusive: 1 },
    },
  } as MatchEngineConfig;
  const contexts = runTacticalAgencyConditionedAnalyticPartition({
    responses,
    matchups,
    contextIndexes: Array.from({ length: matchups.length * responses.length }, (_, index) => index),
    engineConfig,
    matchTacticsCalibration: calibration,
  });
  const team = {} as MatchTeamContext;
  const replayMatchups = matchups.map((matchup, index) => ({
    ...matchup,
    reciprocalMatchupId: matchups[index === 0 ? 1 : 0]?.matchupId ?? "missing",
    own: team,
    opponent: team,
  }));
  const selected = selectTacticalAgencyConditionedReplayContexts({
    responses,
    contexts,
    matchups: replayMatchups,
    maximumContextCount: 32,
  });
  const repeated = selectTacticalAgencyConditionedReplayContexts({
    responses,
    contexts: [...contexts].reverse(),
    matchups: [...replayMatchups].reverse(),
    maximumContextCount: 32,
  });

  assert.equal(selected.length, 18);
  assert.equal(new Set(selected.map(({ opponentResponseId }) => opponentResponseId)).size, 9);
  assert.equal(selected.reduce((sum, row) => sum + row.populationWeightCount, 0), contexts.length);
  assert.deepEqual(
    selected.map(({ contextId }) => contextId),
    repeated.map(({ contextId }) => contextId),
  );
});

test("B2 replay decision is reachable in both directions without moving its targets", () => {
  const go = summarizeTacticalAgencyConditionedReplay({
    declaredContextCount: 1,
    contexts: [replayResult({ ceiling: 0.08, exposure: -0.08, contextFree: 0 })],
  });
  const refine = summarizeTacticalAgencyConditionedReplay({
    declaredContextCount: 1,
    contexts: [replayResult({ ceiling: 0.02, exposure: -0.08, contextFree: 0 })],
  });

  assert.equal(go.decision, "GO");
  assert.equal(refine.decision, "REFINE");
  assert.equal(go.counterMoveCeiling.value, 0.08);
  assert.equal(go.counterMoveExposure.value, -0.08);
  assert.deepEqual(go.contextFreeDelta.interval95, [0, 0]);
});

test("B2 materiality attribution uses only the frozen replay targets", () => {
  const minuteEffect = summarizeTacticalAgencyConditionedMateriality({
    declaredContextCount: 1,
    contexts: [materialityResult({ optimisticCeiling: 0.044, optimisticExposure: -0.044 })],
  });
  const asymmetric = summarizeTacticalAgencyConditionedMateriality({
    declaredContextCount: 1,
    contexts: [materialityResult({ optimisticCeiling: 0.045, optimisticExposure: -0.044 })],
  });
  const selection = summarizeTacticalAgencyConditionedMateriality({
    declaredContextCount: 1,
    contexts: [materialityResult({ optimisticCeiling: 0.045, optimisticExposure: -0.045 })],
  });

  assert.equal(minuteEffect.owner, "minute_effect_materiality");
  assert.equal(asymmetric.owner, "asymmetric_materiality");
  assert.equal(selection.owner, "selection_power");
  assert.equal(selection.acceptedReplay.decision, "REFINE");
  assert.ok(Math.abs(selection.selectionRegret - 0.035) < Number.EPSILON);
  assert.ok(Math.abs(selection.exposureRegret - 0.035) < Number.EPSILON);
});

test("chance-to-result attribution applies both sides of its fixed classifier", () => {
  const xgOwned = summarizeTacticalAgencyConditionedMateriality({
    declaredContextCount: 11,
    contexts: [
      materialityAttributionResult("aligned", 10),
      materialityAttributionResult("weak", 1),
    ],
  }).chanceToResult;
  const resultOwned = summarizeTacticalAgencyConditionedMateriality({
    declaredContextCount: 11,
    contexts: [
      materialityAttributionResult("aligned", 1),
      materialityAttributionResult("weak", 10),
    ],
  }).chanceToResult;

  assert.equal(xgOwned.owner, "opportunity_xg_magnitude");
  assert.equal(resultOwned.owner, "result_resolution");
  assert.equal(xgOwned.classifierReachabilityHeld, true);
  assert.equal(resultOwned.classifierReachabilityHeld, true);
  assert.deepEqual(xgOwned.resolutionContextCounts, { atOrAboveHalf: 1, belowHalf: 1 });
  assert.equal(xgOwned.pooledRSquared !== "not_observed" && xgOwned.pooledRSquared >= 0.5, true);
  assert.equal(
    resultOwned.pooledRSquared !== "not_observed" && resultOwned.pooledRSquared < 0.5,
    true,
  );
  assert.deepEqual(
    decideTacticalAgencyChanceToResultOwner([xgOwned, resultOwned]),
    { owner: "mixed", held: false },
  );
  assert.deepEqual(
    decideTacticalAgencyChanceToResultOwner([xgOwned, xgOwned]),
    { owner: "opportunity_xg_magnitude", held: true },
  );
  const shotConversion = {
    ...xgOwned.resolutionDecomposition,
    owner: "shot_conversion" as const,
    classifierReachabilityHeld: true,
  };
  const scorelineMapping = {
    ...xgOwned.resolutionDecomposition,
    owner: "scoreline_mapping" as const,
    classifierReachabilityHeld: true,
  };
  assert.deepEqual(
    decideTacticalAgencyResultResolutionOwner([shotConversion, shotConversion]),
    { owner: "shot_conversion", held: true },
  );
  assert.deepEqual(
    decideTacticalAgencyResultResolutionOwner([shotConversion, scorelineMapping]),
    { owner: "mixed", held: false },
  );
});

function materialityResult(input: {
  readonly optimisticCeiling: number;
  readonly optimisticExposure: number;
}): TacticalAgencyConditionedMaterialityContextResult {
  return {
    ...replayResult({ ceiling: 0.01, exposure: -0.01, contextFree: 0 }),
    replayWinShares: [
      { responseId: "high_pressing|left", winShare: 0.5 + input.optimisticCeiling },
      { responseId: "low_block|right", winShare: 0.5 + input.optimisticExposure },
    ],
    replayChannelMeans: [
      {
        responseId: "high_pressing|left",
        opportunityDifferential: 1,
        expectedGoalsDifferential: 0.2,
        expectedGoalsTotal: 2.4,
        goalDifferential: 0.1,
        goalTotal: 2,
      },
      {
        responseId: "low_block|right",
        opportunityDifferential: -1,
        expectedGoalsDifferential: -0.2,
        expectedGoalsTotal: 2,
        goalDifferential: -0.1,
        goalTotal: 1.8,
      },
    ],
    contextFreeChannelMean: {
      opportunityDifferential: 0,
      expectedGoalsDifferential: 0,
      expectedGoalsTotal: 2.2,
      goalDifferential: 0,
      goalTotal: 1.9,
    },
    optimisticBestResponseId: "high_pressing|left",
    optimisticExposedResponseId: "low_block|right",
    optimisticCounterMoveDeltas: [input.optimisticCeiling, input.optimisticCeiling],
    optimisticExposureDeltas: [input.optimisticExposure, input.optimisticExposure],
  };
}

function materialityAttributionResult(
  kind: "aligned" | "weak",
  populationWeightCount: number,
): TacticalAgencyConditionedMaterialityContextResult {
  const responseIds = [
    "direct_play|balanced",
    "high_pressing|left",
    "low_block|right",
  ] as const;
  const winShares = kind === "aligned" ? [0.4, 0.5, 0.6] : [0.4, 0.6, 0.5];
  const base = materialityResult({ optimisticCeiling: 0.02, optimisticExposure: -0.02 });
  return {
    ...base,
    populationWeightCount,
    replayWinShares: responseIds.map((responseId, index) => ({
      responseId,
      winShare: winShares[index] as number,
    })),
    replayChannelMeans: responseIds.map((responseId, index) => ({
      responseId,
      opportunityDifferential: index - 1,
      expectedGoalsDifferential: index - 1,
      expectedGoalsTotal: 2 + index * 0.2,
      goalDifferential: (winShares[index] as number) * 2 - 1,
      goalTotal: 2 + index * 0.1,
    })),
  };
}

function replayResult(input: {
  readonly ceiling: number;
  readonly exposure: number;
  readonly contextFree: number;
}): TacticalAgencyConditionedReplayContextResult {
  return {
    contextIndex: 0,
    contextId: "context:replay",
    opponentResponseId: "direct_play|balanced",
    populationWeightCount: 1,
    bestResponseId: "high_pressing|left",
    exposedResponseId: "low_block|right",
    selectionWinShares: [
      { responseId: "high_pressing|left", winShare: 0.6 },
      { responseId: "low_block|right", winShare: 0.4 },
    ],
    bestReplayWinShare: 0.5 + input.contextFree + input.ceiling,
    exposedReplayWinShare: 0.5 + input.contextFree + input.exposure,
    contextFreeReplayWinShare: 0.5 + input.contextFree,
    counterMoveDeltas: [input.ceiling, input.ceiling],
    exposureDeltas: [input.exposure, input.exposure],
    contextFreeDeltas: [input.contextFree, input.contextFree],
  };
}

function neutralIntensity(): Parameters<typeof legacyPhase81ControlWeightReference>[0] {
  return { directness: 0.5, pressing: 0.5, width: 0.5, risk: 0.5 };
}
