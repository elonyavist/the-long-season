import {
  assignGeneratedSquadIdentities,
  GENERATED_SQUAD_IDENTITIES,
  GENERATED_SQUAD_IDENTITY_KEYS,
  primaryRoleForPosition,
  type AnnualWorldRoleContinuityDiagnostics,
  type GeneratedSquadIdentityKey,
} from "@game/content";
import {
  completedPlayerAge,
  fieldablePlayerIdsFor,
  summarizePlayerDevelopmentAbilities,
  type FormationKey,
  type SimulateSeasonResult,
} from "@game/engine";

import type { CliCareerState, CliPlayer } from "../career/types.ts";
import {
  evaluateGenerationalRenewalAttribution,
  type GenerationalRenewalOwner,
  type GenerationalSuccessionWorldFacts,
} from "./generational-succession.ts";
import {
  HISTORICAL_DIVISION_TABLE_TARGETS,
  HISTORICAL_FIRST_DIVISION_PLAYER_TARGETS,
} from "./historical-simulation-targets.ts";

export const FIRST_DIVISION_COMPETITION_ID = "competition:ita-1";
type PlayerRole = NonNullable<CliPlayer["primaryRole"]>;
const PLAYER_ROLES: readonly PlayerRole[] = [...new Set(GENERATED_SQUAD_IDENTITY_KEYS.flatMap((key) =>
  GENERATED_SQUAD_IDENTITIES[key].positions.map(primaryRoleForPosition)))].sort();
const GAP_BUCKETS = ["under_0_25", "0_25_to_0_5", "0_5_to_1", "1_plus"] as const;
type StrengthGapBucket = typeof GAP_BUCKETS[number];

export type TableHierarchyOwner =
  | "population_strength"
  | "match_translation"
  | "draw_resolution"
  | "not_attributed";
export type PlayerLoadOwner = "selection_load" | "renewal_quality" | "not_attributed";
export type LeaderProductionOwner = "actor_allocation" | "occasion_execution" | "not_attributed";
export type ClubIdentityOwner = "annual_intake_identity_erosion" | "not_attributed";

export interface OwnerAttributionGapBucketFact {
  readonly bucket: StrengthGapBucket;
  readonly fixtureCount: number;
  readonly favoriteWins: number;
  readonly favoritePoints: number;
  readonly draws: number;
}

export interface OwnerAttributionTableSeasonFact {
  readonly competitionId: string;
  readonly seasonNumber: number;
  readonly fixtureCount: number;
  readonly championPoints: number;
  readonly lastPoints: number;
  readonly pointsSpread: number;
  readonly goalsPerMatch: number;
  readonly drawShare: number;
  readonly ppgStandardDeviation: number;
  readonly pairedChampionPoints: number;
  readonly pairedLastPoints: number;
  readonly pairedPointsSpread: number;
  readonly pairedDrawShare: number;
  readonly pairedPpgStandardDeviation: number;
  readonly kickoffStrengthMean: number;
  readonly kickoffStrengthSpread: number;
  readonly strengthPointsRankCorrelation: number | "not_observed";
  readonly tiedStrengthFixtureCount: number;
  readonly gapBuckets: readonly OwnerAttributionGapBucketFact[];
}

export interface OwnerAttributionPlayerSeasonFact {
  readonly competitionId: string;
  readonly seasonNumber: number;
  readonly playerId: string;
  readonly clubId: string;
  readonly age: number;
  readonly role: PlayerRole;
  readonly currentAbility: number;
  readonly potentialRoom: number;
  readonly appearances: number;
  readonly starts: number;
  readonly minutes: number;
  /** Canonical shots and therefore shooter nominations; one stored fact, not two. */
  readonly shots: number;
  readonly shotsOnTarget: number;
  readonly creatorNominations: number;
  readonly goals: number;
  readonly assists: number;
}

export interface OwnerAttributionSelectionLoadSeasonFact {
  readonly competitionId: string;
  readonly seasonNumber: number;
  readonly veteranStarterCount: number;
  readonly qualityMatchedYoungerAlternativeCount: number;
  readonly fresherQualityMatchedYoungerAlternativeCount: number;
}

export interface OwnerAttributionClubIdentitySeasonFact {
  readonly competitionId: string;
  readonly seasonNumber: number;
  readonly clubId: string;
  readonly identityKey: GeneratedSquadIdentityKey;
  readonly openingRoleVector: Readonly<Record<PlayerRole, number>>;
  readonly currentRoleVector: Readonly<Record<PlayerRole, number>>;
  readonly intakeRoleVector: Readonly<Record<PlayerRole, number>>;
  readonly normalizedRoleDistance: number;
  readonly currentAbilityMean: number;
  readonly openingAbilityMean: number;
  readonly modalFormation: FormationKey;
  readonly seasonOneModalFormation: FormationKey;
  readonly shapeChangedFromSeasonOne: boolean;
}

export interface OwnerAttributionWorldFacts {
  readonly worldSeed: string;
  readonly tableSeasons: readonly OwnerAttributionTableSeasonFact[];
  readonly playerSeasons: readonly OwnerAttributionPlayerSeasonFact[];
  readonly selectionLoadSeasons: readonly OwnerAttributionSelectionLoadSeasonFact[];
  readonly clubIdentitySeasons: readonly OwnerAttributionClubIdentitySeasonFact[];
  readonly annualRolePlanReconciliationFailureCount: number;
  readonly annualRolePlanPositiveRoleCounts: readonly number[];
  readonly reconciliationFailureCount: number;
}

