import {
  buildTacticalAgencyConditionedResponses,
  buildTacticalAgencyStructuralActions,
  buildTacticalAgencyAuditReport,
  decideTacticalAgencyChanceToResultOwner,
  decideTacticalAgencyResultResolutionOwner,
  decideTacticalAgencyConditionedOwner,
  firstCoherentTacticalAgencyComponent,
  poolTacticalAgencyLowBlockResults,
  runTacticalAgencyLowBlockSeries,
  selectTacticalAgencyConditionedReplayContexts,
  summarizeTacticalAgencyConditionedAnalysis,
  summarizeTacticalAgencyConditionedReplay,
  summarizeTacticalAgencyConditionedMateriality,
  summarizeTacticalAgencyConditionedAttribution,
  summarizeTacticalAgencyStructuralAnalysis,
  type TacticalAgencyAuditReport,
  type TacticalAgencyConditionedAnalysis,
  type TacticalAgencyB21TacticalAttribution,
  type TacticalAgencyB21TacticalOwner,
  type TacticalAgencyB21ComponentKey,
  type TacticalAgencyConditionedAttributionMatchup,
  type TacticalAgencyConditionedContextRow,
  type TacticalAgencyConditionedReplayMatchupInput,
  type TacticalAgencyConditionedReplaySummary,
  type TacticalAgencyConditionedMaterialityOwner,
  type TacticalAgencyConditionedMaterialitySummary,
  type TacticalAgencyChanceToResultOwner,
  type TacticalAgencyResultResolutionOwner,
  type TacticalAgencyRoleSummary,
  type TacticalAgencySelectionRow,
  type TacticalAgencyStructuralAnalysis,
  type TacticalAgencyStructuralContextRow,
  type TacticalShapeInvariantResult,
} from "@game/simulation-tools";

import { createFakeDomesticWorld, GENERATED_SQUAD_IDENTITY_KEYS } from "@game/content";

import {
  buildTacticalAgencyLowBlockInput,
  PRE_PHASE_81A_SQUAD_SKELETON,
  runTacticalAgencyArchetypeCounterfactual,
  runTacticalAgencyConditionedWorld,
  runTacticalAgencyWorld,
  runTacticalAgencyWorldInWorker,
  type TacticalAgencyConditionedPopulationRow,
  type TacticalAgencyConditionedClubSelection,
  type TacticalAgencySquadChart,
  type TacticalAgencyWorldResult,
} from "./tactical-agency-world.ts";
import {
  counterfactualMovesShape,
  decideCheckpointA2,
  evaluateCheckpointA2Set,
  type CheckpointA21Arm,
  type CheckpointA21Attribution,
  type CheckpointA21Facts,
  type CheckpointA2Facts,
  type CheckpointA2SetEvaluation,
} from "./tactical-agency-checkpoint-a2.ts";
import {
  summarizeTacticalAgencyB21FormationAttribution,
  summarizeTacticalAgencyB21IdentityFamily,
  type TacticalAgencyB21FormationAttribution,
} from "./tactical-agency-b2-attribution.ts";
import {
  createTacticalShapeSectionFacts,
  measureTacticalShapeQualityBands,
} from "./tactical-shape-section.ts";
import {
  runTacticalAgencyConditionedReplayWorker,
  runTacticalAgencyConditionedMaterialityWorker,
  runTacticalAgencyConditionedWorker,
  runTacticalAgencyStructuralWorker,
} from "./tactical-agency-structural-worker.ts";
import {
  evaluateLeagueDiversityOpeningGate,
  type LeagueDiversityOpeningGateVerdict,
} from "./league-diversity-gate.ts";

/**
 * Phase 81A Step 02 before-state command.
 *
 * A reporting path only: it generates worlds, runs the production career
 * selector over them, and writes down what happened. It changes no gameplay and
 * simulates nothing the engine would not have simulated anyway.
 *
 * @example
 * await createTacticalAgencyA2ProfileFacts(input);
 */

/** Default world seed prefix. Every world seed is this plus an index. */
export const DEFAULT_TACTICAL_AGENCY_WORLD_SEED = "phase81a-agency-before-state";

/** Default seed prefix for the low-block replay, disjoint from the world seeds. */
export const DEFAULT_TACTICAL_AGENCY_SEED_PREFIX = "phase81a-agency-replay";

/** Default worlds measured. */
export const DEFAULT_TACTICAL_AGENCY_WORLD_COUNT = 7;

/** Default rounds of the observed competition selected for, per world. */
export const DEFAULT_TACTICAL_AGENCY_ROUND_COUNT = 4;

/** Default paired seeds per low-block arm. */
export const DEFAULT_TACTICAL_AGENCY_PAIRED_SEEDS = 40;

/**
 * The out-of-sample world seed prefix for Checkpoint A2.
 *
 * Declared here, before the checkpoint is read, and **never used for selection,
 * tuning or inspection**. A gate that passes only on the seeds the before-state
 * was measured on is a gate that measured the seeds.
 */
export const TACTICAL_AGENCY_A2_OUT_OF_SAMPLE_WORLD_SEED = "phase81a-agency-a2-out-of-sample";

/** Clubs per world put through the archetype-mix counterfactual. */
export const TACTICAL_AGENCY_A2_COUNTERFACTUAL_CLUB_COUNT = 6;

/** World supplying the equal-quality band and versioned engine configuration. */
export const TACTICAL_AGENCY_B_WORLD_SEED = "phase81a-b-structural-world-v1";

/** B2 uses the exact A2 seed populations, separately and without pooling. */
export const TACTICAL_AGENCY_B2_SEED_SETS = [
  {
    setName: "in-sample (Checkpoint A before-state seeds)",
    seedPrefix: DEFAULT_TACTICAL_AGENCY_WORLD_SEED,
  },
  {
    setName: "out-of-sample (never used for selection or tuning)",
    seedPrefix: TACTICAL_AGENCY_A2_OUT_OF_SAMPLE_WORLD_SEED,
  },
] as const;

/** Larger untouched population frozen by Step 06C12 before implementation. */
export const TACTICAL_AGENCY_B2_DOWNSTREAM_REPLICATION_SEED_SETS = [
  {
    setName: "downstream replication A (untouched)",
    seedPrefix: "phase81a-b2-downstream-replication-a",
  },
  {
    setName: "downstream replication B (untouched)",
    seedPrefix: "phase81a-b2-downstream-replication-b",
  },
] as const;

/** Worlds per independently decided Step 06C12 set. */
export const TACTICAL_AGENCY_B2_DOWNSTREAM_REPLICATION_WORLD_COUNT = 14;

/** Reciprocal farthest-first contexts per independently decided Step 06C12 set. */
export const TACTICAL_AGENCY_B2_DOWNSTREAM_REPLICATION_CONTEXT_COUNT = 64;

interface TacticalAgencyConditionedPopulationContract {
  readonly seedSets: readonly {
    readonly setName: string;
    readonly seedPrefix: string;
  }[];
  readonly worldCount: number;
  readonly maximumReplayContextCount: number;
  readonly selectionSeedPrefix: string;
  readonly replaySeedPrefix: string;
}

