import {
  completedPlayerAge,
  derivePublicPlayerAssessment,
  summarizePlayerDevelopmentAbilities,
  type CareerSeasonAdvancementFacts,
  type SimulateSeasonResult,
} from "@game/engine";
import {
  annualIntakeRoleCoverageFacts,
  generatedPlayerDepartmentForPosition,
  selectPlayerValuationConfig,
  type AnnualWorldRoleContinuityDiagnostics,
} from "@game/content";
import { stableSimulationReportHash } from "@game/simulation-tools";

import type { CliCareerState } from "../career/types.ts";

export const GENERATIONAL_ORIGINS = [
  "opening_senior",
  "opening_academy",
  "annual_academy_intake",
  "annual_senior_intake",
  "unknown",
] as const;
export type GenerationalOrigin = typeof GENERATIONAL_ORIGINS[number];

export const GENERATIONAL_AGE_BANDS = ["under_21", "21_24", "25_29", "30_32", "33_plus"] as const;
export type GenerationalAgeBand = typeof GENERATIONAL_AGE_BANDS[number];

/** Frozen from the canonical L4.3 artifact before L4.4 was executed. */
export const L4_3_GENERATION_INPUT_SIGNATURE =
  "6ef3c51a7717bb39ff86e66be6629848";
const EXPECTED_ACCEPTED_INTAKE_ROLE_COUNT = 10;

export interface GenerationalSuccessionRow {
  readonly seasonNumber: number;
  readonly competitionId: string;
  readonly competitionName: string;
  readonly origin: GenerationalOrigin;
  readonly ageBand: GenerationalAgeBand;
  readonly generatedCount: number;
  readonly activePopulationCount: number;
  readonly academyMembershipCount: number;
  readonly academyExitCount: number;
  readonly promotionCandidateCount: number;
  readonly completedPromotionCount: number;
  readonly registeredSeniorCount: number;
  readonly selectedPlayerCount: number;
  readonly emergencySelectionCount: number;
  readonly starts: number;
  readonly minutes: number;
  readonly currentAbilityMean: number | "not_observed";
  readonly potentialRoomMean: number | "not_observed";
  readonly transferAcquisitionCount: number;
  readonly freeAgentAcquisitionCount: number;
  readonly retirementExitCount: number;
  readonly scorerLeaderboardCount: number;
  readonly assistLeaderboardCount: number;
}

export interface GenerationalSuccessionWorldFacts {
  readonly worldSeed: string;
  readonly openingPopulationCount: number;
  readonly openingSeniorPopulationCount: number;
  readonly careerGeneratedCount: number;
  readonly matureAcademyIntakeCount: number;
  readonly matureAcademyPromotionCandidateCount: number;
  readonly matureAcademyCompletedPromotionCount: number;
  readonly unknownOriginCount: number;
  /** Real outfield retirements at 33 or 34, where only the soft hazard applies. */
  readonly softOutfieldAgeRetirementCount: number;
  readonly abilityPairObservationCount: number;
  readonly currentAbovePotentialAbilityCount: number;
  readonly outOfRangeAbilityValueCount: number;
  readonly generatedCeilingRows: readonly GeneratedCeilingAttributionRow[];
  readonly annualRoleContinuity: AnnualRoleContinuityWorldFacts;
  readonly academyParticipation: AcademyParticipationCheckpointFacts;
  readonly rows: readonly GenerationalSuccessionRow[];
}

export const ANNUAL_ROLE_CONTINUITY_SOURCES = [
  "opening_academy",
  "academy_refill",
  "senior_candidate",
] as const;
export type AnnualRoleContinuitySource = typeof ANNUAL_ROLE_CONTINUITY_SOURCES[number];

/** One actual generated competition population at its creation boundary. */
export interface AnnualRoleContinuityPopulationRow {
  readonly seasonNumber: number;
  readonly competitionId: string;
  readonly source: AnnualRoleContinuitySource;
  readonly generatedCount: number;
  readonly positiveRoles: readonly string[];
  readonly maximumReachableRoleCount: number;
  readonly sidedRoleImbalanceCount: number;
}

/** Generation-boundary facts that cannot be reconstructed from survivors. */
export interface AnnualRoleContinuityWorldFacts {
  readonly plannedCandidateCount: number;
  readonly generatedCandidateCount: number;
  readonly reconciliationFailureCount: number;
  readonly seniorCandidateGeneratedSeasonCount: number;
  readonly seniorCandidateNotRequestedSeasonCount: number;
  readonly openingAcademyDepartmentMismatchCount: number;
  readonly rows: readonly AnnualRoleContinuityPopulationRow[];
}

/** Frozen L4.5 decision over role continuity and carried formation health. */
export interface AnnualRoleContinuityCheckpointDecision {
  readonly decision: "GO" | "REFINE" | "STOP_RETHINK";
  readonly failedGateKeys: readonly string[];
  readonly worldCount: number;
  readonly populationRowCount: number;
  readonly plannedCandidateCount: number;
  readonly generatedCandidateCount: number;
  readonly reconciliationFailureCount: number;
  readonly seniorCandidateGeneratedSeasonCount: number;
  readonly seniorCandidateNotRequestedSeasonCount: number;
  readonly openingAcademyDepartmentMismatchCount: number;
  readonly incompleteOpeningRoleRowCount: number;
  readonly incompleteSeniorRoleRowCount: number;
  readonly incompleteAcademyRefillRoleRowCount: number;
  readonly sidedRoleImbalanceCount: number;
  readonly academyCallUpAppearanceCount: number;
  readonly formationHealthFailureCount: number;
}

/** Carried selector health needed by L4.5 without importing its CLI owner. */
export interface AnnualRoleFormationHealthWorldFacts {
  readonly opening: readonly {
    readonly primaryRolePositiveCount: number;
    readonly distinctFormationCount: number;
    readonly topFormationShare: number;
    readonly catalogOrderSensitiveSelectionCount: number;
    readonly emergencyCatalogSelectionCount: number;
    readonly forcedOutOfPositionSlotCount: number;
    readonly avoidableOutOfPositionSlotCount: number;
    readonly academyCallUpAppearanceCount: number;
    readonly meanOutOfPositionSlots: number;
  }[];
  readonly seasons: readonly {
    readonly primaryRolePositiveCount: number;
    readonly distinctFormationCount: number;
    readonly topFormationShare: number;
    readonly fallbackSelectionCount: number;
    readonly missingSelectionSourceCount: number;
    readonly missingStableIdCount: number;
    readonly reconciliationFailureCount: number;
  }[];
}

export interface GeneratedCeilingAttributionRow {
  readonly competitionId: string;
  readonly openingSeniorCount: number;
  readonly openingSeniorCurrentMedian: number | "not_observed";
  readonly acceptedAnnualIntakeCount: number;
  readonly acceptedAnnualIntakePotentialP90: number | "not_observed";
  readonly acceptedAnnualIntakeRoles: readonly string[];
  readonly matureAnnualIntakeCount: number;
  readonly matureAnnualIntakeCurrentP90: number | "not_observed";
}

export interface GeneratedCeilingAttributionDecision {
  readonly decision: "OWNER_IDENTIFIED" | "REFINE" | "STOP_RETHINK";
  readonly owner:
    | "generation_quality"
    | "development_realization"
    | "downstream_selection_or_outcome"
    | "not_identified";
  readonly worldOwnerCounts: Readonly<Record<
    "generation_quality" | "development_realization" | "downstream_selection_or_outcome" | "not_identified",
    number
  >>;
  readonly denominatorFailureCount: number;
  readonly worlds: readonly {
    readonly worldSeed: string;
    readonly owner: GeneratedCeilingAttributionDecision["owner"];
    readonly rows: readonly GeneratedCeilingAttributionRow[];
  }[];
}

export interface AcademyParticipationCheckpointFacts {
  readonly fixtureCount: number;
  readonly appearanceCount: number;
  readonly playerCount: number;
  readonly minutes: number;
  readonly fullProgrammePlayerMonthCount: number;
  readonly reducedProgrammePlayerMonthCount: number;
  readonly fullyReplacedPlayerMonthCount: number;
  readonly missingPlayerMonthCount: number;
  readonly invalidMinuteCount: number;
}

type MutableAcademyParticipationCheckpointFacts = {
  -readonly [Key in keyof AcademyParticipationCheckpointFacts]: AcademyParticipationCheckpointFacts[Key];
};