export interface OwnerAttributionDecision {
  readonly decision: "OWNER_IDENTIFIED" | "REFINE";
  readonly owners: {
    readonly tableHierarchy: TableHierarchyOwner;
    readonly playerLoad: PlayerLoadOwner;
    readonly leaderProduction: LeaderProductionOwner;
    readonly clubIdentity: ClubIdentityOwner;
    readonly generationalRenewal: GenerationalRenewalOwner;
  };
  readonly table: {
    readonly firstDivisionSeasonCount: number;
    readonly championPointsMean: number | "not_observed";
    readonly pointsSpreadMean: number | "not_observed";
    readonly ppgStandardDeviationMean: number | "not_observed";
    readonly drawShareMean: number | "not_observed";
    readonly goalsPerMatchMean: number | "not_observed";
    readonly kickoffStrengthSpreadMean: number | "not_observed";
    readonly rankCorrelationMean: number | "not_observed";
    readonly largestGapFavoriteWinShare: number | "not_observed";
    readonly largestGapFavoritePointsPerMatch: number | "not_observed";
    readonly pairedChampionPointsMean: number | "not_observed";
    readonly pairedPointsSpreadMean: number | "not_observed";
    readonly pairedPpgStandardDeviationMean: number | "not_observed";
    readonly pairedDrawShareMean: number | "not_observed";
    readonly pairedPointsSpreadDelta: number | "not_observed";
    readonly pairedPpgStandardDeviationDelta: number | "not_observed";
    readonly pairedDrawShareReduction: number | "not_observed";
  };
  readonly players: {
    readonly firstDivisionPlayerSeasonCount: number;
    readonly age33PlusStartsMean: number | "not_observed";
    readonly age33PlusMinutesMean: number | "not_observed";
    readonly qualityMatchedVeteranStartEdge: number | "not_observed";
    readonly veteranStarterSelectionCount: number;
    readonly qualityMatchedYoungerAlternativeShare: number | "not_observed";
    readonly fresherQualityMatchedYoungerAlternativeShare: number | "not_observed";
    readonly shooterAbilityNominationCorrelation: number | "not_observed";
    readonly creatorAbilityNominationCorrelation: number | "not_observed";
    readonly topScorerMean: number | "not_observed";
    readonly topAssistMean: number | "not_observed";
    readonly topTenScorerMean: number | "not_observed";
    readonly topTenAssistMean: number | "not_observed";
    readonly scorerMeanAge: number | "not_observed";
    readonly assistMeanAge: number | "not_observed";
    readonly age33PlusScorerShare: number | "not_observed";
    readonly age33PlusAssistShare: number | "not_observed";
    readonly exceptional33PlusLeaderObservationCount: number;
    readonly generatedLeaderShareSeasonTen: number | "not_observed";
    readonly openingLeaderShareSeasonTen: number | "not_observed";
  };
  readonly identity: {
    readonly clubSeasonCount: number;
    readonly replicatedFormationRetentionShare: number | "not_observed";
    readonly changedShapeRoleDistanceMean: number | "not_observed";
    readonly stableShapeRoleDistanceMean: number | "not_observed";
    readonly comparableQualityChangedShapeCount: number;
    readonly annualRolePlanHealthy: boolean;
  };
  readonly renewal: ReturnType<typeof evaluateGenerationalRenewalAttribution>;
  readonly reconciliationFailureCount: number;
  readonly worlds: readonly OwnerAttributionWorldFacts[];
}

/** Frozen L5.3 decision over first-division use, leaders and renewal. */
export interface PlayerRenewalLeadersCheckpointDecision {
  readonly decision: "GO" | "REFINE";
  readonly failedGateKeys: readonly string[];
  readonly players: OwnerAttributionDecision["players"];
  readonly reconciliationFailureCount: number;
}

/** Read-only owner inspector attached to the canonical three-competition run. */
export class OwnerAttributionObserver {
  private readonly worldSeed: string;
  private readonly openingRoles = new Map<string, Readonly<Record<PlayerRole, number>>>();
  private readonly openingAbilities = new Map<string, number>();
  private readonly identities = new Map<string, GeneratedSquadIdentityKey>();
  private readonly seasonOneShapes = new Map<string, FormationKey>();
  private readonly intakeRoles = new Map<string, Readonly<Record<PlayerRole, number>>>();
  private readonly tableSeasons: OwnerAttributionTableSeasonFact[] = [];
  private readonly playerSeasons: OwnerAttributionPlayerSeasonFact[] = [];
  private readonly selectionLoadSeasons: OwnerAttributionSelectionLoadSeasonFact[] = [];
  private readonly clubIdentitySeasons: OwnerAttributionClubIdentitySeasonFact[] = [];
  private readonly annualRolePlanPositiveRoleCounts: number[] = [];
  private annualRolePlanReconciliationFailureCount = 0;
  private reconciliationFailureCount = 0;
  private readonly includeTableAttribution: boolean;

  public constructor(
    worldSeed: string,
    options: { readonly includeTableAttribution?: boolean } = {},
  ) {
    this.worldSeed = worldSeed;
    this.includeTableAttribution = options.includeTableAttribution ?? true;
  }

  public observeOpening(careerState: CliCareerState): void {
    const registry = careerState.gameState.domesticCompetitionWorld;
    if (registry === undefined) throw new Error("L5.1 opening state has no domestic competition world");
    for (const competitionId of registry.competitionIds) {
      const competition = registry.competitions[competitionId];
      if (competition === undefined) throw new Error(`L5.1 opening competition is missing: ${competitionId}`);
      const identities = assignGeneratedSquadIdentities({
        seed: this.worldSeed,
        competitionIdentityKey: competitionId,
        orderedClubIds: competition.clubIds,
      });
      for (const clubId of competition.clubIds) {
        const club = careerState.gameState.clubs[clubId];
        const identity = identities.get(clubId);
        if (club === undefined || identity === undefined) throw new Error(`L5.1 opening club is missing: ${clubId}`);
        const players = fieldablePlayerIdsFor(club).map((playerId) => {
          const player = careerState.gameState.players[playerId];
          if (player === undefined) throw new Error(`L5.1 opening player is missing: ${playerId}`);
          return player;
        });
        this.openingRoles.set(String(clubId), roleVector(players.map(({ primaryRole }) => primaryRole)));
        this.openingAbilities.set(String(clubId), mean(players.map(currentAbility)));
        this.identities.set(String(clubId), identity.key);
      }
    }
  }

  public observeCompetitionSeason(input: {
    readonly seasonNumber: number;
    readonly competitionId: string;
    readonly result: SimulateSeasonResult;
    readonly careerState: CliCareerState;
  }): void {
    if (this.includeTableAttribution) {
      this.tableSeasons.push(tableSeasonFact(input));
    }
    this.reconciliationFailureCount += opportunityReconciliationFailureCount(input.result);
    this.playerSeasons.push(...playerSeasonFacts(input));
    this.selectionLoadSeasons.push(selectionLoadSeasonFact(input));
    this.clubIdentitySeasons.push(...this.identitySeasonFacts(input));
  }

  public observeGeneratedIntakeRoles(input: {
    readonly seasonNumber: number;
    readonly diagnostics: AnnualWorldRoleContinuityDiagnostics;
  }): void {
    for (const population of [
      input.diagnostics.academyRefill,
      ...(input.diagnostics.seniorCandidate.status === "generated"
        ? [input.diagnostics.seniorCandidate.population]
        : []),
    ]) {
      this.annualRolePlanReconciliationFailureCount += population.reconciliationFailureCount;
      this.annualRolePlanPositiveRoleCounts.push(new Set(
        population.candidates.map(({ position }) => primaryRoleForPosition(position)),
      ).size);
      for (const candidate of population.candidates) {
        const key = `${input.seasonNumber + 1}|${candidate.targetClubId}`;
        const current = this.intakeRoles.get(key) ?? emptyRoleVector();
        this.intakeRoles.set(key, {
          ...current,
          [primaryRoleForPosition(candidate.position)]: current[primaryRoleForPosition(candidate.position)] + 1,
        });
      }
    }
  }

  public facts(): OwnerAttributionWorldFacts {
    return {
      worldSeed: this.worldSeed,
      tableSeasons: this.tableSeasons,
      playerSeasons: this.playerSeasons,
      selectionLoadSeasons: this.selectionLoadSeasons,
      clubIdentitySeasons: this.clubIdentitySeasons,
      annualRolePlanReconciliationFailureCount: this.annualRolePlanReconciliationFailureCount,
      annualRolePlanPositiveRoleCounts: this.annualRolePlanPositiveRoleCounts,
      reconciliationFailureCount: this.reconciliationFailureCount,
    };
  }