const TACTICAL_AGENCY_B2_CURRENT_CONTRACT: TacticalAgencyConditionedPopulationContract = {
  seedSets: TACTICAL_AGENCY_B2_SEED_SETS,
  worldCount: DEFAULT_TACTICAL_AGENCY_WORLD_COUNT,
  maximumReplayContextCount: 32,
  selectionSeedPrefix: "phase81a-b2-selection-v1",
  replaySeedPrefix: "phase81a-b2-replay-v1",
};

const TACTICAL_AGENCY_B2_DOWNSTREAM_REPLICATION_CONTRACT:
TacticalAgencyConditionedPopulationContract = {
  seedSets: TACTICAL_AGENCY_B2_DOWNSTREAM_REPLICATION_SEED_SETS,
  worldCount: TACTICAL_AGENCY_B2_DOWNSTREAM_REPLICATION_WORLD_COUNT,
  maximumReplayContextCount: TACTICAL_AGENCY_B2_DOWNSTREAM_REPLICATION_CONTEXT_COUNT,
  selectionSeedPrefix: "phase81a-b2-downstream-replication-selection-v1",
  replaySeedPrefix: "phase81a-b2-downstream-replication-replay-v1",
};

/**
 * Runs the low-block guardrail on the legacy chart and reuses the current arm.
 *
 * The current arm is the exact low-block result A2 already produced for its
 * primary gates. Only the legacy-chart arm is simulated here, so the command
 * cannot retain or rerun a second copy of the same current population.
 */
function runCheckpointA21(input: {
  readonly setName: string;
  readonly worldSeed: string;
  readonly worldCount: number;
  readonly seedPrefix: string;
  readonly pairedSeedCount: number;
  readonly currentLowBlock: TacticalAgencyAuditReport["lowBlock"];
}): CheckpointA21Facts {
  const worldSeeds = Array.from(
    { length: input.worldCount },
    (_unused, index) => `${input.worldSeed}-${String(index + 1).padStart(3, "0")}`,
  );

  const controlLowBlock = pooledLowBlockForChart(input, worldSeeds, PRE_PHASE_81A_SQUAD_SKELETON);
  const control = checkpointA21Arm(
    "legacy chart on Phase 81A-generated footballers (control)",
    worldSeeds,
    controlLowBlock,
  );
  const current = checkpointA21Arm("Phase 81A squad identities", worldSeeds, input.currentLowBlock);
  const arms = [control, current] as const;

  return {
    setName: input.setName,
    arms,
    attribution: current.guardrailHeld
      ? "not_reproduced"
      : control.guardrailHeld
        ? "step_03a_chart"
        : "legacy_chart_also_fails",
  };
}

/** Pools the one additional chart arm A2.1 needs. */
function pooledLowBlockForChart(
  input: Pick<Parameters<typeof runCheckpointA21>[0], "seedPrefix" | "pairedSeedCount">,
  worldSeeds: readonly string[],
  chart: TacticalAgencySquadChart,
): TacticalAgencyAuditReport["lowBlock"] {
  return pooledLowBlockForWorldSeeds(input, worldSeeds, chart);
}

/** Pools the canonical low-block reader over an already-declared world set. */
function pooledLowBlockForWorldSeeds(
  input: Pick<Parameters<typeof runCheckpointA21>[0], "seedPrefix" | "pairedSeedCount">,
  worldSeeds: readonly string[],
  chart?: TacticalAgencySquadChart,
): TacticalAgencyAuditReport["lowBlock"] {
  return poolTacticalAgencyLowBlockResults(
    worldSeeds.map((worldSeed) =>
      runTacticalAgencyLowBlockSeries(
        buildTacticalAgencyLowBlockInput({
          worldSeed,
          seedPrefix: input.seedPrefix,
          pairedSeedCount: input.pairedSeedCount,
          ...(chart === undefined ? {} : { reRoleAllClubsTo: chart }),
        }),
      ),
    ),
  );
}

/** Turns one canonical low-block aggregate into its A2.1 row. */
function checkpointA21Arm(
  armName: string,
  worldSeeds: readonly string[],
  lowBlock: TacticalAgencyAuditReport["lowBlock"],
): CheckpointA21Arm {
  const exchangeRate = lowBlock.ownLossPerConcededReduction;

  return {
    armName,
    worldSeeds,
    concededExpectedGoalsReduction: lowBlock.concededExpectedGoalsReduction,
    ownLossPerConcededReduction: exchangeRate,
    guardrailHeld:
      lowBlock.concededExpectedGoalsReduction >= 0.08
      && typeof exchangeRate === "number"
      && exchangeRate <= 2,
  };
}

/** Measurement configuration handed to the tactical-agency fact producer. */
export interface CreateTacticalAgencySectionInput {
  readonly worldSeed: string;
  readonly worldCount: number;
  readonly roundCount: number;
  readonly seedPrefix: string;
  readonly pairedSeedCount: number;
  readonly workerCount: number;
  readonly checkpointMode: boolean;
}

/** Profile evidence plus the calibration stamp read from the measured worlds. */
export interface TacticalAgencyA2ProfileFacts {
  readonly checkpoint: CheckpointA2Facts;
  readonly calibrationVersions: Readonly<Record<string, string>>;
}

/** Phase-1 structural evidence plus the calibration that produced it. */
export interface TacticalAgencyBProfileFacts {
  readonly analysis: TacticalAgencyStructuralAnalysis;
  readonly elapsedMilliseconds: number;
  readonly workerCount: number;
  readonly calibrationVersions: Readonly<Record<string, string>>;
  readonly worldSeeds: readonly [string];
}

/** One independently decided B2 seed set. */
export interface TacticalAgencyB2SetFacts {
  readonly setName: string;
  readonly worldSeeds: readonly string[];
  readonly populationRows: readonly TacticalAgencyConditionedPopulationRow[];
  readonly population: readonly LeagueDiversityOpeningGateVerdict[];
  readonly populationHeld: boolean;
  readonly analysis: TacticalAgencyConditionedAnalysis;
  readonly phaseOneDecision: "PASS_PHASE_1" | "REFINE" | "STOP_RETHINK";
  readonly phaseTwo:
    | { readonly status: "not_run_by_protocol" }
    | {
        readonly status: "completed";
        readonly replay: TacticalAgencyConditionedReplaySummary;
        readonly lowBlock: TacticalAgencyAuditReport["lowBlock"];
        readonly lowBlockHeld: boolean;
      };
  readonly decision: "GO" | "REFINE" | "STOP_RETHINK";
}

/** Complete B2 result, including the unchanged original dominance readers. */
export interface TacticalAgencyB2ProfileFacts {
  readonly sets: readonly TacticalAgencyB2SetFacts[];
  readonly originalDominance: {
    readonly invariants: readonly TacticalShapeInvariantResult[];
    readonly held: boolean;
  } | { readonly status: "not_run_by_protocol" };
  readonly decision: "GO" | "REFINE" | "STOP_RETHINK";
  readonly workerCount: number;
  readonly elapsedMilliseconds: number;
  readonly calibrationVersions: Readonly<Record<string, string>>;
  readonly worldSeeds: readonly string[];
}

