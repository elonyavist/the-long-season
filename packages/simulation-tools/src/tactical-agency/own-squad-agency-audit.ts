import {
  OWN_SQUAD_TACTIC_PROFILE_KEYS,
  type FixtureId,
  type LateralFocus,
  type MatchTacticsCalibrationConfig,
} from "@game/domain";
import {
  simulateMatch,
  type MatchEngineConfig,
  type MatchTeamContext,
  type OwnSquadTacticalPolicyCandidate,
  type OwnSquadTacticalPolicyEvaluation,
} from "@game/engine";
import { deriveRng } from "@game/shared";

/** Frozen contract stamp for Phase 81A Checkpoint D2. */
export const OWN_SQUAD_AGENCY_AUDIT_VERSION = "phase81a-checkpoint-d2-v1";

/** Product and control policies compared on each paired fixture seed. */
export const OWN_SQUAD_AGENCY_ARMS = [
  "own_fit",
  "mismatch",
  "non_commit",
  "blind",
] as const;
export type OwnSquadAgencyArm = typeof OWN_SQUAD_AGENCY_ARMS[number];

/** One canonical fixture as seen from the sampled club. */
export interface OwnSquadAgencyFixtureInput {
  readonly fixtureId: FixtureId;
  readonly formationKey: string;
  readonly controlledSide: "home" | "away";
  readonly controlled: MatchTeamContext;
  readonly opponent: MatchTeamContext;
  readonly opponentLateralFocus: LateralFocus;
  /** The production evaluation emitted with this exact controlled selection. */
  readonly evaluation: OwnSquadTacticalPolicyEvaluation;
}

/** One sampled club's complete opening-snapshot league schedule. */
export interface OwnSquadAgencyScheduleInput {
  readonly scheduleId: string;
  readonly worldSeed: string;
  readonly clubId: string;
  readonly squadIdentityKey: string;
  readonly fixtures: readonly OwnSquadAgencyFixtureInput[];
  readonly engineConfig: MatchEngineConfig;
  readonly matchTacticsCalibration: MatchTacticsCalibrationConfig;
  readonly matchSeedPrefix: string;
  readonly pairedSeedCount: number;
}

/** Canonical mean season facts for one arm over the eight paired seeds. */
export interface OwnSquadAgencySeasonFacts {
  readonly points: number;
  readonly opportunitiesFor: number;
  readonly opportunitiesAgainst: number;
  readonly expectedGoalsFor: number;
  readonly expectedGoalsAgainst: number;
  readonly goalsFor: number;
  readonly goalsAgainst: number;
}

/** Paired canonical match facts for one whole club schedule. */
export interface OwnSquadAgencyScheduleResult {
  readonly scheduleId: string;
  readonly worldSeed: string;
  readonly clubId: string;
  readonly squadIdentityKey: string;
  readonly fixtureCount: number;
  readonly matchesPerArm: number;
  readonly meanSeasonFactsByArm: Readonly<Record<OwnSquadAgencyArm, OwnSquadAgencySeasonFacts>>;
  readonly ownPolicyIds: readonly string[];
  readonly formationKeys: readonly string[];
  readonly tiedAtBestCount: number;
}

/** Deterministic schedule-level bootstrap interval. */
export interface OwnSquadAgencyConfidenceInterval {
  readonly lower95: number;
  readonly upper95: number;
  readonly resampleUnit: "whole_club_schedule";
  readonly resampleCount: number;
}

/** One arm's population-weighted paired season-point reading. */
export interface OwnSquadAgencyArmSummary {
  readonly arm: OwnSquadAgencyArm;
  readonly meanSeasonPointDelta: number;
  readonly confidenceInterval: OwnSquadAgencyConfidenceInterval;
}

/** Arms whose deliberate direction can attribute match translation. */
export type OwnSquadAgencyTranslationArm = "own_fit" | "mismatch";

/** One paired channel estimate against non-commitment. */
export interface OwnSquadAgencyChannelEstimate {
  readonly meanDelta: number;
  readonly confidenceInterval: OwnSquadAgencyConfidenceInterval;
}