  private identitySeasonFacts(input: {
    readonly seasonNumber: number;
    readonly competitionId: string;
    readonly result: SimulateSeasonResult;
    readonly careerState: CliCareerState;
  }): readonly OwnerAttributionClubIdentitySeasonFact[] {
    const formationCounts = new Map<string, Map<FormationKey, number>>();
    for (const fixture of input.result.fixtureParticipation) {
      for (const team of [fixture.fieldedTeams.home, fixture.fieldedTeams.away]) {
        if (team.formationKey === undefined) {
          this.reconciliationFailureCount += 1;
          continue;
        }
        const clubId = String(team.clubId);
        const counts = formationCounts.get(clubId) ?? new Map<FormationKey, number>();
        counts.set(team.formationKey, (counts.get(team.formationKey) ?? 0) + 1);
        formationCounts.set(clubId, counts);
      }
    }
    return input.result.table.map(({ clubId }) => {
      const club = input.careerState.gameState.clubs[clubId];
      const openingRoleVector = this.openingRoles.get(String(clubId));
      const openingAbilityMean = this.openingAbilities.get(String(clubId));
      const identityKey = this.identities.get(String(clubId));
      const counts = formationCounts.get(String(clubId));
      const modal = counts === undefined ? undefined : [...counts].sort(
        ([leftKey, leftCount], [rightKey, rightCount]) => rightCount - leftCount || leftKey.localeCompare(rightKey),
      )[0]?.[0];
      if (
        club === undefined || openingRoleVector === undefined || openingAbilityMean === undefined
        || identityKey === undefined || modal === undefined
      ) throw new Error(`L5.1 identity join is incomplete: ${clubId}`);
      if (input.seasonNumber === 1) this.seasonOneShapes.set(String(clubId), modal);
      const seasonOneModalFormation = this.seasonOneShapes.get(String(clubId));
      if (seasonOneModalFormation === undefined) throw new Error(`L5.1 season-one shape is missing: ${clubId}`);
      const players = fieldablePlayerIdsFor(club).map((playerId) => {
        const player = input.careerState.gameState.players[playerId];
        if (player === undefined) throw new Error(`L5.1 current player is missing: ${playerId}`);
        return player;
      });
      const currentRoleVector = roleVector(players.map(({ primaryRole }) => primaryRole));
      return {
        competitionId: input.competitionId,
        seasonNumber: input.seasonNumber,
        clubId: String(clubId),
        identityKey,
        openingRoleVector,
        currentRoleVector,
        intakeRoleVector: this.intakeRoles.get(`${input.seasonNumber}|${clubId}`) ?? emptyRoleVector(),
        normalizedRoleDistance: normalizedRoleDistance(openingRoleVector, currentRoleVector),
        currentAbilityMean: mean(players.map(currentAbility)),
        openingAbilityMean,
        modalFormation: modal,
        seasonOneModalFormation,
        shapeChangedFromSeasonOne: modal !== seasonOneModalFormation,
      };
    });
  }
}

