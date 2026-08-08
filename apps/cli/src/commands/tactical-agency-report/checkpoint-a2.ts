/**
 * Checkpoint A2 assembly and rendering.
 *
 * Separate from the Step 02 command because A2 is a *decision* document and the
 * before-state is a measurement: this file evaluates frozen targets and says
 * pass or fail, which the before-state command deliberately never does.
 *
 * Every gate here is written exactly as
 * `docs/steps/81a-.../03b-checkpoint-a2-real-career-squad-identity.md` froze it
 * before Step 03A was implemented. Nothing in this file may be edited to make a
 * run pass; a target that stops passing at higher resolution was passing on
 * resolution.
 */
import { GENERATED_SQUAD_IDENTITY_KEYS } from "@game/content";
import {
  summarizeTacticalAgencySquadIdentities,
  tacticalAgencyReorderInvariantShare,
  type TacticalAgencyAuditReport,
  type TacticalAgencySelectionRow,
  type TacticalAgencySquadIdentitySummary,
} from "@game/simulation-tools";

import type { TacticalAgencyCounterfactualResult } from "./agency-world.ts";

/** The frozen A2 targets, as written in the step document. */
export const CHECKPOINT_A2_TARGETS = {
  maximumTopFormationShare: 0.5,
  minimumDistinctFormationCount: 6,
  requiredPositiveRoleCount: 10,
  minimumDistinctModalShapes: 3,
  requiredReorderInvariantShare: 1,
  maximumMeanOutOfPositionSlots: 0,
} as const;

/** One seed set's evaluation against every primary gate. */
export interface CheckpointA2SetEvaluation {
  /** Which set this is, so a row can never be read as the other one. */
  readonly setName: string;
  readonly worldSeeds: readonly string[];
  readonly selectionCount: number;
  readonly topFormationShare: number;
  readonly distinctFormationCount: number;
  readonly positiveRoleCount: number;
  readonly reorderInvariantShare: number;
  readonly meanOutOfPositionSlots: number;
  readonly identities: TacticalAgencySquadIdentitySummary;
  /** Per-gate verdicts, in the step document's order. */
  readonly gates: readonly CheckpointA2GateVerdict[];
  /**
   * Non-regression guardrails, kept apart from the gates on purpose.
   *
   * These were already passing in the before-state. They may **never** be cited
   * as evidence that this step improved anything; they exist so it cannot make
   * anything worse. Mixing them into `gates` would invite exactly that citation.
   */
  readonly guardrails: readonly CheckpointA2GateVerdict[];
  /** Whether every gate on this set passed. */
  readonly passed: boolean;
  /** Whether every guardrail on this set still held. */
  readonly guardrailsHeld: boolean;
}

/** One gate, its observed value, and whether it cleared. */
export interface CheckpointA2GateVerdict {
  readonly gate: string;
  readonly observed: string;
  readonly target: string;
  readonly passed: boolean;
}

/** What the chart-only A2.1 ablation can establish. */
export type CheckpointA21Attribution =
  | "step_03a_chart"
  | "legacy_chart_also_fails"
  | "not_reproduced";

/** One arm of the A2.1 low-block chart comparison. */
export interface CheckpointA21Arm {
  readonly armName: string;
  readonly worldSeeds: readonly string[];
  readonly concededExpectedGoalsReduction: number;
  readonly ownLossPerConcededReduction: number | "no_reduction";
  readonly guardrailHeld: boolean;
}

/** Both chart arms on one seed set, and the narrow attribution they support. */
export interface CheckpointA21Report {
  readonly setName: string;
  readonly arms: readonly [CheckpointA21Arm, CheckpointA21Arm];
  readonly attribution: CheckpointA21Attribution;
}