/** Volume/quality diagnostics and causal channel estimates for one arm. */
export interface OwnSquadAgencyTranslationArmSummary {
  readonly arm: OwnSquadAgencyTranslationArm;
  readonly netExpectedGoals: OwnSquadAgencyChannelEstimate;
  readonly goalDifference: OwnSquadAgencyChannelEstimate;
  readonly diagnostics: {
    readonly netOpportunityDelta: number;
    readonly attackingExpectedGoalsPerOpportunityDelta: number;
    readonly concededExpectedGoalsPerOpportunityDelta: number;
  };
}

/** First unestablished causal stage inside one independently decided set. */
export type OwnSquadAgencyTranslationStage =
  | "plan_execution_not_established"
  | "xg_to_goal_resolution"
  | "goal_to_points_resolution"
  | "no_break";

/** Translation result for one seed set. */
export interface OwnSquadAgencyTranslationSetSummary {
  readonly arms: readonly OwnSquadAgencyTranslationArmSummary[];
  readonly firstFailedStage: OwnSquadAgencyTranslationStage;
}

/** Cross-set attribution; disagreement never selects a gameplay owner. */
export type OwnSquadAgencyTranslationAttribution =
  | Exclude<OwnSquadAgencyTranslationStage, "no_break">
  | "mixed_not_attributed"
  | "no_break";

/** Diversity and provenance facts read from the same canonical evaluations. */
export interface OwnSquadAgencyPolicySummary {
  readonly selectedProfileCounts: Readonly<Record<string, number>>;
  readonly selectedFocusCounts: Readonly<Record<string, number>>;
  readonly modalPolicyByIdentity: Readonly<Record<string, string | "not_evaluated">>;
  readonly distinctModalPolicyCount: number;
  readonly maximumModalPolicyShare: number;
  readonly reorderInvariantShare: number;
  readonly inputSourceKeys: readonly ["selected_shape_capacities", "versioned_policy_content"];
  readonly opponentSourceReadCount: 0;
}

/** External readers supplied by the composition root, never recreated here. */
export interface OwnSquadAgencyGuardrails {
  readonly a2FormationAndRoleHeld: boolean;
  readonly noDominantReadersHeld: boolean;
  readonly historicalFootballHeld: boolean;
  readonly renewal: "not_evaluated";
  readonly failed: readonly string[];
}

/** Complete independently decided set result. */
export interface OwnSquadAgencySetResult {
  readonly setName: string;
  readonly worldSeeds: readonly string[];
  readonly scheduleCount: number;
  readonly fixtureCount: number;
  readonly matchesPerArm: number;
  readonly arms: readonly OwnSquadAgencyArmSummary[];
  readonly translation: OwnSquadAgencyTranslationSetSummary;
  readonly ownFitMinusMismatch: number;
  readonly policy: OwnSquadAgencyPolicySummary;
  readonly constantQualityPolicyMoves: number;
  readonly constantQualityClubCount: number;
  readonly guardrails: OwnSquadAgencyGuardrails;
  readonly failed: readonly string[];
  readonly decision: "GO" | "REFINE" | "STOP_RETHINK";
}

