import {
  LATERAL_FOCUSES,
  type LateralFocus,
} from "@game/domain";
import type { TacticalShapeProfile } from "@game/engine";

import {
  TACTICAL_AGENCY_B_TACTIC_KEYS,
  type TacticalAgencyAnalyticThreatComponents,
  type TacticalAgencyBTacticKey,
  type TacticalAgencyConditionedContextRow,
  type TacticalAgencyConditionedMatchupInput,
  type TacticalAgencyConditionedResponse,
} from "./tactical-agency-audit.ts";

/** Frozen B2.1 threshold for calling a real shape matchup laterally asymmetric. */
export const TACTICAL_AGENCY_B21_ASYMMETRY_BASIS_POINTS = 500;

/** Metadata retained beside one B2 matchup solely for observational joins. */
export interface TacticalAgencyConditionedAttributionMatchup
  extends TacticalAgencyConditionedMatchupInput {
  readonly worldSeed: string;
  readonly competitionId: string;
  readonly ownClubId: string;
  readonly opponentClubId: string;
  readonly ownIdentityKey: string;
  readonly opponentIdentityKey: string;
  readonly ownFormationKey: string;
  readonly opponentFormationKey: string;
}

/** Counts of canonical best-response IDs for one declared grouping key. */
export interface TacticalAgencyB21BestResponseGroup {
  readonly groupKey: string;
  readonly contextCount: number;
  readonly responseCounts: Readonly<Record<string, number>>;
}

/** Which focus wins after the tactic is held fixed. */
export interface TacticalAgencyB21TacticFocusRow {
  readonly tacticKey: TacticalAgencyBTacticKey;
  readonly contextCount: number;
  readonly asymmetricContextCount: number;
  readonly bestFocusCounts: Readonly<Record<LateralFocus, number>>;
  readonly asymmetricBestFocusCounts: Readonly<Record<LateralFocus, number>>;
  readonly asymmetricBalancedShare: number | "not_observed";
}

/** Which tactic wins after lateral focus is held fixed. */
export interface TacticalAgencyB21FocusTacticRow {
  readonly lateralFocus: LateralFocus;
  readonly contextCount: number;
  readonly bestTacticCounts: Readonly<Record<TacticalAgencyBTacticKey, number>>;
  readonly leadingTacticKey: TacticalAgencyBTacticKey;
  readonly leadingTacticShare: number;
}

export type TacticalAgencyB21ComponentKey =
  | "control"
  | "volume"
  | "route_pressure"
  | "lateral_allocation"
  | "route_quality";

/** Per-world high-press-minus-direct-play edge for one canonical factor. */
export interface TacticalAgencyB21ComponentWorldRow {
  readonly worldSeed: string;
  readonly componentKey: TacticalAgencyB21ComponentKey;
  readonly meanEdgeDelta: number;
}

/** One seed set's complete tactical attribution facts. */
export interface TacticalAgencyB21TacticalAttribution {
  readonly matchupCount: number;
  readonly materiallyAsymmetricMatchupCount: number;
  readonly contextCount: number;
  readonly reconciliationMismatchCount: number;
  readonly exactResponseCoverage: Readonly<Record<string, number>>;
  readonly exactLeadingResponseId: string;
  readonly exactLeadingResponseShare: number;
  readonly byOwnFormation: readonly TacticalAgencyB21BestResponseGroup[];
  readonly byOpponentFormation: readonly TacticalAgencyB21BestResponseGroup[];
  readonly byFormationPair: readonly TacticalAgencyB21BestResponseGroup[];
  readonly byOpponentResponse: readonly TacticalAgencyB21BestResponseGroup[];
  readonly withinTactic: readonly TacticalAgencyB21TacticFocusRow[];
  readonly withinFocus: readonly TacticalAgencyB21FocusTacticRow[];
  readonly componentWorldRows: readonly TacticalAgencyB21ComponentWorldRow[];
  readonly coherentPositiveComponentKeys: readonly TacticalAgencyB21ComponentKey[];
  readonly coherentNegativeComponentKeys: readonly TacticalAgencyB21ComponentKey[];
  readonly lateralRouteLeverageRuleHeld: boolean;
  readonly tacticMagnitudeRuleHeld: boolean;
  readonly interactionRuleHeld: boolean;
}