/** The complete checkpoint: both sets, the counterfactual, and the decision. */
export interface CheckpointA2Report {
  readonly sets: readonly CheckpointA2SetEvaluation[];
  readonly counterfactual: TacticalAgencyCounterfactualResult;
  /** Whether changing only the archetype mix moved every tested club's shape. */
  readonly counterfactualMovesShape: boolean;
  /** The coupled chart comparisons from which the attribution is derived. */
  readonly lowBlockAttributionReports: readonly CheckpointA21Report[];
  /** What Checkpoint A2.1 established about the chart component of Step 03A. */
  readonly lowBlockAttribution: CheckpointA21Attribution;
  readonly decision: "GO" | "REFINE" | "STOP_RETHINK";
  readonly workerCount: number;
}

/**
 * Evaluates one seed set against the frozen gates.
 *
 * The identity coverage gate is evaluated per set rather than pooled: an
 * identity that appeared only in the in-sample set was still never observed
 * out-of-sample, and pooling would let one set cover for the other.
 */
export function evaluateCheckpointA2Set(input: {
  readonly setName: string;
  readonly report: TacticalAgencyAuditReport;
  readonly rows: readonly TacticalAgencySelectionRow[];
}): CheckpointA2SetEvaluation {
  const { selections, roles } = input.report;
  const identities = summarizeTacticalAgencySquadIdentities(
    input.rows,
    [...GENERATED_SQUAD_IDENTITY_KEYS],
  );
  const positiveRoleCount = roles.roleShares.filter((row) => row.count > 0).length;
  const reorderInvariantShare = tacticalAgencyReorderInvariantShare(selections);

  const gates: CheckpointA2GateVerdict[] = [
    {
      gate: "topFormationShare",
      observed: selections.topFormationShare.toFixed(4),
      target: `<= ${CHECKPOINT_A2_TARGETS.maximumTopFormationShare}`,
      passed: selections.topFormationShare <= CHECKPOINT_A2_TARGETS.maximumTopFormationShare,
    },
    {
      gate: "distinctFormationCount",
      observed: String(selections.distinctFormationCount),
      target: `>= ${CHECKPOINT_A2_TARGETS.minimumDistinctFormationCount}`,
      passed:
        selections.distinctFormationCount >= CHECKPOINT_A2_TARGETS.minimumDistinctFormationCount,
    },
    {
      gate: "primaryRolesWithPositiveCount",
      observed: `${positiveRoleCount} of ${roles.roleShares.length}`,
      target: `= ${CHECKPOINT_A2_TARGETS.requiredPositiveRoleCount}`,
      passed: positiveRoleCount === CHECKPOINT_A2_TARGETS.requiredPositiveRoleCount,
    },
    {
      gate: "distinctModalShapesAcrossIdentities",
      observed: String(identities.distinctModalFormationCount),
      target: `>= ${CHECKPOINT_A2_TARGETS.minimumDistinctModalShapes}`,
      // `not_evaluated` is not a pass: an unobserved identity may not be used to
      // clear a distinctness gate, so any unevaluated identity fails this row
      // whatever the count of observed ones is.
      passed:
        identities.unevaluatedIdentityKeys.length === 0
        && identities.distinctModalFormationCount
          >= CHECKPOINT_A2_TARGETS.minimumDistinctModalShapes,
    },
    {
      gate: "catalogReorderInvariance",
      observed: reorderInvariantShare.toFixed(4),
      target: `= ${CHECKPOINT_A2_TARGETS.requiredReorderInvariantShare}`,
      passed: reorderInvariantShare === CHECKPOINT_A2_TARGETS.requiredReorderInvariantShare,
    },
    {
      gate: "meanOutOfPositionSlots",
      observed: selections.meanOutOfPositionSlots.toFixed(4),
      target: `<= ${CHECKPOINT_A2_TARGETS.maximumMeanOutOfPositionSlots}`,
      passed:
        selections.meanOutOfPositionSlots <= CHECKPOINT_A2_TARGETS.maximumMeanOutOfPositionSlots,
    },
    {
      gate: "squadIdentitiesObserved",
      observed: `${GENERATED_SQUAD_IDENTITY_KEYS.length - identities.unevaluatedIdentityKeys.length}`
        + ` of ${GENERATED_SQUAD_IDENTITY_KEYS.length}`,
      target: `= ${GENERATED_SQUAD_IDENTITY_KEYS.length}`,
      passed: identities.unevaluatedIdentityKeys.length === 0,
    },
  ];

  const { lowBlock } = input.report;
  const exchangeRate = lowBlock.ownLossPerConcededReduction;
  const guardrails: CheckpointA2GateVerdict[] = [
    {
      gate: "concededExpectedGoalsReduction",
      observed: lowBlock.concededExpectedGoalsReduction.toFixed(4),
      target: ">= 0.08",
      passed: lowBlock.concededExpectedGoalsReduction >= 0.08,
    },
    {
      gate: "ownLossPerConcededReduction",
      observed: typeof exchangeRate === "number" ? exchangeRate.toFixed(4) : exchangeRate,
      target: "<= 2.0",
      // `no_reduction` means the block bought nothing, so there is no exchange
      // rate to be inside the band. It fails rather than passing vacuously.
      passed: typeof exchangeRate === "number" && exchangeRate <= 2,
    },
  ];

  return {
    setName: input.setName,
    worldSeeds: input.report.manifest.worldSeeds,
    selectionCount: selections.selectionCount,
    topFormationShare: selections.topFormationShare,
    distinctFormationCount: selections.distinctFormationCount,
    positiveRoleCount,
    reorderInvariantShare,
    meanOutOfPositionSlots: selections.meanOutOfPositionSlots,
    identities,
    gates,
    guardrails,
    passed: gates.every((gate) => gate.passed),
    guardrailsHeld: guardrails.every((guardrail) => guardrail.passed),
  };
}