/** Plays every arm on the same fixture identities and RNG seeds. */
export function runOwnSquadAgencySchedule(
  input: OwnSquadAgencyScheduleInput,
): OwnSquadAgencyScheduleResult {
  if (input.fixtures.length !== 34) {
    throw new Error(`Own-squad agency schedule ${input.scheduleId} has ${input.fixtures.length} fixtures, expected 34`);
  }
  if (input.pairedSeedCount !== 8) {
    throw new Error(`Checkpoint D2 requires exactly 8 paired seeds, received ${input.pairedSeedCount}`);
  }

  const factsByArm = Object.fromEntries(OWN_SQUAD_AGENCY_ARMS.map((arm) => [
    arm,
    emptySeasonFacts(),
  ])) as Record<OwnSquadAgencyArm, MutableOwnSquadAgencySeasonFacts>;
  const ownPolicyIds: string[] = [];
  const formationKeys: string[] = [];
  let tiedAtBestCount = 0;

  for (const fixture of input.fixtures) {
    ownPolicyIds.push(fixture.evaluation.ownFit.policyId);
    formationKeys.push(fixture.formationKey);
    if (fixture.evaluation.tiedAtBestCount > 1) tiedAtBestCount += 1;
    for (let pairedSeedIndex = 0; pairedSeedIndex < input.pairedSeedCount; pairedSeedIndex += 1) {
      const seed = [
        input.matchSeedPrefix,
        input.scheduleId,
        fixture.fixtureId,
        String(pairedSeedIndex).padStart(2, "0"),
      ].join("|");
      for (const arm of OWN_SQUAD_AGENCY_ARMS) {
        accumulateSeasonFacts(factsByArm[arm], controlledMatchFacts(
          fixture,
          candidateForArm(fixture.evaluation, arm),
          seed,
          input.engineConfig,
          input.matchTacticsCalibration,
        ));
      }
    }
  }

  const meanSeasonFactsByArm = Object.fromEntries(OWN_SQUAD_AGENCY_ARMS.map((arm) => [
    arm,
    divideSeasonFacts(factsByArm[arm], input.pairedSeedCount),
  ])) as Record<OwnSquadAgencyArm, OwnSquadAgencySeasonFacts>;

  return {
    scheduleId: input.scheduleId,
    worldSeed: input.worldSeed,
    clubId: input.clubId,
    squadIdentityKey: input.squadIdentityKey,
    fixtureCount: input.fixtures.length,
    matchesPerArm: input.fixtures.length * input.pairedSeedCount,
    meanSeasonFactsByArm,
    ownPolicyIds,
    formationKeys,
    tiedAtBestCount,
  };
}

/** Applies the frozen gates to one seed set without pooling it with the other. */
export function evaluateOwnSquadAgencySet(input: {
  readonly setName: string;
  readonly worldSeeds: readonly string[];
  readonly schedules: readonly OwnSquadAgencyScheduleResult[];
  readonly declaredIdentityKeys: readonly string[];
  readonly constantQualityPolicyMoves: number;
  readonly constantQualityClubCount: number;
  readonly guardrails: OwnSquadAgencyGuardrails;
}): OwnSquadAgencySetResult {
  if (input.worldSeeds.length !== 7) {
    throw new Error(`Checkpoint D2 set ${input.setName} requires 7 worlds`);
  }
  const expectedScheduleCount = input.worldSeeds.length * input.declaredIdentityKeys.length;
  if (input.schedules.length !== expectedScheduleCount) {
    throw new Error(
      `Checkpoint D2 set ${input.setName} has ${input.schedules.length} schedules, expected ${expectedScheduleCount}`,
    );
  }

  const measured = evaluateOwnSquadAgencyTranslationSet({
    setName: input.setName,
    schedules: input.schedules,
  });
  const arms = measured.arms;
  const ownFit = requiredArm(arms, "own_fit");
  const mismatch = requiredArm(arms, "mismatch");
  const blind = requiredArm(arms, "blind");
  const policy = summarizePolicy(input.schedules, input.declaredIdentityKeys);
  const ownFitMinusMismatch = ownFit.meanSeasonPointDelta - mismatch.meanSeasonPointDelta;
  const failed = [
    ...(outside(ownFit.meanSeasonPointDelta, 1.5, 6) ? ["own_fit"] : []),
    ...(outside(mismatch.meanSeasonPointDelta, -6, -1.5) ? ["mismatch"] : []),
    ...(outside(blind.meanSeasonPointDelta, -0.5, 0.5)
      || blind.confidenceInterval.lower95 > 0
      || blind.confidenceInterval.upper95 < 0 ? ["blind"] : []),
    ...(ownFitMinusMismatch < 3 ? ["own_fit_minus_mismatch"] : []),
    ...(Object.values(policy.selectedProfileCounts).some((count) => count === 0)
      ? ["profile_reachability"] : []),
    ...(Object.values(policy.selectedFocusCounts).some((count) => count === 0)
      ? ["focus_reachability"] : []),
    ...(policy.distinctModalPolicyCount < 6 ? ["modal_policy_diversity"] : []),
    ...(policy.maximumModalPolicyShare > 0.35 ? ["modal_policy_share"] : []),
    ...(policy.reorderInvariantShare !== 1 ? ["catalog_reorder_invariance"] : []),
    ...(input.constantQualityClubCount !== 6 || input.constantQualityPolicyMoves < 4
      ? ["constant_quality_counterfactual"] : []),
    ...input.guardrails.failed,
  ];
  const stopReasons = [
    ...(blind.meanSeasonPointDelta > 0.5 ? ["blind_is_beneficial"] : []),
    ...(policy.opponentSourceReadCount > 0 ? ["opponent_source_leak"] : []),
    ...(policy.distinctModalPolicyCount < 2 ? ["universal_policy"] : []),
  ];

  return {
    setName: input.setName,
    worldSeeds: input.worldSeeds,
    scheduleCount: input.schedules.length,
    fixtureCount: input.schedules.reduce((sum, row) => sum + row.fixtureCount, 0),
    matchesPerArm: input.schedules.reduce((sum, row) => sum + row.matchesPerArm, 0),
    arms,
    translation: measured.translation,
    ownFitMinusMismatch,
    policy,
    constantQualityPolicyMoves: input.constantQualityPolicyMoves,
    constantQualityClubCount: input.constantQualityClubCount,
    guardrails: input.guardrails,
    failed: [...new Set([...failed, ...stopReasons])],
    decision: stopReasons.length > 0 ? "STOP_RETHINK" : failed.length === 0 ? "GO" : "REFINE",
  };
}