/** Observational B2 materiality attribution; never a replacement gate. */
export interface TacticalAgencyB2MaterialityProfileFacts {
  readonly sets: readonly {
    readonly setName: string;
    readonly worldSeeds: readonly string[];
    readonly analysis: TacticalAgencyConditionedAnalysis;
    readonly populationRows: readonly TacticalAgencyConditionedPopulationRow[];
    readonly population: readonly LeagueDiversityOpeningGateVerdict[];
    readonly clubSelections: readonly TacticalAgencyConditionedClubSelection[];
    readonly phaseOneDecision: "PASS_PHASE_1" | "REFINE" | "STOP_RETHINK";
    readonly populationHeld: boolean;
    readonly attribution: TacticalAgencyConditionedMaterialitySummary | null;
    readonly replayReconciliationHeld: boolean;
  }[];
  readonly owner: TacticalAgencyConditionedMaterialityOwner | "mixed" | "not_evaluated";
  readonly decision: "OWNER_IDENTIFIED" | "MIXED" | "STOP_RETHINK";
  readonly workerCount: number;
  readonly elapsedMilliseconds: number;
  readonly calibrationVersions: Readonly<Record<string, string>>;
  readonly worldSeeds: readonly string[];
}

/** Complete-row materiality of the currently loaded calibration. */
export interface TacticalAgencyB2CurrentMaterialityProfileFacts {
  readonly sets: readonly {
    readonly setName: string;
    readonly worldSeeds: readonly string[];
    readonly analysis: TacticalAgencyConditionedAnalysis;
    readonly populationRows: readonly TacticalAgencyConditionedPopulationRow[];
    readonly population: readonly LeagueDiversityOpeningGateVerdict[];
    readonly clubSelections: readonly TacticalAgencyConditionedClubSelection[];
    readonly phaseOneDecision: "PASS_PHASE_1" | "REFINE" | "STOP_RETHINK";
    readonly populationHeld: boolean;
    readonly attribution: TacticalAgencyConditionedMaterialitySummary | null;
    readonly materialityHeld: boolean;
  }[];
  readonly downstreamOwner: TacticalAgencyChanceToResultOwner | "mixed" | "not_evaluated";
  readonly downstreamAttributionHeld: boolean;
  readonly resolutionOwner: TacticalAgencyResultResolutionOwner | "mixed" | "not_evaluated";
  readonly resolutionAttributionHeld: boolean;
  readonly decision: "MATERIALITY_PASS" | "REFINE" | "STOP_RETHINK";
  readonly workerCount: number;
  readonly elapsedMilliseconds: number;
  readonly calibrationVersions: Readonly<Record<string, string>>;
  readonly worldSeeds: readonly string[];
}

interface TacticalAgencyB2MaterialityMeasurement {
  readonly sets: readonly {
    readonly setName: string;
    readonly worldSeeds: readonly string[];
    readonly analysis: TacticalAgencyConditionedAnalysis;
    readonly populationRows: readonly TacticalAgencyConditionedPopulationRow[];
    readonly population: readonly LeagueDiversityOpeningGateVerdict[];
    readonly clubSelections: readonly TacticalAgencyConditionedClubSelection[];
    readonly phaseOneDecision: "PASS_PHASE_1" | "REFINE" | "STOP_RETHINK";
    readonly populationHeld: boolean;
    readonly attribution: TacticalAgencyConditionedMaterialitySummary | null;
  }[];
  readonly owner: TacticalAgencyConditionedMaterialityOwner | "mixed" | "not_evaluated";
  readonly workerCount: number;
  readonly elapsedMilliseconds: number;
  readonly calibrationVersions: Readonly<Record<string, string>>;
  readonly worldSeeds: readonly string[];
}

/** B2.1's observational owner decision over the exact B2 population. */
export interface TacticalAgencyB21ProfileFacts {
  readonly sets: readonly {
    readonly setName: string;
    readonly worldSeeds: readonly string[];
    readonly tactical: TacticalAgencyB21TacticalAttribution;
  }[];
  readonly tacticalOwner: TacticalAgencyB21TacticalOwner;
  readonly firstCoherentComponent: TacticalAgencyB21ComponentKey | "none";
  readonly formation: TacticalAgencyB21FormationAttribution;
  readonly b2Reproduced: boolean;
  readonly decision: "OWNER_IDENTIFIED" | "REFINE" | "STOP_RETHINK";
  readonly workerCount: number;
  readonly elapsedMilliseconds: number;
  readonly calibrationVersions: Readonly<Record<string, string>>;
  readonly worldSeeds: readonly string[];
}

/** B2.1A profile evidence over B2.1's exact retained population. */
export interface TacticalAgencyB21AProfileFacts {
  readonly b2Reproduced: boolean;
  readonly formation: TacticalAgencyB21FormationAttribution;
  readonly family: ReturnType<typeof summarizeTacticalAgencyB21IdentityFamily>;
  readonly decision: "IDENTITY_FAMILY" | "SAMPLING_ONLY" | "REFINE" | "STOP_RETHINK";
  readonly workerCount: number;
  readonly elapsedMilliseconds: number;
  readonly calibrationVersions: Readonly<Record<string, string>>;
  readonly worldSeeds: readonly string[];
}

interface TacticalAgencyConditionedMeasuredSet {
  readonly setName: string;
  readonly worldSeeds: readonly string[];
  readonly populationRows: readonly TacticalAgencyConditionedPopulationRow[];
  readonly population: readonly LeagueDiversityOpeningGateVerdict[];
  readonly populationHeld: boolean;
  readonly analysis: TacticalAgencyConditionedAnalysis;
  readonly decision: "PASS_PHASE_1" | "REFINE" | "STOP_RETHINK";
  readonly responses: ReturnType<typeof buildTacticalAgencyConditionedResponses>;
  readonly matchups: readonly (TacticalAgencyConditionedAttributionMatchup
    & TacticalAgencyConditionedReplayMatchupInput)[];
  readonly contexts: readonly TacticalAgencyConditionedContextRow[];
  readonly clubSelections: readonly TacticalAgencyConditionedClubSelection[];
  readonly engineConfig: ReturnType<typeof runTacticalAgencyConditionedWorld>["engineConfig"];
  readonly matchTacticsCalibration: ReturnType<typeof runTacticalAgencyConditionedWorld>["matchTacticsCalibration"];
}

interface TacticalAgencyConditionedMeasurement {
  readonly sets: readonly TacticalAgencyConditionedMeasuredSet[];
  readonly decision: "PASS_PHASE_1" | "REFINE" | "STOP_RETHINK";
  readonly workerCount: number;
  readonly elapsedMilliseconds: number;
  readonly calibrationVersions: Readonly<Record<string, string>>;
  readonly worldSeeds: readonly string[];
}