export type TacticalAgencyB21TacticalOwner =
  | "lateral_route_leverage"
  | "tactic_magnitude"
  | "interaction"
  | "mixed"
  | "unresolved";

/** Converts the four canonical left/right shape differences to basis points. */
export function tacticalAgencyShapeAsymmetryBasisPoints(
  ownShape: TacticalShapeProfile,
  opponentShape: TacticalShapeProfile,
): number {
  return Math.max(
    lateralDifferenceBasisPoints(ownShape, "progression"),
    lateralDifferenceBasisPoints(ownShape, "coverage"),
    lateralDifferenceBasisPoints(opponentShape, "progression"),
    lateralDifferenceBasisPoints(opponentShape, "coverage"),
  );
}

/** Reads only retained B2 rows; it never derives a second payoff. */
export function summarizeTacticalAgencyConditionedAttribution(input: {
  readonly responses: readonly TacticalAgencyConditionedResponse[];
  readonly matchups: readonly TacticalAgencyConditionedAttributionMatchup[];
  readonly contexts: readonly TacticalAgencyConditionedContextRow[];
}): TacticalAgencyB21TacticalAttribution {
  const responses = [...input.responses].sort((left, right) =>
    left.responseId.localeCompare(right.responseId));
  const matchupById = new Map(input.matchups.map((matchup) => [matchup.matchupId, matchup]));
  if (matchupById.size !== input.matchups.length) {
    throw new Error("B2.1 attribution received duplicate matchup IDs");
  }
  const asymmetricMatchupIds = new Set(input.matchups.flatMap((matchup) =>
    tacticalAgencyShapeAsymmetryBasisPoints(matchup.ownShape, matchup.opponentShape)
      >= TACTICAL_AGENCY_B21_ASYMMETRY_BASIS_POINTS
      ? [matchup.matchupId]
      : []));
  const exactCoverage = new Map<string, number>();
  const ownFormationGroups = new Map<string, Map<string, number>>();
  const opponentFormationGroups = new Map<string, Map<string, number>>();
  const formationPairGroups = new Map<string, Map<string, number>>();
  const opponentResponseGroups = new Map<string, Map<string, number>>();
  const tacticFocusCounts = new Map<TacticalAgencyBTacticKey, Map<LateralFocus, number>>();
  const tacticAsymmetricFocusCounts = new Map<TacticalAgencyBTacticKey, Map<LateralFocus, number>>();
  const focusTacticCounts = new Map<LateralFocus, Map<TacticalAgencyBTacticKey, number>>();
  const componentWorldValues = new Map<string, Map<TacticalAgencyB21ComponentKey, number[]>>();
  let reconciliationMismatchCount = 0;

  for (const context of input.contexts) {
    const matchup = matchupById.get(context.matchupId);
    if (matchup === undefined) throw new Error(`B2.1 cannot join matchup ${context.matchupId}`);
    for (const candidate of context.candidates) {
      if (!candidateReconciles(candidate)) reconciliationMismatchCount += 1;
    }
    const exact = bestCandidate(context, responses);
    increment(exactCoverage, exact.responseId);
    incrementNested(ownFormationGroups, matchup.ownFormationKey, exact.responseId);
    incrementNested(opponentFormationGroups, matchup.opponentFormationKey, exact.responseId);
    incrementNested(
      formationPairGroups,
      `${matchup.ownFormationKey}|${matchup.opponentFormationKey}`,
      exact.responseId,
    );
    incrementNested(opponentResponseGroups, context.opponentResponseId, exact.responseId);

    for (const tacticKey of TACTICAL_AGENCY_B_TACTIC_KEYS) {
      const best = bestCandidate(
        context,
        responses.filter((response) => response.tacticKey === tacticKey),
      );
      incrementNested(tacticFocusCounts, tacticKey, best.lateralFocus);
      if (asymmetricMatchupIds.has(context.matchupId)) {
        incrementNested(tacticAsymmetricFocusCounts, tacticKey, best.lateralFocus);
      }
    }
    for (const lateralFocus of LATERAL_FOCUSES) {
      const best = bestCandidate(
        context,
        responses.filter((response) => response.lateralFocus === lateralFocus),
      );
      incrementNested(focusTacticCounts, lateralFocus, best.tacticKey);
    }

    const highPress = candidateById(context, "high_pressing|balanced");
    const directPlay = candidateById(context, "direct_play|balanced");
    const worldValues = componentWorldValues.get(matchup.worldSeed) ?? new Map();
    for (const componentKey of COMPONENT_KEYS) {
      const values = worldValues.get(componentKey) ?? [];
      values.push(componentEdge(highPress, componentKey) - componentEdge(directPlay, componentKey));
      worldValues.set(componentKey, values);
    }
    componentWorldValues.set(matchup.worldSeed, worldValues);
  }

  const withinTactic = TACTICAL_AGENCY_B_TACTIC_KEYS.map((tacticKey) => {
    const all = completeFocusCounts(tacticFocusCounts.get(tacticKey));
    const asymmetric = completeFocusCounts(tacticAsymmetricFocusCounts.get(tacticKey));
    const asymmetricContextCount = sumCounts(asymmetric);
    return {
      tacticKey,
      contextCount: sumCounts(all),
      asymmetricContextCount,
      bestFocusCounts: all,
      asymmetricBestFocusCounts: asymmetric,
      asymmetricBalancedShare: asymmetricContextCount === 0
        ? "not_observed" as const
        : asymmetric.balanced / asymmetricContextCount,
    };
  });
  const withinFocus = LATERAL_FOCUSES.map((lateralFocus) => {
    const counts = completeTacticCounts(focusTacticCounts.get(lateralFocus));
    const ordered = TACTICAL_AGENCY_B_TACTIC_KEYS.map((tacticKey) => ({
      tacticKey,
      count: counts[tacticKey],
    })).sort((left, right) => right.count - left.count
      || left.tacticKey.localeCompare(right.tacticKey));
    const leading = ordered[0] as typeof ordered[number];
    const contextCount = sumCounts(counts);
    return {
      lateralFocus,
      contextCount,
      bestTacticCounts: counts,
      leadingTacticKey: leading.tacticKey,
      leadingTacticShare: contextCount === 0 ? 0 : leading.count / contextCount,
    };
  });
  const exactOrdered = [...exactCoverage].sort(([leftId, leftCount], [rightId, rightCount]) =>
    rightCount - leftCount || leftId.localeCompare(rightId));
  const exactLeader = exactOrdered[0];
  if (exactLeader === undefined) throw new Error("B2.1 attribution has no contexts");
  const componentWorldRows = [...componentWorldValues].sort(([left], [right]) =>
    left.localeCompare(right)).flatMap(([worldSeed, values]) => COMPONENT_KEYS.map((componentKey) => ({
      worldSeed,
      componentKey,
      meanEdgeDelta: mean(values.get(componentKey) ?? []),
    })));
  const coherentPositiveComponentKeys = COMPONENT_KEYS.filter((componentKey) =>
    componentWorldRows.filter((row) =>
      row.componentKey === componentKey && row.meanEdgeDelta > 0).length >= 5);
  const coherentNegativeComponentKeys = COMPONENT_KEYS.filter((componentKey) =>
    componentWorldRows.filter((row) =>
      row.componentKey === componentKey && row.meanEdgeDelta < 0).length >= 5);
  const tacticMagnitudeRuleHeld = commonTacticMagnitude(withinFocus) !== null;
  const lateralRouteLeverageRuleHeld = !tacticMagnitudeRuleHeld
    && withinTactic.filter(({ asymmetricBalancedShare }) =>
      asymmetricBalancedShare !== "not_observed" && asymmetricBalancedShare >= 0.8).length >= 2;
  const exactLeadingResponseShare = exactLeader[1] / input.contexts.length;
  const interactionRuleHeld = !tacticMagnitudeRuleHeld
    && !lateralRouteLeverageRuleHeld
    && exactLeadingResponseShare >= 0.6;

  return {
    matchupCount: input.matchups.length,
    materiallyAsymmetricMatchupCount: asymmetricMatchupIds.size,
    contextCount: input.contexts.length,
    reconciliationMismatchCount,
    exactResponseCoverage: sortedRecord(exactCoverage),
    exactLeadingResponseId: exactLeader[0],
    exactLeadingResponseShare,
    byOwnFormation: groupedRows(ownFormationGroups),
    byOpponentFormation: groupedRows(opponentFormationGroups),
    byFormationPair: groupedRows(formationPairGroups),
    byOpponentResponse: groupedRows(opponentResponseGroups),
    withinTactic,
    withinFocus,
    componentWorldRows,
    coherentPositiveComponentKeys,
    coherentNegativeComponentKeys,
    lateralRouteLeverageRuleHeld,
    tacticMagnitudeRuleHeld,
    interactionRuleHeld,
  };
}