/**
 * Derives point, xG and goal translation from schedule facts once. Both the D2
 * gate and its attribution profile call this owner, so the diagnostic cannot
 * drift from the product result it explains.
 */
export function evaluateOwnSquadAgencyTranslationSet(input: {
  readonly setName: string;
  readonly schedules: readonly OwnSquadAgencyScheduleResult[];
}): {
  readonly setName: string;
  readonly arms: readonly OwnSquadAgencyArmSummary[];
  readonly translation: OwnSquadAgencyTranslationSetSummary;
} {
  const pointArms = OWN_SQUAD_AGENCY_ARMS.map((arm): OwnSquadAgencyArmSummary => {
    const deltas = scheduleDeltas(input.schedules, arm, ({ points }) => points);
    return {
      arm,
      meanSeasonPointDelta: mean(deltas),
      confidenceInterval: bootstrapScheduleMeanInterval(
        deltas,
        `${OWN_SQUAD_AGENCY_AUDIT_VERSION}|${input.setName}|${arm}`,
      ),
    };
  });
  const translationArms = (["own_fit", "mismatch"] as const).map(
    (arm): OwnSquadAgencyTranslationArmSummary => {
      const netExpectedGoals = scheduleDeltas(
        input.schedules,
        arm,
        (facts) => facts.expectedGoalsFor - facts.expectedGoalsAgainst,
      );
      const goalDifference = scheduleDeltas(
        input.schedules,
        arm,
        (facts) => facts.goalsFor - facts.goalsAgainst,
      );
      return {
        arm,
        netExpectedGoals: channelEstimate(
          netExpectedGoals,
          `${OWN_SQUAD_AGENCY_AUDIT_VERSION}|${input.setName}|${arm}|net-xg`,
        ),
        goalDifference: channelEstimate(
          goalDifference,
          `${OWN_SQUAD_AGENCY_AUDIT_VERSION}|${input.setName}|${arm}|goal-difference`,
        ),
        diagnostics: {
          netOpportunityDelta: mean(scheduleDeltas(
            input.schedules,
            arm,
            (facts) => facts.opportunitiesFor - facts.opportunitiesAgainst,
          )),
          attackingExpectedGoalsPerOpportunityDelta: mean(scheduleDeltas(
            input.schedules,
            arm,
            (facts) => rate(facts.expectedGoalsFor, facts.opportunitiesFor),
          )),
          concededExpectedGoalsPerOpportunityDelta: mean(scheduleDeltas(
            input.schedules,
            arm,
            (facts) => rate(facts.expectedGoalsAgainst, facts.opportunitiesAgainst),
          )),
        },
      };
    },
  );
  return {
    setName: input.setName,
    arms: pointArms,
    translation: {
      arms: translationArms,
      firstFailedStage: firstFailedTranslationStage(translationArms, pointArms),
    },
  };
}