/**
 * Runs Checkpoint B Phase 1 across seven real worker threads.
 *
 * Opponent columns are the independent shard. Results are restored to their
 * canonical index before the audit groups signatures, so thread completion
 * order cannot move equivalence, tie-breaks, or the decision.
 */
export async function createTacticalAgencyBProfileFacts(input: {
  readonly workerCount: number;
}): Promise<TacticalAgencyBProfileFacts> {
  if (input.workerCount !== 7) {
    throw new Error(`Checkpoint B requires exactly 7 workers: ${input.workerCount}`);
  }

  const startedAt = performance.now();
  const world = createFakeDomesticWorld({ worldSeed: TACTICAL_AGENCY_B_WORLD_SEED });
  const measured = measureTacticalShapeQualityBands(TACTICAL_AGENCY_B_WORLD_SEED);
  const actions = buildTacticalAgencyStructuralActions({
    referenceBand: measured.bands.reference,
    matchTacticsCalibration: world.matchTacticsCalibration,
  });
  const partitions = Array.from({ length: input.workerCount }, () => [] as number[]);
  for (let opponentIndex = 0; opponentIndex < actions.length; opponentIndex += 1) {
    (partitions[opponentIndex % input.workerCount] as number[]).push(opponentIndex);
  }

  const completed = await Promise.all(partitions.map((opponentIndexes, partitionIndex) =>
    runTacticalAgencyStructuralWorker({
      partitionIndex,
      actions,
      opponentIndexes,
      engineConfig: world.matchEngineConfig,
      matchTacticsCalibration: world.matchTacticsCalibration,
    })));
  const contexts: TacticalAgencyStructuralContextRow[] = [];
  for (const partition of completed.sort((left, right) => left.partitionIndex - right.partitionIndex)) {
    contexts.push(...partition.contexts);
  }

  return {
    analysis: summarizeTacticalAgencyStructuralAnalysis({ actions, contexts }),
    elapsedMilliseconds: performance.now() - startedAt,
    workerCount: input.workerCount,
    calibrationVersions: {
      matchTactics: world.matchTacticsCalibration.version,
      tacticalAgencyStructural: "phase81a-b-phase1-v1",
    },
    worldSeeds: [TACTICAL_AGENCY_B_WORLD_SEED],
  };
}

/** Runs complete B2, opening Phase 2 only after both analytic sets pass. */
export async function createTacticalAgencyB2ProfileFacts(input: {
  readonly workerCount: number;
}): Promise<TacticalAgencyB2ProfileFacts> {
  const startedAt = performance.now();
  const measured = await measureTacticalAgencyConditionedPopulation(input.workerCount);
  if (measured.decision !== "PASS_PHASE_1") {
    return {
      ...measured,
      sets: measured.sets.map(({ responses: _responses, matchups: _matchups, contexts: _contexts,
        clubSelections: _clubSelections, engineConfig: _engineConfig,
        matchTacticsCalibration: _matchTacticsCalibration, decision, ...set }) => ({
        ...set,
        phaseOneDecision: decision,
        phaseTwo: { status: "not_run_by_protocol" },
        decision: decision === "STOP_RETHINK" ? "STOP_RETHINK" : "REFINE",
      })),
      originalDominance: { status: "not_run_by_protocol" },
      decision: measured.decision === "STOP_RETHINK" ? "STOP_RETHINK" : "REFINE",
      elapsedMilliseconds: performance.now() - startedAt,
    };
  }

  const sets: TacticalAgencyB2SetFacts[] = [];
  for (const [setIndex, set] of measured.sets.entries()) {
    const selected = selectTacticalAgencyConditionedReplayContexts({
      responses: set.responses,
      contexts: set.contexts,
      matchups: set.matchups,
    });
    const partitions = Array.from({ length: input.workerCount }, () =>
      [] as typeof selected[number][]);
    for (const [contextIndex, context] of selected.entries()) {
      (partitions[contextIndex % input.workerCount] as typeof selected[number][]).push(context);
    }
    const completed = await Promise.all(partitions.map((contexts, partitionIndex) =>
      runTacticalAgencyConditionedReplayWorker({
        partitionIndex,
        responses: set.responses,
        contexts,
        engineConfig: set.engineConfig,
        matchTacticsCalibration: set.matchTacticsCalibration,
        selectionSeedPrefix: `phase81a-b2-selection-v1-${setIndex}`,
        replaySeedPrefix: `phase81a-b2-replay-v1-${setIndex}`,
      })));
    const replayRows = completed
      .sort((left, right) => left.partitionIndex - right.partitionIndex)
      .flatMap(({ contexts }) => contexts)
      .sort((left, right) => left.contextIndex - right.contextIndex);
    const replay = summarizeTacticalAgencyConditionedReplay({
      declaredContextCount: set.analysis.declaredContextCount,
      contexts: replayRows,
    });
    const lowBlock = pooledLowBlockForWorldSeeds(
      {
        seedPrefix: `phase81a-b2-low-block-v1-${setIndex}`,
        pairedSeedCount: DEFAULT_TACTICAL_AGENCY_PAIRED_SEEDS,
      },
      set.worldSeeds,
    );
    const exchangeRate = lowBlock.ownLossPerConcededReduction;
    const lowBlockHeld = lowBlock.concededExpectedGoalsReduction >= 0.08
      && typeof exchangeRate === "number"
      && exchangeRate <= 2;
    const {
      responses: _responses,
      matchups: _matchups,
      contexts: _contexts,
      clubSelections: _clubSelections,
      engineConfig: _engineConfig,
      matchTacticsCalibration: _matchTacticsCalibration,
      decision: phaseOneDecision,
      ...publicSet
    } = set;
    sets.push({
      ...publicSet,
      phaseOneDecision,
      phaseTwo: { status: "completed", replay, lowBlock, lowBlockHeld },
      decision: replaySignalIsAbsent(replay)
        ? "STOP_RETHINK"
        : replay.decision === "GO" && lowBlockHeld
          ? "GO"
          : "REFINE",
    });
  }

  const originalDominanceInvariants = createTacticalShapeSectionFacts().report.invariants.filter(
    ({ key }) => key === "no_dominant_composition"
      || key === "no_dominant_formation"
      || key === "no_dominant_tactic",
  );
  const originalDominance = {
    invariants: originalDominanceInvariants,
    held: originalDominanceInvariants.length === 3
      && originalDominanceInvariants.every(({ status }) => status === "pass"),
  };
  return {
    ...measured,
    sets,
    originalDominance,
    decision: sets.some(({ decision }) => decision === "STOP_RETHINK")
      ? "STOP_RETHINK"
      : sets.every(({ decision }) => decision === "GO") && originalDominance.held
        ? "GO"
        : "REFINE",
    elapsedMilliseconds: performance.now() - startedAt,
  };
}