/** Applies the frozen L5.1 owner rules to canonical observations. */
export function evaluateOwnerAttributionCheckpoint(input: {
  readonly worlds: readonly OwnerAttributionWorldFacts[];
  readonly generationalWorlds: readonly GenerationalSuccessionWorldFacts[];
  readonly replicatedFormationRetentionShare: number | "not_observed";
  readonly tableAttribution: "required" | "not_requested";
}): OwnerAttributionDecision {
  const firstDivisionTables = input.worlds.flatMap(({ tableSeasons }) => tableSeasons)
    .filter(({ competitionId }) => competitionId === FIRST_DIVISION_COMPETITION_ID);
  const firstDivisionPlayers = input.worlds.flatMap(({ playerSeasons }) => playerSeasons)
    .filter(({ competitionId }) => competitionId === FIRST_DIVISION_COMPETITION_ID);
  const firstDivisionSelectionLoad = input.worlds.flatMap(({ selectionLoadSeasons }) => selectionLoadSeasons)
    .filter(({ competitionId }) => competitionId === FIRST_DIVISION_COMPETITION_ID);
  const firstDivisionIdentity = input.worlds.flatMap(({ clubIdentitySeasons }) => clubIdentitySeasons)
    .filter(({ competitionId }) => competitionId === FIRST_DIVISION_COMPETITION_ID);
  const largestGap = sumGapBuckets(firstDivisionTables, "1_plus");
  const controlPointsSpreadMean = observedMean(firstDivisionTables.map(({ pointsSpread }) => pointsSpread));
  const controlPpgStandardDeviationMean = observedMean(
    firstDivisionTables.map(({ ppgStandardDeviation }) => ppgStandardDeviation),
  );
  const controlDrawShareMean = observedMean(firstDivisionTables.map(({ drawShare }) => drawShare));
  const pairedPointsSpreadMean = observedMean(firstDivisionTables.map(({ pairedPointsSpread }) => pairedPointsSpread));
  const pairedPpgStandardDeviationMean = observedMean(
    firstDivisionTables.map(({ pairedPpgStandardDeviation }) => pairedPpgStandardDeviation),
  );
  const pairedDrawShareMean = observedMean(firstDivisionTables.map(({ pairedDrawShare }) => pairedDrawShare));
  const table = {
    firstDivisionSeasonCount: firstDivisionTables.length,
    championPointsMean: observedMean(firstDivisionTables.map(({ championPoints }) => championPoints)),
    pointsSpreadMean: controlPointsSpreadMean,
    ppgStandardDeviationMean: controlPpgStandardDeviationMean,
    drawShareMean: controlDrawShareMean,
    goalsPerMatchMean: observedMean(firstDivisionTables.map(({ goalsPerMatch }) => goalsPerMatch)),
    kickoffStrengthSpreadMean: observedMean(firstDivisionTables.map(({ kickoffStrengthSpread }) => kickoffStrengthSpread)),
    rankCorrelationMean: observedMean(firstDivisionTables.flatMap(({ strengthPointsRankCorrelation }) =>
      strengthPointsRankCorrelation === "not_observed" ? [] : [strengthPointsRankCorrelation])),
    largestGapFavoriteWinShare: ratio(largestGap.favoriteWins, largestGap.fixtureCount),
    largestGapFavoritePointsPerMatch: ratio(largestGap.favoritePoints, largestGap.fixtureCount),
    pairedChampionPointsMean: observedMean(firstDivisionTables.map(({ pairedChampionPoints }) => pairedChampionPoints)),
    pairedPointsSpreadMean,
    pairedPpgStandardDeviationMean,
    pairedDrawShareMean,
    pairedPointsSpreadDelta: observedDifference(pairedPointsSpreadMean, controlPointsSpreadMean),
    pairedPpgStandardDeviationDelta: observedDifference(
      pairedPpgStandardDeviationMean,
      controlPpgStandardDeviationMean,
    ),
    pairedDrawShareReduction: observedDifference(controlDrawShareMean, pairedDrawShareMean),
  } as const;
  const generation = generationalLeaderShares(input.generationalWorlds);
  const age33Plus = firstDivisionPlayers.filter(({ age }) => age >= 33);
  const qualityMatchedVeteranStartEdge = matchedVeteranStartEdge(firstDivisionPlayers);
  const veteranStarterSelectionCount = firstDivisionSelectionLoad.reduce(
    (sum, row) => sum + row.veteranStarterCount,
    0,
  );
  const players = {
    firstDivisionPlayerSeasonCount: firstDivisionPlayers.length,
    age33PlusStartsMean: observedMean(age33Plus.map(({ starts }) => starts)),
    age33PlusMinutesMean: observedMean(age33Plus.map(({ minutes }) => minutes)),
    qualityMatchedVeteranStartEdge,
    veteranStarterSelectionCount,
    qualityMatchedYoungerAlternativeShare: ratio(
      firstDivisionSelectionLoad.reduce(
        (sum, row) => sum + row.qualityMatchedYoungerAlternativeCount,
        0,
      ),
      veteranStarterSelectionCount,
    ),
    fresherQualityMatchedYoungerAlternativeShare: ratio(
      firstDivisionSelectionLoad.reduce(
        (sum, row) => sum + row.fresherQualityMatchedYoungerAlternativeCount,
        0,
      ),
      veteranStarterSelectionCount,
    ),
    shooterAbilityNominationCorrelation: withinRoleAbilityCorrelation(firstDivisionPlayers, "shots"),
    creatorAbilityNominationCorrelation: withinRoleAbilityCorrelation(firstDivisionPlayers, "creatorNominations"),
    ...leaderProductionFacts(firstDivisionPlayers),
    ...generation,
  } as const;
  const replicatedFormationRetentionShare = input.replicatedFormationRetentionShare;
  const changed = firstDivisionIdentity.filter(({ shapeChangedFromSeasonOne }) => shapeChangedFromSeasonOne);
  const stable = firstDivisionIdentity.filter(({ shapeChangedFromSeasonOne }) => !shapeChangedFromSeasonOne);
  const comparableChanged = changed.filter(({ currentAbilityMean, openingAbilityMean }) =>
    Math.abs(currentAbilityMean - openingAbilityMean) <= 0.5);
  const annualRolePlanHealthy = input.worlds.every((world) =>
    world.annualRolePlanReconciliationFailureCount === 0
      && world.annualRolePlanPositiveRoleCounts.every((count) => count === PLAYER_ROLES.length));
  const identity = {
    clubSeasonCount: firstDivisionIdentity.length,
    replicatedFormationRetentionShare,
    changedShapeRoleDistanceMean: observedMean(changed.map(({ normalizedRoleDistance }) => normalizedRoleDistance)),
    stableShapeRoleDistanceMean: observedMean(stable.map(({ normalizedRoleDistance }) => normalizedRoleDistance)),
    comparableQualityChangedShapeCount: comparableChanged.length,
    annualRolePlanHealthy,
  } as const;
  const leaderProduction = leaderProductionOwner(players);
  const generationalRenewal = evaluateGenerationalRenewalAttribution({
    worlds: input.generationalWorlds,
    actorAllocationOwnsResidual: leaderProduction === "actor_allocation",
  });
  const owners = {
    tableHierarchy: tableHierarchyOwner(table),
    playerLoad: playerLoadAttributionOwner(players),
    leaderProduction,
    clubIdentity: identityOwner(identity),
    generationalRenewal: generationalRenewal.owner,
  } as const;
  const reconciliationFailureCount = input.worlds.reduce(
    (sum, world) => sum + world.reconciliationFailureCount + world.annualRolePlanReconciliationFailureCount,
    0,
  )
    + Number(input.worlds.length === 0)
    + Number(input.generationalWorlds.length !== input.worlds.length)
    + Number(
      input.tableAttribution === "required"
      && firstDivisionTables.length !== input.worlds.length * 10,
    )
    + generationalRenewal.reconciliationFailureCount;
  return {
    decision: ownerAttributionDecision(owners, reconciliationFailureCount),
    owners,
    table,
    players,
    identity,
    renewal: generationalRenewal,
    reconciliationFailureCount,
    worlds: input.worlds,
  };
}

/**
 * Applies the preregistered L5.3 target register to the canonical L5.1 facts.
 *
 * Reusing the owner observer matters: starts, minutes, nominations, current
 * ability, leader rows and player origin stay one set of facts. This function
 * changes only the question asked of them after the two demonstrated owners
 * have been corrected.
 */
export function evaluatePlayerRenewalLeadersCheckpoint(input: {
  readonly worlds: readonly OwnerAttributionWorldFacts[];
  readonly generationalWorlds: readonly GenerationalSuccessionWorldFacts[];
  readonly replicatedFormationRetentionShare: number | "not_observed";
}): PlayerRenewalLeadersCheckpointDecision {
  const evaluated = evaluateOwnerAttributionCheckpoint({
    ...input,
    tableAttribution: "not_requested",
  });
  const players = evaluated.players;
  const failedGateKeys = playerRenewalLeadersFailedGateKeys(
    players,
    evaluated.reconciliationFailureCount,
  );
  return {
    decision: failedGateKeys.length === 0 ? "GO" : "REFINE",
    failedGateKeys,
    players,
    reconciliationFailureCount: evaluated.reconciliationFailureCount,
  };
}

/** Total L5.3 gate rule, independently testable from the expensive cohort. */
export function playerRenewalLeadersFailedGateKeys(
  players: OwnerAttributionDecision["players"],
  reconciliationFailureCount: number,
): readonly string[] {
  const targets = HISTORICAL_FIRST_DIVISION_PLAYER_TARGETS;
  return [
    ...(!inside(players.age33PlusStartsMean, targets.age33PlusStarts)
      ? ["age33_plus_starts"] : []),
    ...(!inside(players.age33PlusMinutesMean, targets.age33PlusMinutes)
      ? ["age33_plus_minutes"] : []),
    ...(!inside(players.generatedLeaderShareSeasonTen, targets.generatedLeaderShareSeasonTen)
      ? ["generated_leader_share_season_ten"] : []),
    ...(!inside(players.openingLeaderShareSeasonTen, targets.openingLeaderShareSeasonTen)
      ? ["opening_leader_share_season_ten"] : []),
    ...(!inside(players.topTenScorerMean, targets.topTenScorerMean)
      ? ["top_ten_scorer_mean"] : []),
    ...(!inside(players.topTenAssistMean, targets.topTenAssistMean)
      ? ["top_ten_assist_mean"] : []),
    ...(!inside(players.scorerMeanAge, targets.scorerMeanAge)
      ? ["scorer_mean_age"] : []),
    ...(!inside(players.assistMeanAge, targets.assistMeanAge)
      ? ["assist_mean_age"] : []),
    ...(!inside(players.age33PlusScorerShare, targets.age33PlusScorerShare)
      ? ["age33_plus_scorer_share"] : []),
    ...(!inside(players.age33PlusAssistShare, targets.age33PlusAssistShare)
      ? ["age33_plus_assist_share"] : []),
    ...(players.exceptional33PlusLeaderObservationCount <= 0
      ? ["exceptional_33_plus_leader_reachability"] : []),
    ...(reconciliationFailureCount > 0 ? ["reconciliation"] : []),
  ];
}