export interface GenerationalSuccessionCheckpointDecision {
  readonly decision: "OWNER_IDENTIFIED" | "REFINE" | "STOP_RETHINK";
  readonly owner:
    | "generation_quality_or_quantity"
    | "development_conversion"
    | "academy_promotion"
    | "ai_selection_opportunity"
    | "retirement_or_exit"
    | "not_identified";
  readonly openingPopulationCount: number;
  readonly careerGeneratedCount: number;
  readonly matureAcademyIntakeCount: number;
  readonly promotionCandidateCount: number;
  readonly completedPromotionCount: number;
  readonly seasonTenRegisteredCareerGeneratedCount: number;
  readonly seasonTenSelectedCareerGeneratedCount: number;
  readonly seasonTenOpeningLeaderboardCount: number;
  readonly seasonTenCareerGeneratedLeaderboardCount: number;
  readonly seasonTenOpeningLeaderboardShare: number | "not_observed";
  readonly seasonTenCareerGeneratedLeaderboardShare: number | "not_observed";
  readonly worldsWithCareerGeneratedLeaderCount: number;
  readonly competitionWorldsWithoutPromotionCount: number;
  readonly careerGeneratedAcquisitionCount: number;
  readonly totalAcquisitionCount: number;
  readonly openingRetirementExitCount: number;
  readonly unknownOriginCount: number;
  readonly ratios: {
    readonly generatedToOpening: number | "not_observed";
    readonly matureAcademyToCandidate: number | "not_observed";
    readonly candidateToPromotion: number | "not_observed";
    readonly registeredToSelected: number | "not_observed";
    readonly careerGeneratedAcquisitionShare: number | "not_observed";
  };
}

export interface YouthMinutePathwayCheckpointDecision {
  readonly decision: "GO" | "REFINE" | "STOP_RETHINK";
  readonly academyParticipation: AcademyParticipationCheckpointFacts;
  readonly seasonTenOpeningLeaderboardCount: number;
  readonly seasonTenCareerGeneratedLeaderboardCount: number;
  readonly seasonTenOpeningLeaderboardShare: number | "not_observed";
  readonly seasonTenCareerGeneratedLeaderboardShare: number | "not_observed";
  readonly worldsWithCareerGeneratedLeaderCount: number;
  readonly competitionWorldsWithoutPromotionCount: number;
  readonly unknownOriginCount: number;
  readonly failedGateKeys: readonly string[];
}

export interface CareerExitRenewalCheckpointDecision
  extends YouthMinutePathwayCheckpointDecision {
  readonly openingSeniorPopulationCount: number;
  readonly seasonTenActiveOpeningSeniorCount: number;
  readonly seasonTenActiveOpeningSeniorShare: number | "not_observed";
  readonly softOutfieldAgeRetirementCount: number;
  readonly seasonTenActive33PlusCount: number;
  readonly seasonTen33PlusLeaderboardCount: number;
}

export interface DevelopmentRenewalCheckpointDecision
  extends CareerExitRenewalCheckpointDecision {
  readonly generationInputSignature: string;
  readonly expectedGenerationInputSignature: string;
  readonly generationInputMatchesL4_3: boolean;
  readonly worldsMeetingDevelopmentParity: number;
  readonly abilityPairObservationCount: number;
  readonly currentAbovePotentialAbilityCount: number;
  readonly outOfRangeAbilityValueCount: number;
  readonly incompleteGeneratedCeilingWorldCount: number;
  readonly incompleteAcceptedRoleCoverageRowCount: number;
}

interface PlayerOriginFact {
  readonly origin: GenerationalOrigin;
  readonly generatedSeasonNumber: number;
}

type MutableRow = {
  -readonly [Key in keyof Omit<
    GenerationalSuccessionRow,
    "currentAbilityMean" | "potentialRoomMean" | "selectedPlayerCount"
  >]: Omit<
    GenerationalSuccessionRow,
    "currentAbilityMean" | "potentialRoomMean" | "selectedPlayerCount"
  >[Key]
} & {
  currentAbilityTotal: number;
  potentialRoomTotal: number;
  abilityObservationCount: number;
  selectedPlayerIds: Set<string>;
};

/** Stateful read-only inspector attached to the one canonical career execution. */
export class GenerationalSuccessionObserver {
  private readonly worldSeed: string;
  private readonly origins = new Map<string, PlayerOriginFact>();
  private readonly rows = new Map<string, MutableRow>();
  private readonly unknownOriginIds = new Set<string>();
  private openingPopulationCount = 0;
  private openingSeniorPopulationCount = 0;
  private softOutfieldAgeRetirementCount = 0;
  private readonly openingSeniorCurrent = new Map<string, number[]>();
  private readonly acceptedAnnualIntakePotential = new Map<string, number[]>();
  private readonly acceptedAnnualIntakeRoles = new Map<string, Set<string>>();
  private readonly matureAnnualIntakeCurrent = new Map<string, number[]>();
  private readonly annualRoleContinuityRows: AnnualRoleContinuityPopulationRow[] = [];
  private annualRolePlannedCandidateCount = 0;
  private annualRoleGeneratedCandidateCount = 0;
  private annualRoleReconciliationFailureCount = 0;
  private seniorCandidateGeneratedSeasonCount = 0;
  private seniorCandidateNotRequestedSeasonCount = 0;
  private openingAcademyDepartmentMismatchCount = 0;
  private matureAcademyPromotionCandidateCount = 0;
  private matureAcademyCompletedPromotionCount = 0;
  private abilityPairObservationCount = 0;
  private currentAbovePotentialAbilityCount = 0;
  private outOfRangeAbilityValueCount = 0;
  private readonly academyParticipation: MutableAcademyParticipationCheckpointFacts = {
    fixtureCount: 0,
    appearanceCount: 0,
    playerCount: 0,
    minutes: 0,
    fullProgrammePlayerMonthCount: 0,
    reducedProgrammePlayerMonthCount: 0,
    fullyReplacedPlayerMonthCount: 0,
    missingPlayerMonthCount: 0,
    invalidMinuteCount: 0,
  };

  public constructor(worldSeed: string) {
    this.worldSeed = worldSeed;
  }

  public observeOpening(careerState: CliCareerState): void {
    const academyIds = new Set(careerState.youthAcademyState?.clubRosterIds.flatMap(
      (clubId) => careerState.youthAcademyState?.clubRosters[clubId]?.playerIds.map(String) ?? [],
    ) ?? []);
    for (const playerId of careerState.gameState.playerIds) {
      const player = careerState.gameState.players[playerId];
      if (player !== undefined) this.observeAbilityInvariants(player);
      const isAcademy = academyIds.has(String(playerId));
      this.origins.set(String(playerId), {
        origin: isAcademy ? "opening_academy" : "opening_senior",
        generatedSeasonNumber: 0,
      });
      if (!isAcademy) this.openingSeniorPopulationCount += 1;
      if (!isAcademy) {
        const clubId = clubForPlayer(careerState, String(playerId));
        if (player !== undefined && clubId !== undefined) {
          pushMeasure(
            this.openingSeniorCurrent,
            competitionForClub(careerState, clubId).id,
            summarizePlayerDevelopmentAbilities(player).currentAbility,
          );
        }
      }
    }
    this.openingPopulationCount = careerState.gameState.playerIds.length;
    const world = careerState.gameState.domesticCompetitionWorld;
    if (world === undefined) throw new Error("Generational observer requires domestic competitions");
    for (const competitionId of world.competitionIds) {
      const competition = world.competitions[competitionId];
      if (competition === undefined) throw new Error(`Opening role facts lost ${competitionId}`);
      const positions = competition.clubIds.flatMap((clubId) => {
        const roster = careerState.youthAcademyState?.clubRosters[clubId];
        if (roster === undefined) throw new Error(`Opening role facts lost academy ${clubId}`);
        const departmentCounts = { goalkeeper: 0, defender: 0, midfielder: 0, attacker: 0 };
        const clubPositions = roster.playerIds.map((playerId) => {
          const position = careerState.gameState.players[playerId]?.naturalPositions[0];
          if (position === undefined) throw new Error(`Opening academy player lost position ${playerId}`);
          departmentCounts[generatedPlayerDepartmentForPosition(position)] += 1;
          return position;
        });
        if (
          departmentCounts.goalkeeper !== 1
          || departmentCounts.defender !== 4
          || departmentCounts.midfielder !== 4
          || departmentCounts.attacker !== 2
        ) this.openingAcademyDepartmentMismatchCount += 1;
        return clubPositions;
      });
      this.recordAnnualRolePopulation(0, String(competitionId), "opening_academy", positions);
    }
  }