/** Runs the complete-response attribution over 06C4's exact accepted contexts. */
export async function createTacticalAgencyB2MaterialityProfileFacts(input: {
  readonly workerCount: number;
}): Promise<TacticalAgencyB2MaterialityProfileFacts> {
  const measured = await measureTacticalAgencyB2Materiality(input.workerCount);
  const sets = measured.sets.map((set, setIndex) => ({
    ...set,
    replayReconciliationHeld: set.attribution !== null
      && reproducesAcceptedB2Replay(setIndex, set.attribution),
  }));
  const reconciliationHeld = sets.every(({ replayReconciliationHeld }) =>
    replayReconciliationHeld);
  return {
    ...measured,
    sets,
    decision: !reconciliationHeld
      ? "STOP_RETHINK"
      : measured.owner === "mixed"
        ? "MIXED"
        : "OWNER_IDENTIFIED",
  };
}

/** Evaluates complete rows without pretending current content is historical 06C5. */
export async function createTacticalAgencyB2CurrentMaterialityProfileFacts(input: {
  readonly workerCount: number;
}): Promise<TacticalAgencyB2CurrentMaterialityProfileFacts> {
  return createTacticalAgencyCurrentMaterialityFacts({
    workerCount: input.workerCount,
    contract: TACTICAL_AGENCY_B2_CURRENT_CONTRACT,
    calibrationVersionKey: "tacticalAgencyCurrentMateriality",
    calibrationVersion: "phase81a-b2-current-materiality-v1",
  });
}

/** Runs 06C12's larger untouched owner replication without changing B2. */
export async function createTacticalAgencyB2DownstreamReplicationProfileFacts(input: {
  readonly workerCount: number;
}): Promise<TacticalAgencyB2CurrentMaterialityProfileFacts> {
  return createTacticalAgencyCurrentMaterialityFacts({
    workerCount: input.workerCount,
    contract: TACTICAL_AGENCY_B2_DOWNSTREAM_REPLICATION_CONTRACT,
    calibrationVersionKey: "tacticalAgencyDownstreamReplication",
    calibrationVersion: "phase81a-b2-downstream-replication-v1",
  });
}

async function createTacticalAgencyCurrentMaterialityFacts(input: {
  readonly workerCount: number;
  readonly contract: TacticalAgencyConditionedPopulationContract;
  readonly calibrationVersionKey: string;
  readonly calibrationVersion: string;
}): Promise<TacticalAgencyB2CurrentMaterialityProfileFacts> {
  const measured = await measureTacticalAgencyB2Materiality(
    input.workerCount,
    input.contract,
  );
  const sets = measured.sets.map((set) => ({
    ...set,
    materialityHeld: set.attribution !== null
      && set.attribution.optimisticCounterMoveCeiling.value >= 0.045
      && set.attribution.optimisticCounterMoveExposure.value <= -0.045,
  }));
  const downstreamRows = sets.flatMap(({ attribution }) =>
    attribution === null ? [] : [attribution.chanceToResult]);
  const downstreamDecision = decideTacticalAgencyChanceToResultOwner(downstreamRows);
  const downstreamOwner = downstreamDecision.owner;
  const downstreamAttributionHeld = downstreamRows.length === sets.length
    && downstreamDecision.held;
  const resolutionRows = downstreamRows.map(({ resolutionDecomposition }) =>
    resolutionDecomposition);
  const resolutionDecision = decideTacticalAgencyResultResolutionOwner(resolutionRows);
  return {
    sets,
    downstreamOwner,
    downstreamAttributionHeld,
    resolutionOwner: resolutionDecision.owner,
    resolutionAttributionHeld: resolutionRows.length === sets.length && resolutionDecision.held,
    decision: sets.some(({ phaseOneDecision }) => phaseOneDecision === "STOP_RETHINK")
      ? "STOP_RETHINK"
      : sets.every(({ phaseOneDecision, populationHeld, materialityHeld }) =>
          phaseOneDecision === "PASS_PHASE_1" && populationHeld && materialityHeld)
        ? "MATERIALITY_PASS"
        : "REFINE",
    workerCount: measured.workerCount,
    elapsedMilliseconds: measured.elapsedMilliseconds,
    calibrationVersions: {
      ...measured.calibrationVersions,
      [input.calibrationVersionKey]: input.calibrationVersion,
    },
    worldSeeds: measured.worldSeeds,
  };
}

/** One complete-row producer for accepted materiality attribution. */
async function measureTacticalAgencyB2Materiality(
  workerCount: number,
  contract: TacticalAgencyConditionedPopulationContract = TACTICAL_AGENCY_B2_CURRENT_CONTRACT,
): Promise<TacticalAgencyB2MaterialityMeasurement> {
  const startedAt = performance.now();
  const measured = await measureTacticalAgencyConditionedPopulation(workerCount, contract);
  if (measured.decision !== "PASS_PHASE_1") {
    return {
      sets: measured.sets.map((set) => ({
        setName: set.setName,
        worldSeeds: set.worldSeeds,
        analysis: set.analysis,
        populationRows: set.populationRows,
        population: set.population,
        clubSelections: set.clubSelections,
        phaseOneDecision: set.decision,
        populationHeld: set.populationHeld,
        attribution: null,
      })),
      owner: "not_evaluated",
      workerCount,
      elapsedMilliseconds: performance.now() - startedAt,
      calibrationVersions: measured.calibrationVersions,
      worldSeeds: measured.worldSeeds,
    };
  }

  const sets: TacticalAgencyB2MaterialityMeasurement["sets"][number][] = [];
  for (const [setIndex, set] of measured.sets.entries()) {
    const selected = selectTacticalAgencyConditionedReplayContexts({
      responses: set.responses,
      contexts: set.contexts,
      matchups: set.matchups,
      maximumContextCount: contract.maximumReplayContextCount,
    });
    const partitions = Array.from({ length: workerCount }, () =>
      [] as typeof selected[number][]);
    for (const [contextIndex, context] of selected.entries()) {
      (partitions[contextIndex % workerCount] as typeof selected[number][]).push(context);
    }
    const completed = await Promise.all(partitions.map((contexts, partitionIndex) =>
      runTacticalAgencyConditionedMaterialityWorker({
        partitionIndex,
        responses: set.responses,
        contexts,
        engineConfig: set.engineConfig,
        matchTacticsCalibration: set.matchTacticsCalibration,
        selectionSeedPrefix: `${contract.selectionSeedPrefix}-${setIndex}`,
        replaySeedPrefix: `${contract.replaySeedPrefix}-${setIndex}`,
      })));
    const rows = completed
      .sort((left, right) => left.partitionIndex - right.partitionIndex)
      .flatMap(({ contexts }) => contexts)
      .sort((left, right) => left.contextIndex - right.contextIndex);
    const attribution = summarizeTacticalAgencyConditionedMateriality({
      declaredContextCount: set.analysis.declaredContextCount,
      contexts: rows,
    });
    sets.push({
      setName: set.setName,
      worldSeeds: set.worldSeeds,
      analysis: set.analysis,
      populationRows: set.populationRows,
      population: set.population,
      clubSelections: set.clubSelections,
      phaseOneDecision: set.decision,
      populationHeld: set.populationHeld,
      attribution,
    });
  }
  const owners = new Set(sets.flatMap(({ attribution }) =>
    attribution === null ? [] : [attribution.owner]));
  const owner = owners.size === 1
    ? [...owners][0] as TacticalAgencyConditionedMaterialityOwner
    : "mixed" as const;
  return {
    sets,
    owner,
    workerCount,
    elapsedMilliseconds: performance.now() - startedAt,
    calibrationVersions: {
      ...measured.calibrationVersions,
      tacticalAgencyMateriality: "phase81a-b2-materiality-attribution-v1",
    },
    worldSeeds: measured.worldSeeds,
  };
}