/** Applies the predeclared both-set rule; disagreement is evidence, not a tie-break. */
export function decideTacticalAgencyConditionedOwner(
  sets: readonly TacticalAgencyB21TacticalAttribution[],
): TacticalAgencyB21TacticalOwner {
  if (sets.length !== 2 || sets.some(({ reconciliationMismatchCount }) => reconciliationMismatchCount > 0)) {
    return "unresolved";
  }
  const candidates: TacticalAgencyB21TacticalOwner[] = [
    ...(sets.every(({ lateralRouteLeverageRuleHeld }) => lateralRouteLeverageRuleHeld)
      ? ["lateral_route_leverage" as const] : []),
    ...(sets.every(({ tacticMagnitudeRuleHeld }) => tacticMagnitudeRuleHeld)
      ? ["tactic_magnitude" as const] : []),
    ...(sets.every(({ interactionRuleHeld }) => interactionRuleHeld)
      ? ["interaction" as const] : []),
  ];
  if (candidates.length === 1) return candidates[0] as TacticalAgencyB21TacticalOwner;
  const anySignal = sets.some((set) =>
    set.lateralRouteLeverageRuleHeld || set.tacticMagnitudeRuleHeld || set.interactionRuleHeld);
  return candidates.length > 1 || anySignal ? "mixed" : "unresolved";
}