  /** Reads actual content-provider candidates before engine acceptance filters them. */
  public observeGeneratedIntakeRoles(input: {
    readonly seasonNumber: number;
    readonly careerState: CliCareerState;
    readonly diagnostics: AnnualWorldRoleContinuityDiagnostics;
  }): void {
    const sources: [AnnualRoleContinuitySource, AnnualWorldRoleContinuityDiagnostics["academyRefill"]][] = [
      ["academy_refill", input.diagnostics.academyRefill],
    ];
    if (input.diagnostics.seniorCandidate.status === "generated") {
      this.seniorCandidateGeneratedSeasonCount += 1;
      sources.push(["senior_candidate", input.diagnostics.seniorCandidate.population]);
    } else {
      this.seniorCandidateNotRequestedSeasonCount += 1;
    }
    const world = input.careerState.gameState.domesticCompetitionWorld;
    if (world === undefined) throw new Error("Annual role facts require domestic competitions");
    for (const [, population] of sources) {
      this.annualRolePlannedCandidateCount += population.plannedCount;
      this.annualRoleGeneratedCandidateCount += population.candidates.length;
      this.annualRoleReconciliationFailureCount += population.reconciliationFailureCount;
    }
    for (const competitionId of world.competitionIds) {
      const competition = world.competitions[competitionId];
      if (competition === undefined) throw new Error(`Annual role facts lost ${competitionId}`);
      for (const [source, population] of sources) {
        const positions = population.candidates
          .filter((candidate) => competition.clubIds.includes(candidate.targetClubId))
          .map((candidate) => candidate.position);
        this.recordAnnualRolePopulation(
          input.seasonNumber,
          String(competitionId),
          source,
          positions,
        );
      }
    }
  }

  public observeCompetitionSeason(input: {
    readonly seasonNumber: number;
    readonly competitionId: string;
    readonly competitionName: string;
    readonly result: SimulateSeasonResult;
    readonly careerState: CliCareerState;
  }): void {
    const clubIds = competitionClubIds(input.careerState, input.competitionId);
    const clubIdSet = new Set(clubIds.map(String));
    const valuation = selectPlayerValuationConfig(input.careerState.gameState.meta.calibrationVersions);
    const participation = participationForCompetition(input.result);
    const seniorIds = registeredPlayersForClubs(input.careerState, clubIdSet);
    const academyIds = academyPlayersForClubs(input.careerState, clubIdSet);

    for (const playerId of [...seniorIds, ...academyIds]) {
      const player = input.careerState.gameState.players[playerId as keyof typeof input.careerState.gameState.players];
      if (player === undefined) continue;
      const origin = this.originFor(String(player.id));
      const originFact = this.origins.get(String(player.id));
      const ageBand = ageBandFor(completedPlayerAge(player.birthDate, input.careerState.gameState.calendar.currentDate));
      const row = this.row(input.seasonNumber, input.competitionId, input.competitionName, origin, ageBand);
      row.activePopulationCount += 1;
      if (academyIds.includes(String(player.id))) row.academyMembershipCount += 1;
      if (seniorIds.includes(String(player.id))) row.registeredSeniorCount += 1;
      const assessment = derivePublicPlayerAssessment({
        player,
        currentDate: input.careerState.gameState.calendar.currentDate,
        potentialProjectionPolicy: valuation.potentialProjectionPolicy,
        ratingScale: valuation.ratingScale,
      });
      row.currentAbilityTotal += assessment.currentAbility;
      row.potentialRoomTotal += Math.max(0, assessment.p50Ability - assessment.currentAbility);
      row.abilityObservationCount += 1;
      if (
        input.seasonNumber === 10
        && originFact?.origin === "annual_academy_intake"
        && originFact.generatedSeasonNumber <= 6
      ) {
        pushMeasure(
          this.matureAnnualIntakeCurrent,
          input.competitionId,
          summarizePlayerDevelopmentAbilities(player).currentAbility,
        );
      }
      const played = participation.get(String(player.id));
      if (played !== undefined) {
        row.selectedPlayerIds.add(String(player.id));
        row.starts += played.starts;
        row.minutes += played.minutes;
      }
    }

    for (const stat of topTenByGoals(input.result)) {
      if (!clubIdSet.has(String(stat.clubId))) continue;
      this.leaderboardRow(input, String(stat.playerId)).scorerLeaderboardCount += 1;
    }
    for (const stat of topTenByAssists(input.result)) {
      if (!clubIdSet.has(String(stat.clubId))) continue;
      this.leaderboardRow(input, String(stat.playerId)).assistLeaderboardCount += 1;
    }
    for (const fixture of input.result.fixtureParticipation) {
      for (const fielded of [fixture.fieldedTeams.home, fixture.fieldedTeams.away]) {
        for (const playerId of fielded.emergencyPlayerIds ?? []) {
          const player = input.careerState.gameState.players[playerId];
          if (player === undefined) throw new Error(`Emergency selection lost player ${playerId}`);
          this.row(
            input.seasonNumber,
            input.competitionId,
            input.competitionName,
            this.originFor(String(playerId)),
            ageBandFor(completedPlayerAge(player.birthDate, input.careerState.gameState.calendar.currentDate)),
          ).emergencySelectionCount += 1;
        }
      }
    }
  }

  public observeAdvancement(input: {
    readonly seasonNumber: number;
    readonly previousCareerState: CliCareerState;
    readonly careerState: CliCareerState;
    readonly facts: CareerSeasonAdvancementFacts;
  }): void {
    const academyParticipation = input.facts.playerDevelopment.academyParticipation;
    if (academyParticipation !== undefined) {
      for (const key of ACADEMY_PARTICIPATION_KEYS) {
        this.academyParticipation[key] += academyParticipation[key];
      }
    }
    const acceptedYouthIds = new Set(input.facts.youthIntake.acceptedPlayerIds.map(String));
    const previousIds = new Set(input.previousCareerState.gameState.playerIds.map(String));
    for (const playerId of input.careerState.gameState.playerIds) {
      const key = String(playerId);
      if (this.origins.has(key)) continue;
      this.origins.set(key, {
        origin: acceptedYouthIds.has(key) ? "annual_academy_intake" : "annual_senior_intake",
        generatedSeasonNumber: input.seasonNumber,
      });
      if (previousIds.has(key)) this.unknownOriginIds.add(key);
    }

    for (const playerId of input.facts.youthIntake.acceptedPlayerIds) {
      const player = input.careerState.gameState.players[playerId];
      const clubId = clubForPlayer(input.careerState, String(playerId));
      if (player !== undefined && clubId !== undefined) {
        const competitionId = competitionForClub(input.careerState, clubId).id;
        pushMeasure(
          this.acceptedAnnualIntakePotential,
          competitionId,
          summarizePlayerDevelopmentAbilities(player).potentialAbility,
        );
        const roles = this.acceptedAnnualIntakeRoles.get(competitionId)
          ?? new Set<string>();
        if (player.primaryRole !== undefined) roles.add(player.primaryRole);
        this.acceptedAnnualIntakeRoles.set(competitionId, roles);
      }
      this.flowRow(input, String(playerId), input.careerState).generatedCount += 1;
    }
    for (const playerId of input.careerState.gameState.playerIds) {
      const key = String(playerId);
      if (!previousIds.has(key) && !acceptedYouthIds.has(key)) {
        this.flowRow(input, key, input.careerState).generatedCount += 1;
      }
    }
    for (const outcome of ["promotion_candidate", "external_move_candidate", "released"] as const) {
      for (const playerId of input.facts.youthLifecycle.playerIdsByOutcome[outcome]) {
        const row = this.flowRow(input, String(playerId), input.previousCareerState);
        row.academyExitCount += 1;
        if (outcome === "promotion_candidate") {
          row.promotionCandidateCount += 1;
          const origin = this.origins.get(String(playerId));
          if (origin?.origin === "annual_academy_intake" && origin.generatedSeasonNumber <= 6) {
            this.matureAcademyPromotionCandidateCount += 1;
          }
        }
      }
    }
    for (const playerId of input.facts.youthLifecycle.playerIdsByOutcome.promotion_candidate) {
      const lifecycle = input.careerState.youthAcademyState?.playerLifecycle[playerId];
      if (lifecycle?.status === "promoted") {
        this.flowRow(input, String(playerId), input.careerState).completedPromotionCount += 1;
        const origin = this.origins.get(String(playerId));
        if (origin?.origin === "annual_academy_intake" && origin.generatedSeasonNumber <= 6) {
          this.matureAcademyCompletedPromotionCount += 1;
        }
      }
    }
    for (const playerId of input.facts.playerExits.playerIdsByReason.retirement) {
      const player = input.previousCareerState.gameState.players[playerId];
      if (player !== undefined) {
        const age = completedPlayerAge(
          player.birthDate,
          input.careerState.gameState.calendar.currentDate,
        );
        if (player.primaryRole !== "goalkeeper" && (age === 33 || age === 34)) {
          this.softOutfieldAgeRetirementCount += 1;
        }
      }
      this.flowRow(input, String(playerId), input.previousCareerState).retirementExitCount += 1;
    }
    for (const signing of input.facts.squadMaintenance.freeAgentSignings) {
      this.flowRow(input, String(signing.playerId), input.careerState, String(signing.clubId))
        .freeAgentAcquisitionCount += 1;
    }
    const previousTransferSequence = input.previousCareerState.transferHistory.at(-1)?.sequenceNumber ?? 0;
    for (const transfer of input.careerState.transferHistory) {
      if (transfer.sequenceNumber <= previousTransferSequence) continue;
      this.flowRow(input, String(transfer.playerId), input.careerState, String(transfer.buyingClubId))
        .transferAcquisitionCount += 1;
    }
    for (const playerId of input.careerState.gameState.playerIds) {
      const player = input.careerState.gameState.players[playerId];
      if (player !== undefined) this.observeAbilityInvariants(player);
    }
  }