/** Frozen accepted 06C4 replay facts; exact reconstruction is the purity gate. */
function reproducesAcceptedB2Replay(
  setIndex: number,
  attribution: TacticalAgencyConditionedMaterialitySummary,
): boolean {
  const expected = [
    {
      ceiling: 0.004825947794278443,
      exposure: -0.008083480305702537,
      contextFree: 0.00020590331916174465,
    },
    {
      ceiling: 0.00796739343438217,
      exposure: -0.00509255709202033,
      contextFree: -0.0037882660668468577,
    },
  ] as const;
  const row = expected[setIndex];
  return row !== undefined
    && attribution.acceptedReplay.selectedContextCount === 32
    && attribution.acceptedReplay.declaredContextCount === 3_402
    && attribution.acceptedReplay.counterMoveCeiling.value === row.ceiling
    && attribution.acceptedReplay.counterMoveExposure.value === row.exposure
    && attribution.acceptedReplay.contextFreeDelta.value === row.contextFree;
}

/** Independent replay cannot reproduce a selected signal when both intervals cross zero. */
function replaySignalIsAbsent(replay: TacticalAgencyConditionedReplaySummary): boolean {
  const includesZero = (interval: readonly [number, number]): boolean =>
    interval[0] <= 0 && interval[1] >= 0;
  return includesZero(replay.counterMoveCeiling.interval95)
    && includesZero(replay.counterMoveExposure.interval95);
}

/** Runs B2.1 over fresh B2 facts without retaining a second simulation path. */
export async function createTacticalAgencyB21ProfileFacts(input: {
  readonly workerCount: number;
}): Promise<TacticalAgencyB21ProfileFacts> {
  const measured = await measureTacticalAgencyConditionedPopulation(input.workerCount);
  const tacticalSets = measured.sets.map((set) => ({
    setName: set.setName,
    worldSeeds: set.worldSeeds,
    tactical: summarizeTacticalAgencyConditionedAttribution({
      responses: set.responses,
      matchups: set.matchups,
      contexts: set.contexts,
    }),
  }));
  const tacticalOwner = decideTacticalAgencyConditionedOwner(
    tacticalSets.map(({ tactical }) => tactical),
  );
  const formation = summarizeTacticalAgencyB21FormationAttribution(
    measured.sets.map((set) => ({
      setName: set.setName,
      clubSelections: set.clubSelections,
      populationRows: set.populationRows,
      population: set.population,
    })),
  );
  const b2Reproduced = reproducesFrozenCheckpointB2(measured.sets);
  const reconciliationHeld = tacticalSets.every(({ tactical }) =>
    tactical.reconciliationMismatchCount === 0);
  const ownerIdentified = tacticalOwner !== "unresolved" && formation.owner !== "unresolved";
  return {
    sets: tacticalSets,
    tacticalOwner,
    firstCoherentComponent: firstCoherentTacticalAgencyComponent(
      tacticalSets.map(({ tactical }) => tactical),
    ),
    formation,
    b2Reproduced,
    decision: !b2Reproduced || !reconciliationHeld
      ? "STOP_RETHINK"
      : ownerIdentified
        ? "OWNER_IDENTIFIED"
        : "REFINE",
    workerCount: measured.workerCount,
    elapsedMilliseconds: measured.elapsedMilliseconds,
    calibrationVersions: {
      ...measured.calibrationVersions,
      tacticalAgencyConditionedAttribution: "phase81a-b2-1-attribution-v1",
    },
    worldSeeds: measured.worldSeeds,
  };
}

/** Runs the frozen minimum-family follow-up without a second world producer. */
export async function createTacticalAgencyB21AProfileFacts(input: {
  readonly workerCount: number;
}): Promise<TacticalAgencyB21AProfileFacts> {
  const measured = await measureTacticalAgencyConditionedPopulation(input.workerCount);
  const formation = summarizeTacticalAgencyB21FormationAttribution(
    measured.sets.map((set) => ({
      setName: set.setName,
      clubSelections: set.clubSelections,
      populationRows: set.populationRows,
      population: set.population,
    })),
  );
  const family = summarizeTacticalAgencyB21IdentityFamily(formation);
  const b2Reproduced = reproducesFrozenCheckpointB2(measured.sets);
  return {
    b2Reproduced,
    formation,
    family,
    decision: b2Reproduced ? family.decision : "STOP_RETHINK",
    workerCount: measured.workerCount,
    elapsedMilliseconds: measured.elapsedMilliseconds,
    calibrationVersions: {
      ...measured.calibrationVersions,
      tacticalAgencyIdentityFamily: "phase81a-b2-1a-identity-family-v1",
    },
    worldSeeds: measured.worldSeeds,
  };
}