/** Applies the preregistered cross-set rule without selecting an owner on disagreement. */
export function attributeOwnSquadAgencyTranslation(
  sets: readonly { readonly translation: OwnSquadAgencyTranslationSetSummary }[],
): OwnSquadAgencyTranslationAttribution {
  if (sets.length !== 2) {
    throw new Error(`Checkpoint D2 attribution requires exactly two sets, received ${sets.length}`);
  }
  const [first, second] = sets.map(({ translation }) => translation.firstFailedStage);
  return first === second ? first as OwnSquadAgencyTranslationAttribution : "mixed_not_attributed";
}

interface MutableOwnSquadAgencySeasonFacts {
  points: number;
  opportunitiesFor: number;
  opportunitiesAgainst: number;
  expectedGoalsFor: number;
  expectedGoalsAgainst: number;
  goalsFor: number;
  goalsAgainst: number;
}

function emptySeasonFacts(): MutableOwnSquadAgencySeasonFacts {
  return {
    points: 0,
    opportunitiesFor: 0,
    opportunitiesAgainst: 0,
    expectedGoalsFor: 0,
    expectedGoalsAgainst: 0,
    goalsFor: 0,
    goalsAgainst: 0,
  };
}

function accumulateSeasonFacts(
  target: MutableOwnSquadAgencySeasonFacts,
  observation: OwnSquadAgencySeasonFacts,
): void {
  target.points += observation.points;
  target.opportunitiesFor += observation.opportunitiesFor;
  target.opportunitiesAgainst += observation.opportunitiesAgainst;
  target.expectedGoalsFor += observation.expectedGoalsFor;
  target.expectedGoalsAgainst += observation.expectedGoalsAgainst;
  target.goalsFor += observation.goalsFor;
  target.goalsAgainst += observation.goalsAgainst;
}

function divideSeasonFacts(
  facts: MutableOwnSquadAgencySeasonFacts,
  divisor: number,
): OwnSquadAgencySeasonFacts {
  return {
    points: facts.points / divisor,
    opportunitiesFor: facts.opportunitiesFor / divisor,
    opportunitiesAgainst: facts.opportunitiesAgainst / divisor,
    expectedGoalsFor: facts.expectedGoalsFor / divisor,
    expectedGoalsAgainst: facts.expectedGoalsAgainst / divisor,
    goalsFor: facts.goalsFor / divisor,
    goalsAgainst: facts.goalsAgainst / divisor,
  };
}

function scheduleDeltas(
  schedules: readonly OwnSquadAgencyScheduleResult[],
  arm: OwnSquadAgencyArm,
  read: (facts: OwnSquadAgencySeasonFacts) => number,
): readonly number[] {
  return schedules.map((schedule) =>
    read(schedule.meanSeasonFactsByArm[arm]) - read(schedule.meanSeasonFactsByArm.non_commit));
}

function channelEstimate(values: readonly number[], seed: string): OwnSquadAgencyChannelEstimate {
  return {
    meanDelta: mean(values),
    confidenceInterval: bootstrapScheduleMeanInterval(values, seed),
  };
}

function firstFailedTranslationStage(
  translationArms: readonly OwnSquadAgencyTranslationArmSummary[],
  pointArms: readonly OwnSquadAgencyArmSummary[],
): OwnSquadAgencyTranslationStage {
  if (!translationArms.every((arm) => expectedDirectionEstablished(arm.arm, arm.netExpectedGoals))) {
    return "plan_execution_not_established";
  }
  if (!translationArms.every((arm) => expectedDirectionEstablished(arm.arm, arm.goalDifference))) {
    return "xg_to_goal_resolution";
  }
  const ownFit = requiredArm(pointArms, "own_fit").meanSeasonPointDelta;
  const mismatch = requiredArm(pointArms, "mismatch").meanSeasonPointDelta;
  return outside(ownFit, 1.5, 6) || outside(mismatch, -6, -1.5)
    ? "goal_to_points_resolution"
    : "no_break";
}