function inside(
  value: number | "not_observed",
  band: { readonly min: number; readonly max: number },
): boolean {
  return value !== "not_observed" && value >= band.min && value <= band.max;
}

/**
 * Fails the owner checkpoint closed when any red family remains unexplained.
 *
 * Reconciliation proves that facts agree; it does not prove that those facts
 * identify an owner. Keeping this rule separate prevents a successful join
 * from becoming a successful product decision again.
 */
export function ownerAttributionDecision(
  owners: OwnerAttributionDecision["owners"],
  reconciliationFailureCount: number,
): OwnerAttributionDecision["decision"] {
  const allOwnersIdentified = owners.tableHierarchy !== "not_attributed"
    && owners.playerLoad !== "not_attributed"
    && owners.leaderProduction !== "not_attributed"
    && owners.clubIdentity !== "not_attributed"
    && owners.generationalRenewal !== "not_attributed";
  return reconciliationFailureCount === 0 && allOwnersIdentified ? "OWNER_IDENTIFIED" : "REFINE";
}

function opportunityReconciliationFailureCount(result: SimulateSeasonResult): number {
  const shots = result.playerOpportunityStats.reduce((sum, row) => sum + row.shots, 0);
  const shotsOnTarget = result.playerOpportunityStats.reduce((sum, row) => sum + row.shotsOnTarget, 0);
  const creators = result.playerOpportunityStats.reduce((sum, row) => sum + row.creatorNominations, 0);
  const matchShots = result.fixtures.reduce((sum, fixture) => sum
    + (fixture.result?.report?.stats.home.shots ?? 0)
    + (fixture.result?.report?.stats.away.shots ?? 0), 0);
  const matchShotsOnTarget = result.fixtures.reduce((sum, fixture) => sum
    + (fixture.result?.report?.stats.home.shotsOnTarget ?? 0)
    + (fixture.result?.report?.stats.away.shotsOnTarget ?? 0), 0);
  const summaryGoals = result.playerSummaryStats.reduce((sum, row) => sum + row.goals, 0);
  const tableGoals = result.table.reduce((sum, row) => sum + row.goalsFor, 0);
  return Number(shots !== matchShots)
    + Number(shotsOnTarget !== matchShotsOnTarget)
    + Number(creators > shots)
    + Number(summaryGoals !== tableGoals);
}

function tableSeasonFact(input: {
  readonly seasonNumber: number;
  readonly competitionId: string;
  readonly result: SimulateSeasonResult;
}): OwnerAttributionTableSeasonFact {
  const champion = input.result.table[0];
  const last = input.result.table.at(-1);
  if (champion === undefined || last === undefined || input.result.fixtures.length === 0) {
    throw new Error(`L5.1 table is empty: ${input.competitionId}:${input.seasonNumber}`);
  }
  const pairedTable = input.result.analysisStrengthReplay?.table;
  if (input.result.analysisStrengthReplay?.scale !== 1.5 || pairedTable === undefined) {
    throw new Error(`L5.1 paired table is missing: ${input.competitionId}:${input.seasonNumber}`);
  }
  const fixtures = new Map(input.result.fixtures.map((fixture) => [fixture.id, fixture]));
  const strengthByClub = new Map<string, number[]>();
  const buckets = new Map<StrengthGapBucket, { fixtureCount: number; favoriteWins: number; favoritePoints: number; draws: number }>(
    GAP_BUCKETS.map((bucket) => [bucket, { fixtureCount: 0, favoriteWins: 0, favoritePoints: 0, draws: 0 }]),
  );
  let tiedStrengthFixtureCount = 0;
  for (const participation of input.result.fixtureParticipation) {
    const fixture = fixtures.get(participation.fixtureId);
    const result = fixture?.result;
    if (fixture === undefined || result === undefined) throw new Error(`L5.1 fixture result is missing: ${participation.fixtureId}`);
    const homeStrength = participation.fieldedTeams.home.kickoffStrength?.overall;
    const awayStrength = participation.fieldedTeams.away.kickoffStrength?.overall;
    if (homeStrength === undefined || awayStrength === undefined) {
      throw new Error(`L5.1 kickoff strength is missing: ${participation.fixtureId}`);
    }
    pushMap(strengthByClub, String(fixture.homeClubId), homeStrength);
    pushMap(strengthByClub, String(fixture.awayClubId), awayStrength);
    const gap = Math.abs(homeStrength - awayStrength);
    if (gap === 0) {
      tiedStrengthFixtureCount += 1;
      continue;
    }
    const favoriteHome = homeStrength > awayStrength;
    const favoriteGoals = favoriteHome ? result.homeGoals : result.awayGoals;
    const opponentGoals = favoriteHome ? result.awayGoals : result.homeGoals;
    const bucket = buckets.get(gapBucket(gap));
    if (bucket === undefined) throw new Error(`L5.1 gap bucket is missing: ${gap}`);
    bucket.fixtureCount += 1;
    bucket.favoriteWins += favoriteGoals > opponentGoals ? 1 : 0;
    bucket.draws += favoriteGoals === opponentGoals ? 1 : 0;
    bucket.favoritePoints += favoriteGoals > opponentGoals ? 3 : favoriteGoals === opponentGoals ? 1 : 0;
  }
  const clubStrengths = input.result.table.map(({ clubId }) => mean(strengthByClub.get(String(clubId)) ?? []));
  const points = input.result.table.map(({ points: value }) => value);
  const control = compactTableMetrics(input.result.table, input.result.fixtures.length);
  const paired = compactTableMetrics(pairedTable, input.result.fixtures.length);
  return {
    competitionId: input.competitionId,
    seasonNumber: input.seasonNumber,
    fixtureCount: input.result.fixtures.length,
    championPoints: control.championPoints,
    lastPoints: control.lastPoints,
    pointsSpread: control.pointsSpread,
    goalsPerMatch: control.goalsPerMatch,
    drawShare: control.drawShare,
    ppgStandardDeviation: control.ppgStandardDeviation,
    pairedChampionPoints: paired.championPoints,
    pairedLastPoints: paired.lastPoints,
    pairedPointsSpread: paired.pointsSpread,
    pairedDrawShare: paired.drawShare,
    pairedPpgStandardDeviation: paired.ppgStandardDeviation,
    kickoffStrengthMean: mean(clubStrengths),
    kickoffStrengthSpread: Math.max(...clubStrengths) - Math.min(...clubStrengths),
    strengthPointsRankCorrelation: spearman(clubStrengths, points),
    tiedStrengthFixtureCount,
    gapBuckets: GAP_BUCKETS.map((bucket) => ({ bucket, ...buckets.get(bucket)! })),
  };
}