/** One canonical producer shared by B2 and its attribution retry. */
async function measureTacticalAgencyConditionedPopulation(
  workerCount: number,
  contract: TacticalAgencyConditionedPopulationContract = TACTICAL_AGENCY_B2_CURRENT_CONTRACT,
): Promise<TacticalAgencyConditionedMeasurement> {
  if (workerCount !== 7) {
    throw new Error(`Checkpoint B2 requires exactly 7 workers: ${workerCount}`);
  }
  const startedAt = performance.now();
  const responses = buildTacticalAgencyConditionedResponses();
  const sets: TacticalAgencyConditionedMeasuredSet[] = [];
  const allWorldSeeds: string[] = [];
  const calibrationVersions = new Set<string>();

  for (const seedSet of contract.seedSets) {
    const worldSeeds = Array.from(
      { length: contract.worldCount },
      (_unused, index) => `${seedSet.seedPrefix}-${String(index + 1).padStart(3, "0")}`,
    );
    allWorldSeeds.push(...worldSeeds);
    const worlds = worldSeeds.map((worldSeed) =>
      runTacticalAgencyConditionedWorld({ worldSeed }));
    for (const world of worlds) calibrationVersions.add(world.matchTacticsCalibrationVersion);
    const firstWorld = worlds[0];
    if (firstWorld === undefined) throw new Error(`B2 set has no worlds: ${seedSet.setName}`);
    const matchups: (TacticalAgencyConditionedAttributionMatchup
      & TacticalAgencyConditionedReplayMatchupInput)[] = worlds.flatMap((world) =>
      world.matchups.map((matchup) => ({
        matchupId: matchup.contextId,
        reciprocalMatchupId: reciprocalConditionedMatchupId(matchup.contextId),
        worldSeed: matchup.worldSeed,
        competitionId: String(matchup.competitionId),
        ownClubId: String(matchup.own.clubId),
        opponentClubId: String(matchup.opponent.clubId),
        ownIdentityKey: matchup.ownIdentityKey,
        opponentIdentityKey: matchup.opponentIdentityKey,
        ownFormationKey: matchup.ownFormationKey,
        opponentFormationKey: matchup.opponentFormationKey,
        ownShape: matchup.own.shape,
        opponentShape: matchup.opponent.shape,
        own: matchup.own,
        opponent: matchup.opponent,
      })));
    const contextCount = matchups.length * responses.length;
    const partitions = Array.from({ length: workerCount }, () => [] as number[]);
    for (let contextIndex = 0; contextIndex < contextCount; contextIndex += 1) {
      (partitions[contextIndex % workerCount] as number[]).push(contextIndex);
    }
    const completed = await Promise.all(partitions.map((contextIndexes, partitionIndex) =>
      runTacticalAgencyConditionedWorker({
        partitionIndex,
        responses,
        matchups,
        contextIndexes,
        engineConfig: firstWorld.engineConfig,
        matchTacticsCalibration: firstWorld.matchTacticsCalibration,
      })));
    const contexts: TacticalAgencyConditionedContextRow[] = [];
    for (const partition of completed.sort((left, right) => left.partitionIndex - right.partitionIndex)) {
      contexts.push(...partition.contexts);
    }
    const analysis = summarizeTacticalAgencyConditionedAnalysis({ responses, contexts });
    const population = worlds.flatMap(({ populationRows }) =>
      populationRows.map(evaluateLeagueDiversityOpeningGate));
    const populationHeld = population.every(({ held }) => held);
    const decision = analysis.decision === "STOP_RETHINK"
      ? analysis.decision
      : populationHeld
        ? analysis.decision
        : "REFINE" as const;
    sets.push({
      setName: seedSet.setName,
      worldSeeds,
      populationRows: worlds.flatMap(({ populationRows }) => populationRows),
      population,
      populationHeld,
      analysis,
      decision,
      responses,
      matchups,
      contexts,
      clubSelections: worlds.flatMap(({ clubSelections }) => clubSelections),
      engineConfig: firstWorld.engineConfig,
      matchTacticsCalibration: firstWorld.matchTacticsCalibration,
    });
  }

  if (calibrationVersions.size !== 1) {
    throw new Error(`B2 worlds disagree about calibration: ${[...calibrationVersions].join(", ")}`);
  }
  const decision = sets.every(({ decision }) => decision === "PASS_PHASE_1")
    ? "PASS_PHASE_1" as const
    : sets.some(({ decision }) => decision === "STOP_RETHINK")
      ? "STOP_RETHINK" as const
      : "REFINE" as const;

  return {
    sets,
    decision,
    workerCount,
    elapsedMilliseconds: performance.now() - startedAt,
    calibrationVersions: {
      matchTactics: [...calibrationVersions][0] as string,
      tacticalAgencyConditioned: "phase81a-b2-conditioned-phase1-v1",
    },
    worldSeeds: allWorldSeeds,
  };
}

/** B2 worlds name the two directed views explicitly; no guessed fallback. */
function reciprocalConditionedMatchupId(contextId: string): string {
  if (contextId.endsWith("|home")) return `${contextId.slice(0, -5)}|away`;
  if (contextId.endsWith("|away")) return `${contextId.slice(0, -5)}|home`;
  throw new Error(`B2 matchup has no canonical direction suffix: ${contextId}`);
}

/** Exact B2 facts pinned before B2.1 can inspect any new attribution output. */
function reproducesFrozenCheckpointB2(
  sets: readonly TacticalAgencyConditionedMeasuredSet[],
): boolean {
  const expected = [
    { populationPassCount: 21, coverage: [2_269, 1_132, 1], cycleCount: 134 },
    { populationPassCount: 19, coverage: [2_385, 1_014, 3], cycleCount: 133 },
  ] as const;
  const primaryHeld = sets[0]?.population.every(({ held }) => held) === true;
  const outOfSampleFailures = sets[1]?.populationRows.filter((row) => {
    const verdict = sets[1]?.population.find((candidate) =>
      candidate.worldSeed === row.worldSeed && candidate.competitionId === row.competitionId);
    return verdict?.held === false;
  }) ?? [];
  const frozenFailuresHeld = outOfSampleFailures.length === 2
    && outOfSampleFailures.some((row) =>
      row.worldSeed === "phase81a-agency-a2-out-of-sample-002"
      && row.competitionId === "competition:ita-3"
      && row.formationCounts["4-4-2"] === 6)
    && outOfSampleFailures.some((row) =>
      row.worldSeed === "phase81a-agency-a2-out-of-sample-006"
      && row.competitionId === "competition:ita-2"
      && row.formationCounts["4-4-2"] === 6);
  return primaryHeld && frozenFailuresHeld && sets.length === expected.length && sets.every((set, index) => {
    const row = expected[index];
    return row !== undefined
      && set.decision === "REFINE"
      && set.analysis.effectiveSignatureCount === 9
      && set.analysis.responseSignatureCount === 3
      && set.analysis.conservationMismatchCount === 0
      && set.analysis.mirrorMismatchCount === 0
      && set.analysis.dominantResponseIds.length === 0
      && set.analysis.materialCycles.length === row.cycleCount
      && set.population.filter(({ held }) => held).length === row.populationPassCount
      && set.analysis.responseCoverage.every(({ contextCount }, coverageIndex) =>
        contextCount === row.coverage[coverageIndex]);
  });
}

/**
 * Produces the before-state by fanning worlds across workers.
 *
 * Worlds are the shard key and each worker generates its own, so the aggregate
 * is identical whatever the worker count is. A single-worker run stays on this
 * thread rather than paying for a thread that would then be the only one.
 */
/**
 * The same run, with the selection rows kept.
 *
 * Checkpoint A2 groups selections by the squad identity that generated them,
 * and `TacticalAgencyAuditReport` deliberately carries only aggregates. Handing
 * the rows back beside the report is how A2 reads the same selections the
 * before-state summarised, instead of running the population twice.
 */