  public facts(): GenerationalSuccessionWorldFacts {
    return {
      worldSeed: this.worldSeed,
      openingPopulationCount: this.openingPopulationCount,
      openingSeniorPopulationCount: this.openingSeniorPopulationCount,
      careerGeneratedCount: [...this.origins.values()].filter(({ origin }) => isCareerGenerated(origin)).length,
      matureAcademyIntakeCount: [...this.origins.values()].filter(({ origin, generatedSeasonNumber }) =>
        origin === "annual_academy_intake" && generatedSeasonNumber <= 6).length,
      matureAcademyPromotionCandidateCount: this.matureAcademyPromotionCandidateCount,
      matureAcademyCompletedPromotionCount: this.matureAcademyCompletedPromotionCount,
      unknownOriginCount: this.unknownOriginIds.size,
      softOutfieldAgeRetirementCount: this.softOutfieldAgeRetirementCount,
      abilityPairObservationCount: this.abilityPairObservationCount,
      currentAbovePotentialAbilityCount: this.currentAbovePotentialAbilityCount,
      outOfRangeAbilityValueCount: this.outOfRangeAbilityValueCount,
      generatedCeilingRows: generatedCeilingRows({
        openingSeniorCurrent: this.openingSeniorCurrent,
        acceptedAnnualIntakePotential: this.acceptedAnnualIntakePotential,
        acceptedAnnualIntakeRoles: this.acceptedAnnualIntakeRoles,
        matureAnnualIntakeCurrent: this.matureAnnualIntakeCurrent,
      }),
      annualRoleContinuity: {
        plannedCandidateCount: this.annualRolePlannedCandidateCount,
        generatedCandidateCount: this.annualRoleGeneratedCandidateCount,
        reconciliationFailureCount: this.annualRoleReconciliationFailureCount,
        seniorCandidateGeneratedSeasonCount: this.seniorCandidateGeneratedSeasonCount,
        seniorCandidateNotRequestedSeasonCount: this.seniorCandidateNotRequestedSeasonCount,
        openingAcademyDepartmentMismatchCount: this.openingAcademyDepartmentMismatchCount,
        rows: [...this.annualRoleContinuityRows].sort(compareAnnualRoleRows),
      },
      academyParticipation: { ...this.academyParticipation },
      rows: [...this.rows.values()]
        .map(finalizeRow)
        .sort(compareRows),
    };
  }

  private recordAnnualRolePopulation(
    seasonNumber: number,
    competitionId: string,
    source: AnnualRoleContinuitySource,
    positions: readonly Parameters<typeof generatedPlayerDepartmentForPosition>[0][],
  ): void {
    const coverage = annualIntakeRoleCoverageFacts(positions);
    this.annualRoleContinuityRows.push({
      seasonNumber,
      competitionId,
      source,
      generatedCount: positions.length,
      positiveRoles: coverage.positiveRoles,
      maximumReachableRoleCount: coverage.maximumReachableRoleCount,
      sidedRoleImbalanceCount: coverage.sidedRoleImbalanceCount,
    });
  }

  private observeAbilityInvariants(player: CliCareerState["gameState"]["players"][keyof CliCareerState["gameState"]["players"]]): void {
    const counts = abilityInvariantCounts(player.abilities, player.potential);
    this.abilityPairObservationCount += counts.pairCount;
    this.currentAbovePotentialAbilityCount += counts.currentAbovePotentialCount;
    this.outOfRangeAbilityValueCount += counts.outOfRangeValueCount;
  }

  private leaderboardRow(
    input: { readonly seasonNumber: number; readonly competitionId: string; readonly competitionName: string; readonly careerState: CliCareerState },
    playerId: string,
  ): MutableRow {
    const player = input.careerState.gameState.players[playerId as keyof typeof input.careerState.gameState.players];
    if (player === undefined) throw new Error(`Leaderboard lost player ${playerId}`);
    return this.row(
      input.seasonNumber,
      input.competitionId,
      input.competitionName,
      this.originFor(playerId),
      ageBandFor(completedPlayerAge(player.birthDate, input.careerState.gameState.calendar.currentDate)),
    );
  }

  private flowRow(
    input: { readonly seasonNumber: number },
    playerId: string,
    careerState: CliCareerState,
    explicitClubId?: string,
  ): MutableRow {
    const player = careerState.gameState.players[playerId as keyof typeof careerState.gameState.players];
    if (player === undefined) throw new Error(`Generational flow lost player ${playerId}`);
    const clubId = explicitClubId ?? clubForPlayer(careerState, playerId);
    const competition = clubId === undefined
      ? { id: "not_registered", name: "not_registered" }
      : competitionForClub(careerState, clubId);
    return this.row(
      input.seasonNumber,
      competition.id,
      competition.name,
      this.originFor(playerId),
      ageBandFor(completedPlayerAge(player.birthDate, careerState.gameState.calendar.currentDate)),
    );
  }

  private originFor(playerId: string): GenerationalOrigin {
    const origin = this.origins.get(playerId)?.origin;
    if (origin !== undefined) return origin;
    this.unknownOriginIds.add(playerId);
    return "unknown";
  }

  private row(
    seasonNumber: number,
    competitionId: string,
    competitionName: string,
    origin: GenerationalOrigin,
    ageBand: GenerationalAgeBand,
  ): MutableRow {
    const key = `${seasonNumber}|${competitionId}|${origin}|${ageBand}`;
    const current = this.rows.get(key);
    if (current !== undefined) return current;
    const created: MutableRow = {
      seasonNumber,
      competitionId,
      competitionName,
      origin,
      ageBand,
      generatedCount: 0,
      activePopulationCount: 0,
      academyMembershipCount: 0,
      academyExitCount: 0,
      promotionCandidateCount: 0,
      completedPromotionCount: 0,
      registeredSeniorCount: 0,
      selectedPlayerIds: new Set(),
      emergencySelectionCount: 0,
      starts: 0,
      minutes: 0,
      currentAbilityTotal: 0,
      potentialRoomTotal: 0,
      abilityObservationCount: 0,
      transferAcquisitionCount: 0,
      freeAgentAcquisitionCount: 0,
      retirementExitCount: 0,
      scorerLeaderboardCount: 0,
      assistLeaderboardCount: 0,
    };
    this.rows.set(key, created);
    return created;
  }
}

const ACADEMY_PARTICIPATION_KEYS = [
  "fixtureCount",
  "appearanceCount",
  "playerCount",
  "minutes",
  "fullProgrammePlayerMonthCount",
  "reducedProgrammePlayerMonthCount",
  "fullyReplacedPlayerMonthCount",
  "missingPlayerMonthCount",
  "invalidMinuteCount",
] as const satisfies readonly (keyof AcademyParticipationCheckpointFacts)[];