/** Derives the same compact hierarchy facts from control and paired tables. */
function compactTableMetrics(
  table: SimulateSeasonResult["table"],
  fixtureCount: number,
): {
  readonly championPoints: number;
  readonly lastPoints: number;
  readonly pointsSpread: number;
  readonly goalsPerMatch: number;
  readonly drawShare: number;
  readonly ppgStandardDeviation: number;
} {
  const champion = table[0];
  const last = table.at(-1);
  if (champion === undefined || last === undefined || fixtureCount === 0 || champion.played === 0) {
    throw new Error("L5.1 compact table metrics require one played competition");
  }
  const drawCount = table.reduce((sum, row) => sum + row.draws, 0) / 2;
  return {
    championPoints: champion.points,
    lastPoints: last.points,
    pointsSpread: champion.points - last.points,
    goalsPerMatch: table.reduce((sum, row) => sum + row.goalsFor, 0) / fixtureCount,
    drawShare: drawCount / fixtureCount,
    ppgStandardDeviation: standardDeviation(
      table.map(({ points }) => points / champion.played),
    ),
  };
}

function playerSeasonFacts(input: {
  readonly seasonNumber: number;
  readonly competitionId: string;
  readonly result: SimulateSeasonResult;
  readonly careerState: CliCareerState;
}): readonly OwnerAttributionPlayerSeasonFact[] {
  const participation = new Map<string, { appearances: number; starts: number; minutes: number }>();
  for (const fixture of input.result.fixtureParticipation) {
    for (const row of fixture.contributions) {
      if (!row.started && !row.substituteAppearance) continue;
      const key = String(row.playerId);
      const current = participation.get(key) ?? { appearances: 0, starts: 0, minutes: 0 };
      participation.set(key, {
        appearances: current.appearances + 1,
        starts: current.starts + (row.started ? 1 : 0),
        minutes: current.minutes + row.minutes,
      });
    }
  }
  const opportunities = new Map(input.result.playerOpportunityStats.map((row) => [String(row.playerId), row]));
  const summaries = new Map(input.result.playerSummaryStats.map((row) => [String(row.playerId), row]));
  const seasonEnd = input.result.fixtures.reduce(
    (latest, fixture) => Number(fixture.date) > Number(latest) ? fixture.date : latest,
    input.result.fixtures[0]?.date ?? input.careerState.gameState.calendar.currentDate,
  );
  return input.result.table.flatMap(({ clubId }) => {
    const club = input.careerState.gameState.clubs[clubId];
    if (club === undefined) throw new Error(`L5.1 player club is missing: ${clubId}`);
    return fieldablePlayerIdsFor(club).map((playerId) => {
      const player = input.careerState.gameState.players[playerId];
      if (player === undefined || player.primaryRole === undefined) throw new Error(`L5.1 player role is missing: ${playerId}`);
      const played = participation.get(String(playerId)) ?? { appearances: 0, starts: 0, minutes: 0 };
      const opportunity = opportunities.get(String(playerId));
      const summary = summaries.get(String(playerId));
      const ability = summarizePlayerDevelopmentAbilities(player);
      return {
        competitionId: input.competitionId,
        seasonNumber: input.seasonNumber,
        playerId: String(playerId),
        clubId: String(clubId),
        age: completedPlayerAge(player.birthDate, seasonEnd),
        role: player.primaryRole,
        currentAbility: ability.currentAbility,
        potentialRoom: ability.potentialRoom,
        appearances: played.appearances,
        starts: played.starts,
        minutes: played.minutes,
        shots: opportunity?.shots ?? 0,
        shotsOnTarget: opportunity?.shotsOnTarget ?? 0,
        creatorNominations: opportunity?.creatorNominations ?? 0,
        goals: summary?.goals ?? 0,
        assists: summary?.assists ?? 0,
      };
    });
  });
}

function selectionLoadSeasonFact(input: {
  readonly seasonNumber: number;
  readonly competitionId: string;
  readonly result: SimulateSeasonResult;
}): OwnerAttributionSelectionLoadSeasonFact {
  const diagnostics = input.result.fixtureParticipation.flatMap(({ fieldedTeams }) =>
    [fieldedTeams.home, fieldedTeams.away].map(({ selectionLoadDiagnostics }) => {
      if (selectionLoadDiagnostics === undefined) {
        throw new Error(
          `L5.1 selection-load diagnostic is missing: ${input.competitionId}:${input.seasonNumber}`,
        );
      }
      return selectionLoadDiagnostics;
    }));
  return {
    competitionId: input.competitionId,
    seasonNumber: input.seasonNumber,
    veteranStarterCount: diagnostics.reduce((sum, row) => sum + row.veteranStarterCount, 0),
    qualityMatchedYoungerAlternativeCount: diagnostics.reduce(
      (sum, row) => sum + row.qualityMatchedYoungerAlternativeCount,
      0,
    ),
    fresherQualityMatchedYoungerAlternativeCount: diagnostics.reduce(
      (sum, row) => sum + row.fresherQualityMatchedYoungerAlternativeCount,
      0,
    ),
  };
}

/** Classifies the frozen paired table response without inspecting checkpoint output. */
export function tableHierarchyOwner(table: OwnerAttributionDecision["table"]): TableHierarchyOwner {
  if (
    table.pairedPointsSpreadDelta === "not_observed"
    || table.pairedPpgStandardDeviationDelta === "not_observed"
    || table.pairedDrawShareReduction === "not_observed"
  ) return "not_attributed";
  if (
    table.drawShareMean !== "not_observed"
    && table.drawShareMean > HISTORICAL_DIVISION_TABLE_TARGETS[1].drawShare.max
    && table.pairedPointsSpreadDelta >= 5
    && table.pairedDrawShareReduction >= 0.02
  ) return "draw_resolution";
  if (
    table.pairedPointsSpreadDelta >= 5
    && table.pairedPpgStandardDeviationDelta >= 0.04
  ) return "population_strength";
  if (
    Math.abs(table.pairedPointsSpreadDelta) < 2
    && Math.abs(table.pairedPpgStandardDeviationDelta) < 0.02
  ) return "match_translation";
  return "not_attributed";
}