/**
 * Records the checkpoint decision from the evaluations and the counterfactual.
 *
 * `GO` needs every gate on **both** sets plus a counterfactual that moved the
 * shape. Anything else is at most `REFINE`, and a counterfactual that did not
 * move the shape is `STOP_RETHINK` however well the gates read: it would mean
 * the variety arrived without squad identity causing it, which is the premise
 * this phase has already had falsified once.
 */
export function decideCheckpointA2(input: {
  readonly sets: readonly CheckpointA2SetEvaluation[];
  readonly counterfactualMovesShape: boolean;
  /** What A2.1 established about Step 03A's chart component. */
  readonly lowBlockAttribution: CheckpointA21Attribution;
}): "GO" | "REFINE" | "STOP_RETHINK" {
  if (!input.counterfactualMovesShape) return "STOP_RETHINK";
  if (!input.sets.every((set) => set.passed)) return "REFINE";

  // A chart-only regression still belongs to 03A. When the legacy chart also
  // fails on the current ability vectors, A2's squad-identity result may move
  // into Steps 04-05, but Step 05 must repair the live low-block band before
  // Checkpoint B or anything after it can open.
  if (input.sets.every((set) => set.guardrailsHeld)) return "GO";

  return input.lowBlockAttribution === "legacy_chart_also_fails" ? "GO" : "REFINE";
}

/**
 * Whether the counterfactual demonstrated causality.
 *
 * The step document says "changing only the archetype mix must move the chosen
 * shape" without a number, so the reading adopted here - **before the run** - is
 * the strict one: every club tested must produce more than one shape across the
 * eight identities. One club moving while the rest stay put would show that the
 * mix *can* matter, not that it does.
 */
export function counterfactualMovesShape(
  counterfactual: TacticalAgencyCounterfactualResult,
): boolean {
  return counterfactual.clubCount > 0
    && counterfactual.clubsWhoseShapeMoved === counterfactual.clubCount;
}