export function evaluateGenerationalSuccessionCheckpoint(
  worlds: readonly GenerationalSuccessionWorldFacts[],
): GenerationalSuccessionCheckpointDecision {
  const rows = worlds.flatMap(({ rows }) => rows);
  const seasonTen = rows.filter(({ seasonNumber }) => seasonNumber === 10);
  const openingPopulationCount = worlds.reduce((sum, world) => sum + world.openingPopulationCount, 0);
  const careerGeneratedCount = worlds.reduce((sum, world) => sum + world.careerGeneratedCount, 0);
  const matureAcademyIntakeCount = worlds.reduce((sum, world) => sum + world.matureAcademyIntakeCount, 0);
  const promotionCandidateCount = worlds.reduce(
    (sum, world) => sum + world.matureAcademyPromotionCandidateCount,
    0,
  );
  const completedPromotionCount = worlds.reduce(
    (sum, world) => sum + world.matureAcademyCompletedPromotionCount,
    0,
  );
  const seasonTenRegisteredCareerGeneratedCount = sumCareerGenerated(seasonTen, "registeredSeniorCount");
  const seasonTenSelectedCareerGeneratedCount = sumCareerGenerated(seasonTen, "selectedPlayerCount");
  const seasonTenOpeningLeaderboardCount = sumLeaderboard(seasonTen.filter(({ origin }) => !isCareerGenerated(origin)));
  const seasonTenCareerGeneratedLeaderboardCount = sumLeaderboard(seasonTen.filter(({ origin }) => isCareerGenerated(origin)));
  const leaderboardTotal = seasonTenOpeningLeaderboardCount + seasonTenCareerGeneratedLeaderboardCount;
  const totalAcquisitionCount = rows.reduce((sum, row) =>
    sum + row.transferAcquisitionCount + row.freeAgentAcquisitionCount, 0);
  const careerGeneratedAcquisitionCount = rows.filter(({ origin }) => isCareerGenerated(origin)).reduce((sum, row) =>
    sum + row.transferAcquisitionCount + row.freeAgentAcquisitionCount, 0);
  const openingRetirementExitCount = rows.filter(({ origin }) => origin === "opening_senior").reduce(
    (sum, row) => sum + row.retirementExitCount,
    0,
  );
  const unknownOriginCount = worlds.reduce((sum, world) => sum + world.unknownOriginCount, 0);
  const worldsWithCareerGeneratedLeaderCount = worlds.filter((world) =>
    world.rows.some((row) => row.seasonNumber === 10 && isCareerGenerated(row.origin)
      && row.scorerLeaderboardCount + row.assistLeaderboardCount > 0)).length;
  const competitionWorldsWithoutPromotionCount = worlds.reduce((total, world) => {
    const competitionIds = [...new Set(world.rows
      .map(({ competitionId }) => competitionId)
      .filter((competitionId) => competitionId !== "not_registered"))];
    return total + competitionIds.filter((competitionId) =>
      !world.rows.some((row) => row.competitionId === competitionId && row.completedPromotionCount > 0)).length;
  }, 0);
  const ratios = {
    generatedToOpening: ratio(careerGeneratedCount, openingPopulationCount),
    matureAcademyToCandidate: ratio(promotionCandidateCount, matureAcademyIntakeCount),
    candidateToPromotion: ratio(completedPromotionCount, promotionCandidateCount),
    registeredToSelected: ratio(seasonTenSelectedCareerGeneratedCount, seasonTenRegisteredCareerGeneratedCount),
    careerGeneratedAcquisitionShare: ratio(careerGeneratedAcquisitionCount, totalAcquisitionCount),
  } as const;

  const owner = unknownOriginCount > 0
    ? "not_identified" as const
    : below(ratios.generatedToOpening, 0.5)
      ? "generation_quality_or_quantity" as const
      : below(ratios.matureAcademyToCandidate, 0.25)
        ? "development_conversion" as const
        : below(ratios.candidateToPromotion, 0.5)
          ? "academy_promotion" as const
          : below(ratios.registeredToSelected, 0.5)
            ? "ai_selection_opportunity" as const
            : seasonTenOpeningLeaderboardCount > seasonTenCareerGeneratedLeaderboardCount
              ? "retirement_or_exit" as const
              : "not_identified" as const;

  return {
    decision: unknownOriginCount > 0 ? "REFINE" : owner === "not_identified" ? "STOP_RETHINK" : "OWNER_IDENTIFIED",
    owner,
    openingPopulationCount,
    careerGeneratedCount,
    matureAcademyIntakeCount,
    promotionCandidateCount,
    completedPromotionCount,
    seasonTenRegisteredCareerGeneratedCount,
    seasonTenSelectedCareerGeneratedCount,
    seasonTenOpeningLeaderboardCount,
    seasonTenCareerGeneratedLeaderboardCount,
    seasonTenOpeningLeaderboardShare: ratio(seasonTenOpeningLeaderboardCount, leaderboardTotal),
    seasonTenCareerGeneratedLeaderboardShare: ratio(seasonTenCareerGeneratedLeaderboardCount, leaderboardTotal),
    worldsWithCareerGeneratedLeaderCount,
    competitionWorldsWithoutPromotionCount,
    careerGeneratedAcquisitionCount,
    totalAcquisitionCount,
    openingRetirementExitCount,
    unknownOriginCount,
    ratios,
  };
}

/** Applies the frozen L4.1 academy-participation and renewal gates. */
export function evaluateYouthMinutePathwayCheckpoint(
  worlds: readonly GenerationalSuccessionWorldFacts[],
): YouthMinutePathwayCheckpointDecision {
  const base = evaluateGenerationalSuccessionCheckpoint(worlds);
  const academyParticipation = sumAcademyParticipation(
    worlds.map((world) => world.academyParticipation),
  );
  const failedGateKeys: string[] = [];

  if (academyParticipation.fixtureCount <= 0) failedGateKeys.push("academy_fixture_reachability");
  if (academyParticipation.appearanceCount <= 0) failedGateKeys.push("academy_appearance_reachability");
  if (academyParticipation.minutes <= 0) failedGateKeys.push("academy_minute_reachability");
  if (academyParticipation.fullProgrammePlayerMonthCount <= 0) {
    failedGateKeys.push("academy_full_programme_reachability");
  }
  if (
    academyParticipation.reducedProgrammePlayerMonthCount
      + academyParticipation.fullyReplacedPlayerMonthCount <= 0
  ) failedGateKeys.push("academy_senior_load_replacement_reachability");
  if (academyParticipation.missingPlayerMonthCount !== 0) {
    failedGateKeys.push("academy_player_month_reconciliation");
  }
  if (academyParticipation.invalidMinuteCount !== 0) {
    failedGateKeys.push("academy_minute_reconciliation");
  }
  if (base.unknownOriginCount !== 0) failedGateKeys.push("origin_reconciliation");
  if (!atMost(base.seasonTenOpeningLeaderboardShare, 0.5)) {
    failedGateKeys.push("opening_leaderboard_share");
  }
  if (!atLeast(base.seasonTenCareerGeneratedLeaderboardShare, 0.3)) {
    failedGateKeys.push("generated_leaderboard_share");
  }
  if (base.worldsWithCareerGeneratedLeaderCount !== worlds.length) {
    failedGateKeys.push("generated_leader_every_world");
  }
  if (base.competitionWorldsWithoutPromotionCount !== 0) {
    failedGateKeys.push("promotion_every_competition_world");
  }

  const refinementFailure = failedGateKeys.some((key) =>
    key.endsWith("reconciliation")
      || key === "academy_fixture_reachability"
      || key === "academy_appearance_reachability"
      || key === "academy_minute_reachability"
      || key === "academy_full_programme_reachability"
      || key === "academy_senior_load_replacement_reachability"
  );

  return {
    decision: failedGateKeys.length === 0
      ? "GO"
      : refinementFailure
        ? "REFINE"
        : "STOP_RETHINK",
    academyParticipation,
    seasonTenOpeningLeaderboardCount: base.seasonTenOpeningLeaderboardCount,
    seasonTenCareerGeneratedLeaderboardCount:
      base.seasonTenCareerGeneratedLeaderboardCount,
    seasonTenOpeningLeaderboardShare: base.seasonTenOpeningLeaderboardShare,
    seasonTenCareerGeneratedLeaderboardShare:
      base.seasonTenCareerGeneratedLeaderboardShare,
    worldsWithCareerGeneratedLeaderCount: base.worldsWithCareerGeneratedLeaderCount,
    competitionWorldsWithoutPromotionCount:
      base.competitionWorldsWithoutPromotionCount,
    unknownOriginCount: base.unknownOriginCount,
    failedGateKeys,
  };
}

/** Applies the frozen L4.2 exit-reachability and renewal gates. */
export function evaluateCareerExitRenewalCheckpoint(
  worlds: readonly GenerationalSuccessionWorldFacts[],
): CareerExitRenewalCheckpointDecision {
  const pathway = evaluateYouthMinutePathwayCheckpoint(worlds);
  const seasonTen = worlds.flatMap(({ rows }) => rows).filter(
    ({ seasonNumber }) => seasonNumber === 10,
  );
  const openingSeniorPopulationCount = worlds.reduce(
    (sum, world) => sum + world.openingSeniorPopulationCount,
    0,
  );
  const seasonTenActiveOpeningSeniorCount = seasonTen
    .filter(({ origin }) => origin === "opening_senior")
    .reduce((sum, row) => sum + row.activePopulationCount, 0);
  const softOutfieldAgeRetirementCount = worlds.reduce(
    (sum, world) => sum + world.softOutfieldAgeRetirementCount,
    0,
  );
  const seasonTenActive33PlusCount = seasonTen
    .filter(({ ageBand }) => ageBand === "33_plus")
    .reduce((sum, row) => sum + row.activePopulationCount, 0);
  const seasonTen33PlusLeaderboardCount = sumLeaderboard(
    seasonTen.filter(({ ageBand }) => ageBand === "33_plus"),
  );
  const seasonTenActiveOpeningSeniorShare = ratio(
    seasonTenActiveOpeningSeniorCount,
    openingSeniorPopulationCount,
  );
  const carriedFailureKeys = pathway.failedGateKeys.filter((key) =>
    key.startsWith("academy_")
      || key === "origin_reconciliation"
      || key === "promotion_every_competition_world"
  );
  const failedGateKeys = [...carriedFailureKeys];

  if (softOutfieldAgeRetirementCount <= 0) {
    failedGateKeys.push("soft_outfield_retirement_reachability");
  }
  if (!atMost(seasonTenActiveOpeningSeniorShare, 0.6)) {
    failedGateKeys.push("opening_senior_survival_share");
  }
  if (!atMost(pathway.seasonTenOpeningLeaderboardShare, 0.5)) {
    failedGateKeys.push("opening_leaderboard_share");
  }
  if (!atLeast(pathway.seasonTenCareerGeneratedLeaderboardShare, 0.3)) {
    failedGateKeys.push("generated_leaderboard_share");
  }
  if (pathway.worldsWithCareerGeneratedLeaderCount !== worlds.length) {
    failedGateKeys.push("generated_leader_every_world");
  }
  if (seasonTenActive33PlusCount <= 0) {
    failedGateKeys.push("active_33_plus_reachability");
  }
  if (seasonTen33PlusLeaderboardCount <= 0) {
    failedGateKeys.push("leader_33_plus_reachability");
  }

  const refinementFailure = failedGateKeys.some((key) =>
    key.endsWith("reconciliation")
      || key.endsWith("reachability") && key !== "active_33_plus_reachability"
        && key !== "leader_33_plus_reachability"
  );

  return {
    ...pathway,
    decision: failedGateKeys.length === 0
      ? "GO"
      : refinementFailure
        ? "REFINE"
        : "STOP_RETHINK",
    failedGateKeys,
    openingSeniorPopulationCount,
    seasonTenActiveOpeningSeniorCount,
    seasonTenActiveOpeningSeniorShare,
    softOutfieldAgeRetirementCount,
    seasonTenActive33PlusCount,
    seasonTen33PlusLeaderboardCount,
  };
}