/** Applies the preregistered fixture-level alternative bands to veteran load. */
export function playerLoadAttributionOwner(
  players: OwnerAttributionDecision["players"],
): PlayerLoadOwner {
  if (
    players.age33PlusStartsMean !== "not_observed"
    && players.age33PlusStartsMean > HISTORICAL_FIRST_DIVISION_PLAYER_TARGETS.age33PlusStarts.max
    && players.fresherQualityMatchedYoungerAlternativeShare !== "not_observed"
    && players.fresherQualityMatchedYoungerAlternativeShare >= 0.2
  ) return "selection_load";
  if (
    players.age33PlusStartsMean !== "not_observed"
    && players.age33PlusStartsMean > HISTORICAL_FIRST_DIVISION_PLAYER_TARGETS.age33PlusStarts.max
    && players.fresherQualityMatchedYoungerAlternativeShare !== "not_observed"
    && players.fresherQualityMatchedYoungerAlternativeShare <= 0.1
    && players.generatedLeaderShareSeasonTen !== "not_observed"
    && players.generatedLeaderShareSeasonTen < HISTORICAL_FIRST_DIVISION_PLAYER_TARGETS.generatedLeaderShareSeasonTen.min
    && players.openingLeaderShareSeasonTen !== "not_observed"
    && players.openingLeaderShareSeasonTen > HISTORICAL_FIRST_DIVISION_PLAYER_TARGETS.openingLeaderShareSeasonTen.max
  ) return "renewal_quality";
  return "not_attributed";
}

/** Separates flat actor nomination from weak execution using frozen red families. */
export function leaderProductionOwner(
  players: OwnerAttributionDecision["players"],
): LeaderProductionOwner {
  const leaderAgeRed = (players.scorerMeanAge !== "not_observed"
      && players.scorerMeanAge > HISTORICAL_FIRST_DIVISION_PLAYER_TARGETS.scorerMeanAge.max)
    || (players.assistMeanAge !== "not_observed"
      && players.assistMeanAge > HISTORICAL_FIRST_DIVISION_PLAYER_TARGETS.assistMeanAge.max)
    || (players.age33PlusScorerShare !== "not_observed"
      && players.age33PlusScorerShare > HISTORICAL_FIRST_DIVISION_PLAYER_TARGETS.age33PlusScorerShare.max)
    || (players.age33PlusAssistShare !== "not_observed"
      && players.age33PlusAssistShare > HISTORICAL_FIRST_DIVISION_PLAYER_TARGETS.age33PlusAssistShare.max);
  const productionLow = (players.topTenScorerMean !== "not_observed"
      && players.topTenScorerMean < HISTORICAL_FIRST_DIVISION_PLAYER_TARGETS.topTenScorerMean.min)
    || (players.topTenAssistMean !== "not_observed"
      && players.topTenAssistMean < HISTORICAL_FIRST_DIVISION_PLAYER_TARGETS.topTenAssistMean.min);
  const correlations = [players.shooterAbilityNominationCorrelation, players.creatorAbilityNominationCorrelation]
    .filter((value): value is number => value !== "not_observed");
  if (correlations.length === 0) return "not_attributed";
  const nominationCorrelation = mean(correlations);
  if (leaderAgeRed && nominationCorrelation < 0.2) return "actor_allocation";
  return productionLow && nominationCorrelation >= 0.2
    ? "occasion_execution"
    : "not_attributed";
}

function identityOwner(identity: OwnerAttributionDecision["identity"]): ClubIdentityOwner {
  if (
    !identity.annualRolePlanHealthy
    || identity.replicatedFormationRetentionShare === "not_observed"
    || identity.replicatedFormationRetentionShare
      >= HISTORICAL_FIRST_DIVISION_PLAYER_TARGETS.replicatedFormationRetentionShare.min
    || identity.changedShapeRoleDistanceMean === "not_observed"
    || identity.stableShapeRoleDistanceMean === "not_observed"
    || identity.comparableQualityChangedShapeCount === 0
  ) return "not_attributed";
  return identity.changedShapeRoleDistanceMean - identity.stableShapeRoleDistanceMean >= 0.05
    ? "annual_intake_identity_erosion"
    : "not_attributed";
}

function generationalLeaderShares(worlds: readonly GenerationalSuccessionWorldFacts[]): {
  readonly generatedLeaderShareSeasonTen: number | "not_observed";
  readonly openingLeaderShareSeasonTen: number | "not_observed";
} {
  const rows = worlds.flatMap(({ rows }) => rows).filter(({ seasonNumber }) => seasonNumber === 10);
  const generated = rows.filter(({ origin }) => origin === "annual_academy_intake" || origin === "annual_senior_intake")
    .reduce((sum, row) => sum + row.scorerLeaderboardCount + row.assistLeaderboardCount, 0);
  const opening = rows.filter(({ origin }) => origin === "opening_senior" || origin === "opening_academy")
    .reduce((sum, row) => sum + row.scorerLeaderboardCount + row.assistLeaderboardCount, 0);
  return {
    generatedLeaderShareSeasonTen: ratio(generated, generated + opening),
    openingLeaderShareSeasonTen: ratio(opening, generated + opening),
  };
}

/**
 * Canonical deterministic top-ten derivation shared by L5 leader reports.
 * Player ID is the final tie-breaker, so report order never chooses a leader.
 */
export function topTenPlayerSeasonFacts(
  rows: readonly OwnerAttributionPlayerSeasonFact[],
  key: "goals" | "assists",
): readonly OwnerAttributionPlayerSeasonFact[] {
  return [...groupBy(rows, (row) => `${row.competitionId}|${row.seasonNumber}`).entries()]
    .sort(([left], [right]) => left.localeCompare(right))
    .flatMap(([, group]) => [...group]
      .sort((left, right) => right[key] - left[key] || left.playerId.localeCompare(right.playerId))
      .slice(0, 10));
}

function leaderProductionFacts(rows: readonly OwnerAttributionPlayerSeasonFact[]): {
  readonly topScorerMean: number | "not_observed";
  readonly topAssistMean: number | "not_observed";
  readonly topTenScorerMean: number | "not_observed";
  readonly topTenAssistMean: number | "not_observed";
  readonly scorerMeanAge: number | "not_observed";
  readonly assistMeanAge: number | "not_observed";
  readonly age33PlusScorerShare: number | "not_observed";
  readonly age33PlusAssistShare: number | "not_observed";
  readonly exceptional33PlusLeaderObservationCount: number;
} {
  const scorerGroups = groupBy(
    topTenPlayerSeasonFacts(rows, "goals"),
    (row) => `${row.competitionId}|${row.seasonNumber}`,
  );
  const assistGroups = groupBy(
    topTenPlayerSeasonFacts(rows, "assists"),
    (row) => `${row.competitionId}|${row.seasonNumber}`,
  );
  const scorerTop: number[] = [];
  const assistTop: number[] = [];
  const scorerTen: number[] = [];
  const assistTen: number[] = [];
  const scorerAges: number[] = [];
  const assistAges: number[] = [];
  for (const [groupKey, scorers] of scorerGroups.entries()) {
    const assists = assistGroups.get(groupKey) ?? [];
    if (scorers[0] !== undefined) scorerTop.push(scorers[0].goals);
    if (assists[0] !== undefined) assistTop.push(assists[0].assists);
    scorerTen.push(mean(scorers.map(({ goals }) => goals)));
    assistTen.push(mean(assists.map(({ assists: value }) => value)));
    scorerAges.push(...scorers.map(({ age }) => age));
    assistAges.push(...assists.map(({ age }) => age));
  }
  return {
    topScorerMean: observedMean(scorerTop),
    topAssistMean: observedMean(assistTop),
    topTenScorerMean: observedMean(scorerTen),
    topTenAssistMean: observedMean(assistTen),
    scorerMeanAge: observedMean(scorerAges),
    assistMeanAge: observedMean(assistAges),
    age33PlusScorerShare: ratio(scorerAges.filter((age) => age >= 33).length, scorerAges.length),
    age33PlusAssistShare: ratio(assistAges.filter((age) => age >= 33).length, assistAges.length),
    exceptional33PlusLeaderObservationCount:
      scorerAges.filter((age) => age >= 33).length + assistAges.filter((age) => age >= 33).length,
  };
}