export async function createTacticalAgencySectionFacts(
  input: CreateTacticalAgencySectionInput,
): Promise<{
  readonly report: TacticalAgencyAuditReport;
  readonly rows: readonly TacticalAgencySelectionRow[];
}> {
  const worldSeeds = Array.from(
    { length: input.worldCount },
    (_unused, index) => `${input.worldSeed}-${String(index + 1).padStart(3, "0")}`,
  );

  const startedAt = performance.now();
  const results = await runWorldsAcrossWorkers(worldSeeds, input);
  const elapsedMilliseconds = performance.now() - startedAt;

  const rows: TacticalAgencySelectionRow[] = [];
  for (const result of results) rows.push(...result.rows);

  const report = buildTacticalAgencyAuditReport({
    manifest: {
      worldSeeds,
      lowBlockSeedPrefix: input.seedPrefix,
      matchTacticsCalibrationVersion: requiredCalibrationVersion(results),
      workerCount: input.workerCount,
      checkpointMode: input.checkpointMode,
    },
    selectionSeries: { rows, elapsedMilliseconds },
    roles: mergeRoleSummaries(results),
    // Every world, not just the first. Read on one world this is a two-club,
    // one-seed sample whose exchange rate swung 1.59 to 3.70 between two seed
    // sets - a spread one world cannot distinguish from the population moving.
    // The band is untouched; only the denominator under it grew.
    lowBlock: poolTacticalAgencyLowBlockResults(
      worldSeeds.map((worldSeed) =>
        runTacticalAgencyLowBlockSeries(
          buildTacticalAgencyLowBlockInput({
            worldSeed,
            seedPrefix: input.seedPrefix,
            pairedSeedCount: input.pairedSeedCount,
          }),
        ),
      ),
    ),
  });

  return { report, rows };
}

/**
 * Runs Checkpoint A2: both seed sets, then the archetype-mix counterfactual.
 *
 * The out-of-sample set uses the same world count, round count and worker count
 * as the in-sample one. A second set measured at a different resolution would
 * not be an out-of-sample check, it would be a different experiment.
 */
export async function createTacticalAgencyA2ProfileFacts(
  input: CreateTacticalAgencySectionInput,
): Promise<TacticalAgencyA2ProfileFacts> {
  const sets: CheckpointA2SetEvaluation[] = [];
  const lowBlockAttributionFacts: CheckpointA21Facts[] = [];
  const calibrationVersions = new Set<string>();

  for (const [setName, worldSeed] of [
    ["in-sample (Checkpoint A before-state seeds)", input.worldSeed],
    ["out-of-sample (never used for selection or tuning)", TACTICAL_AGENCY_A2_OUT_OF_SAMPLE_WORLD_SEED],
  ] as const) {
    const produced = await createTacticalAgencySectionFacts({ ...input, worldSeed });
    calibrationVersions.add(produced.report.manifest.matchTacticsCalibrationVersion);
    sets.push(evaluateCheckpointA2Set({ setName, report: produced.report, rows: produced.rows }));
    lowBlockAttributionFacts.push(
      runCheckpointA21({
        setName,
        worldSeed,
        worldCount: input.worldCount,
        seedPrefix: input.seedPrefix,
        pairedSeedCount: input.pairedSeedCount,
        currentLowBlock: produced.report.lowBlock,
      }),
    );
  }

  const counterfactual = runTacticalAgencyArchetypeCounterfactual({
    worldSeed: `${input.worldSeed}-001`,
    clubCount: TACTICAL_AGENCY_A2_COUNTERFACTUAL_CLUB_COUNT,
    identityKeys: [...GENERATED_SQUAD_IDENTITY_KEYS],
  });
  const movesShape = counterfactualMovesShape(counterfactual);

  const lowBlockAttribution = aggregateCheckpointA21Attribution(lowBlockAttributionFacts);

  if (calibrationVersions.size !== 1) {
    throw new Error(
      `A2 seed sets disagree about match-tactics calibration: ${[...calibrationVersions].join(", ")}`,
    );
  }
  const checkpoint: CheckpointA2Facts = {
    sets,
    counterfactual,
    counterfactualMovesShape: movesShape,
    lowBlockAttributionFacts,
    lowBlockAttribution,
    decision: decideCheckpointA2({
      sets,
      counterfactualMovesShape: movesShape,
      lowBlockAttribution,
    }),
    workerCount: input.workerCount,
  };
  return {
    checkpoint,
    calibrationVersions: { matchTactics: [...calibrationVersions][0] as string },
  };
}

/** Collapses per-set chart evidence without letting a passing set hide a failure. */
function aggregateCheckpointA21Attribution(
  reports: readonly CheckpointA21Facts[],
): CheckpointA21Attribution {
  const reproducedFailures = reports.filter((report) => {
    const current = report.arms[1];
    return current !== undefined && !current.guardrailHeld;
  });
  if (reproducedFailures.length === 0) return "not_reproduced";
  if (reproducedFailures.some((report) => report.attribution === "step_03a_chart")) {
    return "step_03a_chart";
  }

  return "legacy_chart_also_fails";
}

/** Runs every world, at most `workerCount` at a time, in stable seed order. */
async function runWorldsAcrossWorkers(
  worldSeeds: readonly string[],
  input: CreateTacticalAgencySectionInput,
): Promise<readonly TacticalAgencyWorldResult[]> {
  if (input.workerCount === 1) {
    return worldSeeds.map((worldSeed) =>
      runTacticalAgencyWorld({ worldSeed, roundCount: input.roundCount }));
  }

  const results: TacticalAgencyWorldResult[] = [];
  for (let start = 0; start < worldSeeds.length; start += input.workerCount) {
    const batch = worldSeeds.slice(start, start + input.workerCount);
    results.push(
      ...(await Promise.all(
        batch.map((worldSeed) =>
          runTacticalAgencyWorldInWorker({ worldSeed, roundCount: input.roundCount })),
      )),
    );
  }

  return results;
}

/**
 * The one calibration version every world was measured under.
 *
 * Refused rather than picked when the worlds disagree: a before-state whose
 * rows came from two different stamped assets describes no single game, and
 * this is the first phase where a tactic magnitude can move without an engine
 * change.
 */
function requiredCalibrationVersion(results: readonly TacticalAgencyWorldResult[]): string {
  const versions = new Set(results.map((result) => result.matchTacticsCalibrationVersion));
  if (versions.size !== 1) {
    throw new Error(`Worlds disagree about the match-tactics calibration: ${[...versions].join(", ")}`);
  }

  return [...versions][0] as string;
}

/** Adds the per-world role tables into one, keeping every role row. */
function mergeRoleSummaries(
  results: readonly TacticalAgencyWorldResult[],
): TacticalAgencyRoleSummary {
  const first = results[0];
  if (first === undefined) throw new Error("A before-state needs at least one world");
  if (results.length === 1) return first.roles;

  const counts = new Map(first.roles.roleShares.map((row) => [row.role, 0]));
  let playerCount = 0;
  let undeclaredRoleCount = 0;
  for (const result of results) {
    playerCount += result.roles.playerCount;
    undeclaredRoleCount += result.roles.undeclaredRoleCount;
    for (const row of result.roles.roleShares) {
      counts.set(row.role, (counts.get(row.role) ?? 0) + row.count);
    }
  }

  const declared = playerCount - undeclaredRoleCount;
  const roleShares = first.roles.roleShares.map((row) => {
    const count = counts.get(row.role) ?? 0;
    return { role: row.role, count, share: declared === 0 ? 0 : count / declared };
  });

  return {
    playerCount,
    roleShares,
    absentRoles: roleShares.filter((row) => row.count === 0).map((row) => row.role),
    undeclaredRoleCount,
  };
}