/** Renders the checkpoint as its frozen Markdown document. */
export function formatCheckpointA2Report(report: CheckpointA2Report): string {
  const hasConditionalLowBlockHandoff =
    report.decision === "GO"
    && report.lowBlockAttribution === "legacy_chart_also_fails"
    && report.sets.some((set) => !set.guardrailsHeld);
  const lines: string[] = [
    "# Phase 81A - Checkpoint A2: Real-Career Squad Identity",
    "",
    `- decision: **${report.decision}**`,
    `- low-block guardrail attribution (A2.1): **${report.lowBlockAttribution}**`,
    `- workers: ${report.workerCount}`,
    `- targets: frozen in \`03b-checkpoint-a2-real-career-squad-identity.md\` before Step 03A`,
    "",
    "## Decision",
    "",
    report.decision === "GO"
      ? "Every primary gate passed on both seed sets and the archetype-mix"
        + " counterfactual moved the chosen shape."
        + (hasConditionalLowBlockHandoff
          ? " **Only Steps 04-05 open.** Checkpoint A2.1 found that the legacy chart"
            + " also fails on the same Phase 81A-generated ability vectors, so the"
            + " chart component is not the demonstrated cause. It does not recreate"
            + " the pre-81A role-conditioned ability population and therefore does"
            + " not absolve the whole generation change. The live low-block band"
            + " remains broken; Step 05 must repair it on both seed sets before Step"
            + " 06 or anything after it opens."
          : " Steps 04-16 open.")
      : report.decision === "REFINE"
        ? "The counterfactual holds, but at least one gate failed on at least one"
          + " seed set. Only Step 03A reopens; targets do not move."
        : "Changing only the archetype mix did not move the chosen shape."
          + " Variety, if present, did not arrive through squad identity.",
    "",
    "## Causality: Archetype-Mix Counterfactual",
    "",
    "Squad quality held constant. Each club's twenty-two footballers keep their",
    "ability, age, condition and contract, and are re-roled onto each identity's",
    "chart. Only the roles change.",
    "",
    `- world: \`${report.counterfactual.worldSeed}\``,
    `- clubs tested: ${report.counterfactual.clubCount}`,
    `- clubs whose shape moved: ${report.counterfactual.clubsWhoseShapeMoved}`,
    `- distinct shapes per club: ${report.counterfactual.distinctShapeCountByClub.join(", ")}`,
    `- moves the shape: **${String(report.counterfactualMovesShape)}**`,
    "",
    "| club | identity | chosen shape |",
    "|---|---|---|",
    ...report.counterfactual.rows.map((row) =>
      `| \`${row.clubId}\` | \`${row.squadIdentityKey}\` | \`${row.formationKey}\` |`),
    "",
  ];

  for (const set of report.sets) {
    lines.push(
      `## Seed Set: ${set.setName}`,
      "",
      `- worlds: ${set.worldSeeds.length}`,
      `- selections: ${set.selectionCount}`,
      `- all gates passed: **${String(set.passed)}**`,
      `- all guardrails held: **${String(set.guardrailsHeld)}**`,
      "",
      "| gate | observed | target | passed |",
      "|---|---:|---|---|",
      ...set.gates.map((gate) =>
        `| \`${gate.gate}\` | ${gate.observed} | ${gate.target} | ${gate.passed ? "yes" : "**no**"} |`),
      "",
      "Non-regression guardrails. Already passing in the before-state, and never",
      "evidence that this step improved anything - they exist so it cannot make",
      "anything worse.",
      "",
      "| guardrail | observed | target | held |",
      "|---|---:|---|---|",
      ...set.guardrails.map((guardrail) =>
        `| \`${guardrail.gate}\` | ${guardrail.observed} | ${guardrail.target} `
          + `| ${guardrail.passed ? "yes" : "**no**"} |`),
      "",
      "| squad identity | selections | modal shape | modal count |",
      "|---|---:|---|---:|",
      ...set.identities.rows.map((row) =>
        `| \`${row.squadIdentityKey}\` | ${row.selectionCount} | \`${row.modalFormationKey}\` `
          + `| ${row.modalFormationCount} |`),
      "",
      `- unattributed selections: ${set.identities.unattributedSelectionCount}`,
      "",
    );
  }

  return `${lines.join("\n")}\n`;
}