/** First ordered factor whose high-press edge has the same sign in both sets. */
export function firstCoherentTacticalAgencyComponent(
  sets: readonly TacticalAgencyB21TacticalAttribution[],
): TacticalAgencyB21ComponentKey | "none" {
  for (const componentKey of COMPONENT_KEYS) {
    if (sets.every(({ coherentPositiveComponentKeys }) =>
      coherentPositiveComponentKeys.includes(componentKey))) return componentKey;
    if (sets.every(({ coherentNegativeComponentKeys }) =>
      coherentNegativeComponentKeys.includes(componentKey))) return componentKey;
  }
  return "none";
}

const COMPONENT_KEYS = [
  "control",
  "volume",
  "route_pressure",
  "lateral_allocation",
  "route_quality",
] as const satisfies readonly TacticalAgencyB21ComponentKey[];

function lateralDifferenceBasisPoints(
  shape: TacticalShapeProfile,
  kind: "progression" | "coverage",
): number {
  const left = kind === "progression" ? shape.capacities.left_progression : shape.capacities.left_coverage;
  const right = kind === "progression" ? shape.capacities.right_progression : shape.capacities.right_coverage;
  return Math.round(Math.abs(left - right) * 10_000);
}

function bestCandidate(
  context: TacticalAgencyConditionedContextRow,
  responses: readonly TacticalAgencyConditionedResponse[],
): TacticalAgencyConditionedResponse {
  const ordered = [...responses].sort((left, right) => left.responseId.localeCompare(right.responseId));
  const first = ordered[0];
  if (first === undefined) throw new Error("B2.1 best-response subset is empty");
  let best = first;
  let bestPayoff = candidateById(context, best.responseId).payoffBasisPoints;
  for (const response of ordered.slice(1)) {
    const payoff = candidateById(context, response.responseId).payoffBasisPoints;
    if (payoff > bestPayoff) {
      best = response;
      bestPayoff = payoff;
    }
  }
  return best;
}

function candidateById(
  context: TacticalAgencyConditionedContextRow,
  responseId: string,
): TacticalAgencyConditionedContextRow["candidates"][number] {
  const candidate = context.candidates.find(({ actionId }) => actionId === responseId);
  if (candidate === undefined) throw new Error(`B2.1 context ${context.contextId} omits ${responseId}`);
  return candidate;
}