function matchedVeteranStartEdge(rows: readonly OwnerAttributionPlayerSeasonFact[]): number | "not_observed" {
  const groups = groupBy(rows, (row) =>
    `${row.competitionId}|${row.seasonNumber}|${row.role}|${Math.floor(row.currentAbility * 2) / 2}`);
  const edges: number[] = [];
  for (const group of groups.values()) {
    const veterans = group.filter(({ age }) => age >= 33);
    const younger = group.filter(({ age }) => age >= 24 && age <= 29);
    if (veterans.length > 0 && younger.length > 0) {
      edges.push(mean(veterans.map(({ starts }) => starts)) - mean(younger.map(({ starts }) => starts)));
    }
  }
  return observedMean(edges);
}

function withinRoleAbilityCorrelation(
  rows: readonly OwnerAttributionPlayerSeasonFact[],
  key: "shots" | "creatorNominations",
): number | "not_observed" {
  const groups = groupBy(rows.filter(({ minutes }) => minutes >= 450), (row) =>
    `${row.competitionId}|${row.seasonNumber}|${row.role}`);
  const values: number[] = [];
  for (const group of groups.values()) {
    if (group.length < 4) continue;
    const correlation = spearman(
      group.map(({ currentAbility }) => currentAbility),
      group.map((row) => row[key] * 90 / row.minutes),
    );
    if (correlation !== "not_observed") values.push(correlation);
  }
  return observedMean(values);
}

function sumGapBuckets(
  rows: readonly OwnerAttributionTableSeasonFact[],
  bucket: StrengthGapBucket,
): OwnerAttributionGapBucketFact {
  const matches = rows.flatMap(({ gapBuckets }) => gapBuckets).filter((row) => row.bucket === bucket);
  return {
    bucket,
    fixtureCount: matches.reduce((sum, row) => sum + row.fixtureCount, 0),
    favoriteWins: matches.reduce((sum, row) => sum + row.favoriteWins, 0),
    favoritePoints: matches.reduce((sum, row) => sum + row.favoritePoints, 0),
    draws: matches.reduce((sum, row) => sum + row.draws, 0),
  };
}

function roleVector(roles: readonly (PlayerRole | undefined)[]): Readonly<Record<PlayerRole, number>> {
  const vector = emptyRoleVector();
  for (const role of roles) {
    if (role === undefined) throw new Error("L5.1 role vector contains an unidentified player");
    vector[role] += 1;
  }
  return vector;
}

function emptyRoleVector(): Record<PlayerRole, number> {
  return Object.fromEntries(PLAYER_ROLES.map((role) => [role, 0])) as Record<PlayerRole, number>;
}

function normalizedRoleDistance(
  opening: Readonly<Record<PlayerRole, number>>,
  current: Readonly<Record<PlayerRole, number>>,
): number {
  const denominator = PLAYER_ROLES.reduce((sum, role) => sum + opening[role], 0);
  return denominator === 0 ? 0 : PLAYER_ROLES.reduce(
    (sum, role) => sum + Math.abs(opening[role] - current[role]),
    0,
  ) / (2 * denominator);
}

function currentAbility(player: CliCareerState["gameState"]["players"][keyof CliCareerState["gameState"]["players"]]): number {
  return summarizePlayerDevelopmentAbilities(player).currentAbility;
}

function gapBucket(gap: number): StrengthGapBucket {
  if (gap < 0.25) return "under_0_25";
  if (gap < 0.5) return "0_25_to_0_5";
  if (gap < 1) return "0_5_to_1";
  return "1_plus";
}

function standardDeviation(values: readonly number[]): number {
  if (values.length === 0) return 0;
  const average = mean(values);
  return Math.sqrt(mean(values.map((value) => (value - average) ** 2)));
}

function spearman(left: readonly number[], right: readonly number[]): number | "not_observed" {
  if (left.length !== right.length || left.length < 2) return "not_observed";
  const leftRanks = ranks(left);
  const rightRanks = ranks(right);
  const leftMean = mean(leftRanks);
  const rightMean = mean(rightRanks);
  const numerator = leftRanks.reduce((sum, value, index) =>
    sum + (value - leftMean) * ((rightRanks[index] ?? rightMean) - rightMean), 0);
  const denominator = Math.sqrt(
    leftRanks.reduce((sum, value) => sum + (value - leftMean) ** 2, 0)
    * rightRanks.reduce((sum, value) => sum + (value - rightMean) ** 2, 0),
  );
  return denominator === 0 ? "not_observed" : numerator / denominator;
}

function ranks(values: readonly number[]): readonly number[] {
  const sorted = values.map((value, index) => ({ value, index }))
    .sort((left, right) => left.value - right.value || left.index - right.index);
  const result = Array.from({ length: values.length }, () => 0);
  let start = 0;
  while (start < sorted.length) {
    let end = start + 1;
    while (end < sorted.length && sorted[end]?.value === sorted[start]?.value) end += 1;
    const rank = (start + end - 1) / 2;
    for (let index = start; index < end; index += 1) result[sorted[index]!.index] = rank;
    start = end;
  }
  return result;
}

function groupBy<T>(rows: readonly T[], keyFor: (row: T) => string): Map<string, T[]> {
  const groups = new Map<string, T[]>();
  for (const row of rows) {
    const key = keyFor(row);
    const group = groups.get(key) ?? [];
    group.push(row);
    groups.set(key, group);
  }
  return groups;
}

function pushMap(map: Map<string, number[]>, key: string, value: number): void {
  const rows = map.get(key) ?? [];
  rows.push(value);
  map.set(key, rows);
}

function mean(values: readonly number[]): number {
  return values.length === 0 ? 0 : values.reduce((sum, value) => sum + value, 0) / values.length;
}

function observedMean(values: readonly number[]): number | "not_observed" {
  return values.length === 0 ? "not_observed" : mean(values);
}

function observedDifference(
  left: number | "not_observed",
  right: number | "not_observed",
): number | "not_observed" {
  return left === "not_observed" || right === "not_observed"
    ? "not_observed"
    : left - right;
}

function ratio(numerator: number, denominator: number): number | "not_observed" {
  return denominator === 0 ? "not_observed" : numerator / denominator;
}