/** Attributes the residual renewal break without changing gameplay. */
export function evaluateGeneratedCeilingAttributionCheckpoint(
  worlds: readonly GenerationalSuccessionWorldFacts[],
): GeneratedCeilingAttributionDecision {
  const ownerCounts = {
    generation_quality: 0,
    development_realization: 0,
    downstream_selection_or_outcome: 0,
    not_identified: 0,
  } satisfies Record<GeneratedCeilingAttributionDecision["owner"], number>;
  let denominatorFailureCount = 0;
  const worldRows = worlds.map((world) => {
    const completeRows = world.generatedCeilingRows.filter((row) =>
      row.openingSeniorCount > 0
        && row.acceptedAnnualIntakeCount > 0
        && row.matureAnnualIntakeCount > 0
        && row.openingSeniorCurrentMedian !== "not_observed"
        && row.acceptedAnnualIntakePotentialP90 !== "not_observed"
        && row.matureAnnualIntakeCurrentP90 !== "not_observed"
    );
    denominatorFailureCount += Math.max(0, 3 - world.generatedCeilingRows.length)
      + Math.max(0, world.generatedCeilingRows.length - completeRows.length);
    const divisionOwners = completeRows.map(classifyGeneratedCeilingRow);
    const owner = ownerWithAtLeast(divisionOwners, 2);
    ownerCounts[owner] += 1;
    return { worldSeed: world.worldSeed, owner, rows: world.generatedCeilingRows };
  });
  const owner = ownerWithAtLeast(
    Object.entries(ownerCounts).flatMap(([key, count]) =>
      Array.from({ length: count }, () => key as GeneratedCeilingAttributionDecision["owner"])
    ),
    5,
  );

  return {
    decision: denominatorFailureCount > 0
      ? "REFINE"
      : owner === "not_identified"
        ? "STOP_RETHINK"
        : "OWNER_IDENTIFIED",
    owner,
    worldOwnerCounts: ownerCounts,
    denominatorFailureCount,
    worlds: worldRows,
  };
}

/** Applies the frozen L4.4 development-realization and renewal gates. */
export function evaluateDevelopmentRenewalCheckpoint(
  worlds: readonly GenerationalSuccessionWorldFacts[],
): DevelopmentRenewalCheckpointDecision {
  const exit = evaluateCareerExitRenewalCheckpoint(worlds);
  const seasonTen = worlds.flatMap(({ rows }) => rows).filter(
    ({ seasonNumber }) => seasonNumber === 10,
  );
  const generationInputSignature = l4GenerationInputSignature(worlds);
  const generationInputMatchesL4_3 =
    generationInputSignature === L4_3_GENERATION_INPUT_SIGNATURE;
  const worldsMeetingDevelopmentParity = worlds.filter((world) =>
    world.generatedCeilingRows.length === 3
      && world.generatedCeilingRows.filter((row) =>
        row.openingSeniorCurrentMedian !== "not_observed"
          && row.matureAnnualIntakeCurrentP90 !== "not_observed"
          && row.matureAnnualIntakeCurrentP90 >= row.openingSeniorCurrentMedian
      ).length >= 2
  ).length;
  const incompleteGeneratedCeilingWorldCount = worlds.filter((world) =>
    world.generatedCeilingRows.length !== 3
      || world.generatedCeilingRows.some((row) =>
        row.openingSeniorCount <= 0
          || row.acceptedAnnualIntakeCount <= 0
          || row.matureAnnualIntakeCount <= 0
          || row.openingSeniorCurrentMedian === "not_observed"
          || row.acceptedAnnualIntakePotentialP90 === "not_observed"
          || row.matureAnnualIntakeCurrentP90 === "not_observed"
      )
  ).length;
  const incompleteAcceptedRoleCoverageRowCount = worlds.reduce(
    (sum, world) => sum + world.generatedCeilingRows.filter((row) =>
      row.acceptedAnnualIntakeRoles.length !== EXPECTED_ACCEPTED_INTAKE_ROLE_COUNT
    ).length,
    0,
  );
  const abilityPairObservationCount = worlds.reduce(
    (sum, world) => sum + world.abilityPairObservationCount,
    0,
  );
  const currentAbovePotentialAbilityCount = worlds.reduce(
    (sum, world) => sum + world.currentAbovePotentialAbilityCount,
    0,
  );
  const outOfRangeAbilityValueCount = worlds.reduce(
    (sum, world) => sum + world.outOfRangeAbilityValueCount,
    0,
  );
  const failedGateKeys = exit.failedGateKeys.filter((key) =>
    key.startsWith("academy_")
      || key === "origin_reconciliation"
      || key === "promotion_every_competition_world"
      || key === "soft_outfield_retirement_reachability"
  );

  if (!generationInputMatchesL4_3) failedGateKeys.push("generation_input_signature");
  if (incompleteGeneratedCeilingWorldCount > 0) {
    failedGateKeys.push("generated_ceiling_denominator_reconciliation");
  }
  if (incompleteAcceptedRoleCoverageRowCount > 0) {
    failedGateKeys.push("accepted_intake_role_coverage");
  }
  if (abilityPairObservationCount <= 0) {
    failedGateKeys.push("ability_invariant_reachability");
  }
  if (currentAbovePotentialAbilityCount > 0) {
    failedGateKeys.push("current_above_potential");
  }
  if (outOfRangeAbilityValueCount > 0) {
    failedGateKeys.push("ability_value_range");
  }
  if (worldsMeetingDevelopmentParity < 5) {
    failedGateKeys.push("mature_intake_development_parity");
  }
  if (!atMost(exit.seasonTenActiveOpeningSeniorShare, 0.6)) {
    failedGateKeys.push("opening_senior_survival_share");
  }
  if (!atMost(exit.seasonTenOpeningLeaderboardShare, 0.5)) {
    failedGateKeys.push("opening_leaderboard_share");
  }
  if (
    !atLeast(exit.seasonTenCareerGeneratedLeaderboardShare, 0.3)
      || !atMost(exit.seasonTenCareerGeneratedLeaderboardShare, 0.6)
  ) failedGateKeys.push("generated_leaderboard_share");
  if (exit.worldsWithCareerGeneratedLeaderCount !== worlds.length) {
    failedGateKeys.push("generated_leader_every_world");
  }
  if (exit.seasonTenActive33PlusCount <= 0) {
    failedGateKeys.push("active_33_plus_reachability");
  }
  if (exit.seasonTen33PlusLeaderboardCount <= 0) {
    failedGateKeys.push("leader_33_plus_reachability");
  }

  const refinementFailure = failedGateKeys.some((key) =>
    key.endsWith("reconciliation")
      || key === "generation_input_signature"
      || key === "accepted_intake_role_coverage"
      || key === "ability_invariant_reachability"
      || key === "current_above_potential"
      || key === "ability_value_range"
      || key === "soft_outfield_retirement_reachability"
      || key.startsWith("academy_")
  );

  return {
    ...exit,
    decision: failedGateKeys.length === 0
      ? "GO"
      : refinementFailure
        ? "REFINE"
        : "STOP_RETHINK",
    failedGateKeys,
    generationInputSignature,
    expectedGenerationInputSignature: L4_3_GENERATION_INPUT_SIGNATURE,
    generationInputMatchesL4_3,
    worldsMeetingDevelopmentParity,
    abilityPairObservationCount,
    currentAbovePotentialAbilityCount,
    outOfRangeAbilityValueCount,
    incompleteGeneratedCeilingWorldCount,
    incompleteAcceptedRoleCoverageRowCount,
  };
}