function candidateReconciles(candidate: TacticalAgencyConditionedContextRow["candidates"][number]): boolean {
  const ownThreat = threatFromComponents(candidate.ownThreat);
  const opponentThreat = threatFromComponents(candidate.opponentThreat);
  const total = ownThreat + opponentThreat;
  const payoff = Math.round((total === 0 ? 0.5 : ownThreat / total) * 10_000);
  return Object.is(ownThreat, candidate.ownThreat.threat)
    && Object.is(opponentThreat, candidate.opponentThreat.threat)
    && payoff === candidate.payoffBasisPoints;
}

function threatFromComponents(components: TacticalAgencyAnalyticThreatComponents): number {
  return Math.max(
    0,
    components.routePressure
      * components.volumeMultiplier
      * components.effectiveControl
      * components.expectedRouteQuality,
  );
}

function componentEdge(
  candidate: TacticalAgencyConditionedContextRow["candidates"][number],
  componentKey: TacticalAgencyB21ComponentKey,
): number {
  return componentValue(candidate.ownThreat, componentKey)
    - componentValue(candidate.opponentThreat, componentKey);
}

function componentValue(
  components: TacticalAgencyAnalyticThreatComponents,
  componentKey: TacticalAgencyB21ComponentKey,
): number {
  if (componentKey === "control") return components.effectiveControl;
  if (componentKey === "volume") return components.volumeMultiplier;
  if (componentKey === "route_pressure") return components.routePressure;
  if (componentKey === "lateral_allocation") {
    return components.leftAllocation + components.rightAllocation;
  }
  return components.expectedRouteQuality;
}

function commonTacticMagnitude(
  rows: readonly TacticalAgencyB21FocusTacticRow[],
): TacticalAgencyBTacticKey | null {
  for (const tacticKey of TACTICAL_AGENCY_B_TACTIC_KEYS) {
    if (rows.every((row) =>
      row.leadingTacticKey === tacticKey && row.leadingTacticShare >= 0.8)) return tacticKey;
  }
  return null;
}

function completeFocusCounts(
  source: ReadonlyMap<LateralFocus, number> | undefined,
): Readonly<Record<LateralFocus, number>> {
  return Object.fromEntries(
    LATERAL_FOCUSES.map((focus) => [focus, source?.get(focus) ?? 0]),
  ) as Readonly<Record<LateralFocus, number>>;
}

function completeTacticCounts(
  source: ReadonlyMap<TacticalAgencyBTacticKey, number> | undefined,
): Readonly<Record<TacticalAgencyBTacticKey, number>> {
  return Object.fromEntries(
    TACTICAL_AGENCY_B_TACTIC_KEYS.map((tactic) => [tactic, source?.get(tactic) ?? 0]),
  ) as Readonly<Record<TacticalAgencyBTacticKey, number>>;
}

function increment<K>(target: Map<K, number>, key: K): void {
  target.set(key, (target.get(key) ?? 0) + 1);
}

function incrementNested<Outer, Inner>(
  target: Map<Outer, Map<Inner, number>>,
  outer: Outer,
  inner: Inner,
): void {
  const counts = target.get(outer) ?? new Map<Inner, number>();
  increment(counts, inner);
  target.set(outer, counts);
}

function groupedRows(
  groups: ReadonlyMap<string, ReadonlyMap<string, number>>,
): readonly TacticalAgencyB21BestResponseGroup[] {
  return [...groups].sort(([left], [right]) => left.localeCompare(right)).map(([groupKey, counts]) => ({
    groupKey,
    contextCount: sumCounts(counts),
    responseCounts: sortedRecord(counts),
  }));
}

function sortedRecord<K extends string>(counts: ReadonlyMap<K, number>): Readonly<Record<K, number>> {
  return Object.fromEntries(
    [...counts].sort(([left], [right]) => left.localeCompare(right)),
  ) as Readonly<Record<K, number>>;
}

function sumCounts(counts: Readonly<Record<string, number>> | ReadonlyMap<unknown, number>): number {
  return counts instanceof Map
    ? [...counts.values()].reduce((sum, value) => sum + value, 0)
    : Object.values(counts).reduce((sum, value) => sum + value, 0);
}

function mean(values: readonly number[]): number {
  return values.length === 0 ? 0 : values.reduce((sum, value) => sum + value, 0) / values.length;
}