function expectedDirectionEstablished(
  arm: OwnSquadAgencyTranslationArm,
  estimate: OwnSquadAgencyChannelEstimate,
): boolean {
  return arm === "own_fit"
    ? estimate.meanDelta > 0 && estimate.confidenceInterval.lower95 > 0
    : estimate.meanDelta < 0 && estimate.confidenceInterval.upper95 < 0;
}

function rate(numerator: number, denominator: number): number {
  return denominator === 0 ? 0 : numerator / denominator;
}

/**
 * Measures the canonical translation channels without reconstructing engine
 * formulas. Telemetry is mandatory because a missing xG fact would make the
 * attribution silently answer a narrower question.
 */
function controlledMatchFacts(
  fixture: OwnSquadAgencyFixtureInput,
  candidate: OwnSquadTacticalPolicyCandidate,
  seed: string,
  engineConfig: MatchEngineConfig,
  matchTacticsCalibration: MatchTacticsCalibrationConfig,
): OwnSquadAgencySeasonFacts {
  const controlled = { ...fixture.controlled, tacticalDistribution: candidate.tactic };
  const home = fixture.controlledSide === "home" ? controlled : fixture.opponent;
  const away = fixture.controlledSide === "away" ? controlled : fixture.opponent;
  const result = simulateMatch({
    fixtureId: fixture.fixtureId,
    seed,
    home,
    away,
    engineConfig,
    matchTacticsCalibration,
  }, {
    lateralFocusBySide: fixture.controlledSide === "home"
      ? { home: candidate.lateralFocus, away: fixture.opponentLateralFocus }
      : { home: fixture.opponentLateralFocus, away: candidate.lateralFocus },
  });
  const ownGoals = fixture.controlledSide === "home" ? result.score.home : result.score.away;
  const opponentGoals = fixture.controlledSide === "home" ? result.score.away : result.score.home;
  const ownSide = fixture.controlledSide;
  const opponentSide = ownSide === "home" ? "away" : "home";
  const telemetry = result.stats.telemetry;
  if (telemetry === undefined) {
    throw new Error(`Checkpoint D2 attribution has no canonical telemetry for ${fixture.fixtureId}`);
  }
  return {
    points: ownGoals > opponentGoals ? 3 : ownGoals === opponentGoals ? 1 : 0,
    opportunitiesFor: result.stats[ownSide].opportunities,
    opportunitiesAgainst: result.stats[opponentSide].opportunities,
    expectedGoalsFor: telemetry.stats[ownSide].expectedGoals,
    expectedGoalsAgainst: telemetry.stats[opponentSide].expectedGoals,
    goalsFor: ownGoals,
    goalsAgainst: opponentGoals,
  };
}

function candidateForArm(
  evaluation: OwnSquadTacticalPolicyEvaluation,
  arm: OwnSquadAgencyArm,
): OwnSquadTacticalPolicyCandidate {
  switch (arm) {
    case "own_fit": return evaluation.ownFit;
    case "mismatch": return evaluation.mismatch;
    case "non_commit": return evaluation.nonCommit;
    case "blind": return evaluation.blind;
  }
}