/** Applies the preregistered L4.5 role-continuity and carried formation gates. */
export function evaluateAnnualRoleContinuityCheckpoint(
  worlds: readonly GenerationalSuccessionWorldFacts[],
  formationWorlds: readonly AnnualRoleFormationHealthWorldFacts[],
): AnnualRoleContinuityCheckpointDecision {
  const continuity = worlds.map((world) => world.annualRoleContinuity);
  const rows = continuity.flatMap((world) => world.rows);
  const openingRows = rows.filter((row) => row.source === "opening_academy");
  const academyRows = rows.filter((row) => row.source === "academy_refill");
  const seniorRows = rows.filter((row) => row.source === "senior_candidate");
  const plannedCandidateCount = continuity.reduce((sum, world) => sum + world.plannedCandidateCount, 0);
  const generatedCandidateCount = continuity.reduce((sum, world) => sum + world.generatedCandidateCount, 0);
  const reconciliationFailureCount = continuity.reduce(
    (sum, world) => sum + world.reconciliationFailureCount,
    0,
  );
  const seniorCandidateGeneratedSeasonCount = continuity.reduce(
    (sum, world) => sum + world.seniorCandidateGeneratedSeasonCount,
    0,
  );
  const seniorCandidateNotRequestedSeasonCount = continuity.reduce(
    (sum, world) => sum + world.seniorCandidateNotRequestedSeasonCount,
    0,
  );
  const openingAcademyDepartmentMismatchCount = continuity.reduce(
    (sum, world) => sum + world.openingAcademyDepartmentMismatchCount,
    0,
  );
  const incompleteOpeningRoleRowCount = openingRows.filter((row) =>
    row.generatedCount <= 0 || row.positiveRoles.length !== 10
  ).length + Math.max(0, worlds.length * 3 - openingRows.length);
  const expectedSeniorObservationCount = worlds.length * 2;
  const observedSeniorObservationCount =
    seniorCandidateGeneratedSeasonCount + seniorCandidateNotRequestedSeasonCount;
  const incompleteSeniorRoleRowCount = seniorRows.filter((row) =>
    row.generatedCount <= 0 || row.positiveRoles.length !== 10
  ).length
    + Math.abs(seniorCandidateGeneratedSeasonCount * 3 - seniorRows.length)
    + Math.abs(expectedSeniorObservationCount - observedSeniorObservationCount);
  const incompleteAcademyRefillRoleRowCount = academyRows.filter((row) =>
    row.generatedCount <= 0
      || row.positiveRoles.length !== row.maximumReachableRoleCount
  ).length + Math.max(0, worlds.length * 6 - academyRows.length);
  const sidedRoleImbalanceCount = rows.reduce(
    (sum, row) => sum + row.sidedRoleImbalanceCount,
    0,
  );
  const academyCallUpAppearanceCount = formationWorlds.reduce(
    (sum, world) => sum + world.opening.reduce(
      (worldSum, row) => worldSum + row.academyCallUpAppearanceCount,
      0,
    ),
    0,
  );
  const formationHealthFailureCount = formationWorlds.reduce(
    (sum, world) => sum
      + world.opening.filter((row) =>
        row.primaryRolePositiveCount !== 10
          || row.distinctFormationCount < 6
          || row.topFormationShare > 0.5
          || row.catalogOrderSensitiveSelectionCount !== 0
          || row.avoidableOutOfPositionSlotCount !== 0
      ).length
      + world.seasons.filter((row) =>
        row.primaryRolePositiveCount !== 10
          || row.distinctFormationCount < 6
          || row.topFormationShare > 0.5
          || row.fallbackSelectionCount !== 0
          || row.missingSelectionSourceCount !== 0
          || row.missingStableIdCount !== 0
          || row.reconciliationFailureCount !== 0
      ).length,
    0,
  );
  const failedGateKeys: string[] = [];
  if (plannedCandidateCount !== generatedCandidateCount || reconciliationFailureCount !== 0) {
    failedGateKeys.push("annual_role_plan_reconciliation");
  }
  if (openingAcademyDepartmentMismatchCount !== 0) {
    failedGateKeys.push("opening_academy_department_structure");
  }
  if (incompleteOpeningRoleRowCount !== 0) failedGateKeys.push("opening_academy_role_coverage");
  if (incompleteSeniorRoleRowCount !== 0) failedGateKeys.push("senior_candidate_role_coverage");
  if (incompleteAcademyRefillRoleRowCount !== 0) failedGateKeys.push("academy_refill_role_coverage");
  if (sidedRoleImbalanceCount !== 0) failedGateKeys.push("annual_role_side_balance");
  if (academyCallUpAppearanceCount <= 0) failedGateKeys.push("academy_call_up_reachability");
  if (formationHealthFailureCount !== 0) failedGateKeys.push("carried_formation_health");
  const roleFailure = failedGateKeys.some((key) => key !== "carried_formation_health");

  return {
    decision: failedGateKeys.length === 0
      ? "GO"
      : roleFailure
        ? "REFINE"
        : "STOP_RETHINK",
    failedGateKeys,
    worldCount: worlds.length,
    populationRowCount: rows.length,
    plannedCandidateCount,
    generatedCandidateCount,
    reconciliationFailureCount,
    seniorCandidateGeneratedSeasonCount,
    seniorCandidateNotRequestedSeasonCount,
    openingAcademyDepartmentMismatchCount,
    incompleteOpeningRoleRowCount,
    incompleteSeniorRoleRowCount,
    incompleteAcademyRefillRoleRowCount,
    sidedRoleImbalanceCount,
    academyCallUpAppearanceCount,
    formationHealthFailureCount,
  };
}

/** Hashes only generation facts that the pre-change L4.3 artifact serialized. */
export function l4GenerationInputSignature(
  worlds: readonly GenerationalSuccessionWorldFacts[],
): string {
  return stableSimulationReportHash(worlds
    .toSorted((left, right) => left.worldSeed.localeCompare(right.worldSeed))
    .map((world) => ({
      worldSeed: world.worldSeed,
      rows: world.generatedCeilingRows
        .toSorted((left, right) => left.competitionId.localeCompare(right.competitionId))
        .map((row) => ({
          competitionId: row.competitionId,
          openingSeniorCount: row.openingSeniorCount,
          openingSeniorCurrentMedian: row.openingSeniorCurrentMedian,
          acceptedAnnualIntakeCount: row.acceptedAnnualIntakeCount,
          acceptedAnnualIntakePotentialP90: row.acceptedAnnualIntakePotentialP90,
        })),
    })));
}

function classifyGeneratedCeilingRow(
  row: GeneratedCeilingAttributionRow,
): GeneratedCeilingAttributionDecision["owner"] {
  if (
    row.openingSeniorCurrentMedian === "not_observed"
    || row.acceptedAnnualIntakePotentialP90 === "not_observed"
    || row.matureAnnualIntakeCurrentP90 === "not_observed"
  ) return "not_identified";
  if (row.acceptedAnnualIntakePotentialP90 < row.openingSeniorCurrentMedian) {
    return "generation_quality";
  }
  return row.matureAnnualIntakeCurrentP90 < row.openingSeniorCurrentMedian
    ? "development_realization"
    : "downstream_selection_or_outcome";
}

function compareAnnualRoleRows(
  left: AnnualRoleContinuityPopulationRow,
  right: AnnualRoleContinuityPopulationRow,
): number {
  return left.seasonNumber - right.seasonNumber
    || left.competitionId.localeCompare(right.competitionId)
    || left.source.localeCompare(right.source);
}

function ownerWithAtLeast(
  owners: readonly GeneratedCeilingAttributionDecision["owner"][],
  minimum: number,
): GeneratedCeilingAttributionDecision["owner"] {
  for (const owner of [
    "generation_quality",
    "development_realization",
    "downstream_selection_or_outcome",
  ] as const) {
    if (owners.filter((candidate) => candidate === owner).length >= minimum) {
      return owner;
    }
  }
  return "not_identified";
}

function generatedCeilingRows(input: {
  readonly openingSeniorCurrent: ReadonlyMap<string, readonly number[]>;
  readonly acceptedAnnualIntakePotential: ReadonlyMap<string, readonly number[]>;
  readonly acceptedAnnualIntakeRoles: ReadonlyMap<string, ReadonlySet<string>>;
  readonly matureAnnualIntakeCurrent: ReadonlyMap<string, readonly number[]>;
}): readonly GeneratedCeilingAttributionRow[] {
  const competitionIds = [...new Set([
    ...input.openingSeniorCurrent.keys(),
    ...input.acceptedAnnualIntakePotential.keys(),
    ...input.matureAnnualIntakeCurrent.keys(),
  ])].sort();
  return competitionIds.map((competitionId) => {
    const opening = input.openingSeniorCurrent.get(competitionId) ?? [];
    const accepted = input.acceptedAnnualIntakePotential.get(competitionId) ?? [];
    const roles = input.acceptedAnnualIntakeRoles.get(competitionId) ?? new Set<string>();
    const mature = input.matureAnnualIntakeCurrent.get(competitionId) ?? [];
    return {
      competitionId,
      openingSeniorCount: opening.length,
      openingSeniorCurrentMedian: nearestRank(opening, 0.5),
      acceptedAnnualIntakeCount: accepted.length,
      acceptedAnnualIntakePotentialP90: nearestRank(accepted, 0.9),
      acceptedAnnualIntakeRoles: [...roles].sort((left, right) => left.localeCompare(right)),
      matureAnnualIntakeCount: mature.length,
      matureAnnualIntakeCurrentP90: nearestRank(mature, 0.9),
    };
  });
}

function abilityInvariantCounts(
  current: unknown,
  potential: unknown,
): {
  readonly pairCount: number;
  readonly currentAbovePotentialCount: number;
  readonly outOfRangeValueCount: number;
} {
  if (typeof current === "number") {
    const potentialNumber = typeof potential === "number" ? potential : Number.NaN;
    return {
      pairCount: 1,
      currentAbovePotentialCount:
        Number.isFinite(potentialNumber) && current > potentialNumber ? 1 : 0,
      outOfRangeValueCount:
        current < 1 || current > 20 || potentialNumber < 1 || potentialNumber > 20
          || !Number.isFinite(potentialNumber)
          ? 1
          : 0,
    };
  }
  if (current === null || typeof current !== "object") {
    return { pairCount: 0, currentAbovePotentialCount: 0, outOfRangeValueCount: 1 };
  }
  const potentialRecord = potential !== null && typeof potential === "object"
    ? potential as Record<string, unknown>
    : {};
  return Object.entries(current as Record<string, unknown>).reduce(
    (total, [key, value]) => {
      const nested = abilityInvariantCounts(value, potentialRecord[key]);
      return {
        pairCount: total.pairCount + nested.pairCount,
        currentAbovePotentialCount:
          total.currentAbovePotentialCount + nested.currentAbovePotentialCount,
        outOfRangeValueCount:
          total.outOfRangeValueCount + nested.outOfRangeValueCount,
      };
    },
    { pairCount: 0, currentAbovePotentialCount: 0, outOfRangeValueCount: 0 },
  );
}

function pushMeasure(target: Map<string, number[]>, key: string, value: number): void {
  const values = target.get(key) ?? [];
  values.push(value);
  target.set(key, values);
}

function nearestRank(
  values: readonly number[],
  quantile: number,
): number | "not_observed" {
  if (values.length === 0) return "not_observed";
  const ordered = values.toSorted((left, right) => left - right);
  const index = Math.max(0, Math.ceil(quantile * ordered.length) - 1);
  return ordered[index] ?? "not_observed";
}

function sumAcademyParticipation(
  rows: readonly AcademyParticipationCheckpointFacts[],
): AcademyParticipationCheckpointFacts {
  const result: MutableAcademyParticipationCheckpointFacts = {
    fixtureCount: 0,
    appearanceCount: 0,
    playerCount: 0,
    minutes: 0,
    fullProgrammePlayerMonthCount: 0,
    reducedProgrammePlayerMonthCount: 0,
    fullyReplacedPlayerMonthCount: 0,
    missingPlayerMonthCount: 0,
    invalidMinuteCount: 0,
  };
  for (const row of rows) {
    for (const key of ACADEMY_PARTICIPATION_KEYS) result[key] += row[key];
  }
  return result;
}

function atMost(value: number | "not_observed", limit: number): boolean {
  return value !== "not_observed" && value <= limit;
}

function atLeast(value: number | "not_observed", limit: number): boolean {
  return value !== "not_observed" && value >= limit;
}

function participationForCompetition(result: SimulateSeasonResult): Map<string, { starts: number; minutes: number }> {
  const rows = new Map<string, { starts: number; minutes: number }>();
  for (const fixture of result.fixtureParticipation) {
    for (const contribution of fixture.contributions) {
      if (!contribution.started && !contribution.substituteAppearance) continue;
      const key = String(contribution.playerId);
      const current = rows.get(key) ?? { starts: 0, minutes: 0 };
      rows.set(key, {
        starts: current.starts + Number(contribution.started),
        minutes: current.minutes + contribution.minutes,
      });
    }
  }
  return rows;
}

function topTenByGoals(result: SimulateSeasonResult) {
  return result.playerSummaryStats.toSorted((left, right) =>
    right.goals - left.goals || right.assists - left.assists || String(left.playerId).localeCompare(String(right.playerId))
  ).slice(0, 10);
}

function topTenByAssists(result: SimulateSeasonResult) {
  return result.playerSummaryStats.toSorted((left, right) =>
    right.assists - left.assists || right.goals - left.goals || String(left.playerId).localeCompare(String(right.playerId))
  ).slice(0, 10);
}

function competitionClubIds(state: CliCareerState, competitionId: string): readonly string[] {
  const registry = state.gameState.domesticCompetitionWorld;
  const id = registry?.competitionIds.find((candidate) => String(candidate) === competitionId);
  return id === undefined ? [] : registry?.competitions[id]?.clubIds.map(String) ?? [];
}

function registeredPlayersForClubs(state: CliCareerState, clubIds: ReadonlySet<string>): readonly string[] {
  const senior = state.seniorSquadState;
  if (senior === undefined) return [];
  return senior.registrationIds.flatMap((registrationId) => {
    const registration = senior.registrations[registrationId];
    if (registration === undefined || !clubIds.has(String(registration.clubId))) return [];
    return [String(registration.playerId)];
  });
}

function academyPlayersForClubs(state: CliCareerState, clubIds: ReadonlySet<string>): readonly string[] {
  const youth = state.youthAcademyState;
  if (youth === undefined) return [];
  return youth.clubRosterIds.flatMap((clubId) =>
    clubIds.has(String(clubId)) ? youth.clubRosters[clubId]?.playerIds.map(String) ?? [] : []);
}

function clubForPlayer(state: CliCareerState, playerId: string): string | undefined {
  const senior = state.seniorSquadState;
  for (const registrationId of senior?.registrationIds ?? []) {
    const registration = senior?.registrations[registrationId];
    if (registration !== undefined && String(registration.playerId) === playerId) {
      return String(registration.clubId);
    }
  }
  const lifecycle = state.youthAcademyState?.playerLifecycle[
    playerId as keyof NonNullable<CliCareerState["youthAcademyState"]>["playerLifecycle"]
  ];
  if (lifecycle !== undefined) return String(lifecycle.clubId);
  return undefined;
}

function competitionForClub(state: CliCareerState, clubId: string): { id: string; name: string } {
  const registry = state.gameState.domesticCompetitionWorld;
  for (const competitionId of registry?.competitionIds ?? []) {
    const competition = registry?.competitions[competitionId];
    if (competition?.clubIds.some((candidate) => String(candidate) === clubId) === true) {
      return { id: String(competitionId), name: competition.name };
    }
  }
  throw new Error(`Generational club has no competition: ${clubId}`);
}

function ageBandFor(age: number): GenerationalAgeBand {
  if (age < 21) return "under_21";
  if (age < 25) return "21_24";
  if (age < 30) return "25_29";
  if (age < 33) return "30_32";
  return "33_plus";
}

function finalizeRow(row: MutableRow): GenerationalSuccessionRow {
  const { currentAbilityTotal, potentialRoomTotal, abilityObservationCount, selectedPlayerIds, ...facts } = row;
  return {
    ...facts,
    selectedPlayerCount: selectedPlayerIds.size,
    currentAbilityMean: abilityObservationCount === 0 ? "not_observed" : currentAbilityTotal / abilityObservationCount,
    potentialRoomMean: abilityObservationCount === 0 ? "not_observed" : potentialRoomTotal / abilityObservationCount,
  };
}

function compareRows(left: GenerationalSuccessionRow, right: GenerationalSuccessionRow): number {
  return left.seasonNumber - right.seasonNumber
    || left.competitionId.localeCompare(right.competitionId)
    || left.origin.localeCompare(right.origin)
    || left.ageBand.localeCompare(right.ageBand);
}

function isCareerGenerated(origin: GenerationalOrigin): boolean {
  return origin === "annual_academy_intake" || origin === "annual_senior_intake";
}

function sumCareerGenerated(
  rows: readonly GenerationalSuccessionRow[],
  key: "registeredSeniorCount" | "selectedPlayerCount",
): number {
  return rows.filter(({ origin }) => isCareerGenerated(origin)).reduce((sum, row) => sum + row[key], 0);
}

function sumLeaderboard(rows: readonly GenerationalSuccessionRow[]): number {
  return rows.reduce((sum, row) => sum + row.scorerLeaderboardCount + row.assistLeaderboardCount, 0);
}

function ratio(numerator: number, denominator: number): number | "not_observed" {
  return denominator === 0 ? "not_observed" : numerator / denominator;
}

function below(value: number | "not_observed", threshold: number): boolean {
  return value !== "not_observed" && value < threshold;
}