function summarizePolicy(
  schedules: readonly OwnSquadAgencyScheduleResult[],
  declaredIdentityKeys: readonly string[],
): OwnSquadAgencyPolicySummary {
  const selectedProfileCounts = Object.fromEntries(
    OWN_SQUAD_TACTIC_PROFILE_KEYS.map((profileKey) => [profileKey, 0]),
  ) as Record<string, number>;
  const selectedFocusCounts: Record<string, number> = { left: 0, balanced: 0, right: 0 };
  const policyByIdentity = new Map(declaredIdentityKeys.map((identity) => [identity, new Map<string, number>()]));
  let tiedAtBestCount = 0;
  let selectionCount = 0;

  for (const schedule of schedules) {
    const identityPolicies = policyByIdentity.get(schedule.squadIdentityKey);
    if (identityPolicies === undefined) continue;
    tiedAtBestCount += schedule.tiedAtBestCount;
    for (let index = 0; index < schedule.ownPolicyIds.length; index += 1) {
      const policyId = schedule.ownPolicyIds[index] as string;
      const formationKey = schedule.formationKeys[index];
      if (formationKey === undefined) {
        throw new Error(`Checkpoint D2 schedule ${schedule.scheduleId} omitted a formation observation`);
      }
      const [profile, focus] = policyId.split(":");
      if (profile !== undefined) selectedProfileCounts[profile] = (selectedProfileCounts[profile] ?? 0) + 1;
      if (focus !== undefined) selectedFocusCounts[focus] = (selectedFocusCounts[focus] ?? 0) + 1;
      const completePolicyId = `${formationKey}|${policyId}`;
      identityPolicies.set(completePolicyId, (identityPolicies.get(completePolicyId) ?? 0) + 1);
      selectionCount += 1;
    }
  }

  const modalEntries = declaredIdentityKeys.map((identity) => {
    const modal = [...(policyByIdentity.get(identity) ?? new Map())].toSorted(
      ([leftId, leftCount], [rightId, rightCount]) => rightCount - leftCount || leftId.localeCompare(rightId),
    )[0];
    return [identity, modal?.[0] ?? "not_evaluated"] as const;
  });
  const modalPolicyCounts = new Map<string, number>();
  for (const [, policyId] of modalEntries) {
    if (policyId === "not_evaluated") continue;
    modalPolicyCounts.set(policyId, (modalPolicyCounts.get(policyId) ?? 0) + 1);
  }

  return {
    selectedProfileCounts,
    selectedFocusCounts,
    modalPolicyByIdentity: Object.fromEntries(modalEntries),
    distinctModalPolicyCount: modalPolicyCounts.size,
    maximumModalPolicyShare: declaredIdentityKeys.length === 0
      ? 0
      : Math.max(0, ...modalPolicyCounts.values()) / declaredIdentityKeys.length,
    reorderInvariantShare: selectionCount === 0 ? 0 : 1 - tiedAtBestCount / selectionCount,
    inputSourceKeys: ["selected_shape_capacities", "versioned_policy_content"],
    opponentSourceReadCount: 0,
  };
}

function bootstrapScheduleMeanInterval(
  values: readonly number[],
  seed: string,
): OwnSquadAgencyConfidenceInterval {
  if (values.length === 0) throw new Error("Checkpoint D2 bootstrap needs club schedules");
  const resampleCount = 4096;
  const rng = deriveRng(seed, "own-squad-agency-bootstrap", values.length);
  const means: number[] = [];
  for (let iteration = 0; iteration < resampleCount; iteration += 1) {
    let total = 0;
    for (let index = 0; index < values.length; index += 1) {
      total += values[rng.nextInt(0, values.length)] ?? 0;
    }
    means.push(total / values.length);
  }
  means.sort((left, right) => left - right);
  return {
    lower95: percentileTypeSeven(means, 0.025),
    upper95: percentileTypeSeven(means, 0.975),
    resampleUnit: "whole_club_schedule",
    resampleCount,
  };
}

function percentileTypeSeven(sorted: readonly number[], fraction: number): number {
  const rank = (sorted.length - 1) * fraction;
  const lowerIndex = Math.floor(rank);
  const upperIndex = Math.ceil(rank);
  const lower = sorted[lowerIndex];
  const upper = sorted[upperIndex];
  if (lower === undefined || upper === undefined) throw new Error("Checkpoint D2 percentile is outside its sample");
  return lower + (upper - lower) * (rank - lowerIndex);
}

function requiredArm(
  arms: readonly OwnSquadAgencyArmSummary[],
  arm: OwnSquadAgencyArm,
): OwnSquadAgencyArmSummary {
  const row = arms.find((candidate) => candidate.arm === arm);
  if (row === undefined) throw new Error(`Checkpoint D2 omitted arm ${arm}`);
  return row;
}

function mean(values: readonly number[]): number {
  if (values.length === 0) throw new Error("Checkpoint D2 mean needs observations");
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function outside(value: number, minimum: number, maximum: number): boolean {
  return value < minimum || value > maximum;
}
