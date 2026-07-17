import {
  createCareerState,
  type CareerSeasonAggregateGoals,
  type CareerSeasonArchiveEntry,
  type CareerState,
  type ClubId,
  type Fixture,
  type FixtureId,
  type GameDate,
  type LeagueTableRules,
  type PlayerId,
  type SeasonId,
  seasonId,
} from "@game/domain";

import { computeLeagueTable } from "../season-engine/league-table.ts";
import {
  createSeasonRolloverInboxMessage,
  deliverCareerInboxMessages,
} from "./career-inbox-lifecycle.ts";
import { developPlayersForSeason, type PlayerDevelopmentChange } from "./player-development.ts";
import {
  applyEndOfSeasonPlayerExits,
  type PlayerExitReason,
  type PlayerExitRecord,
} from "./player-exits.ts";
import { type CareerIntakeCandidate } from "./player-intake.ts";
import { generateNextSeasonCalendar, type NextSeasonCalendarGenerated } from "./next-season-calendar.ts";
import { rolloverPlayersForNextSeason } from "./player-season-rollover.ts";
import { maintainCareerSquadShape, MINIMUM_CAREER_SQUAD_SIZE } from "./squad-maintenance.ts";
import { simulateTransferTurnover } from "./transfer-turnover.ts";
import { type YouthIntakeCandidate, applySeasonalYouthIntake } from "./youth-intake.ts";
import { applyYouthAcademyLifecycle, type YouthLifecycleRecord } from "./youth-lifecycle.ts";
import { promoteYouthCandidatesToSeniorSquads } from "./youth-promotion.ts";

const YOUTH_ROSTER_TARGET_MINIMUM = 8;
const YOUTH_ROSTER_TARGET_MAXIMUM = 12;

/** Mode used when a completed durable career season should roll into the next season. */
export interface AdvanceCareerCompletedSeasonMode {
  /** Discriminator for durable completed-season rollover. */
  readonly kind: "completedSeason";
  /** Competition point rules supplied by an Adapter because engine cannot import content. */
  readonly tableRules: LeagueTableRules;
}

/** Mode used by reports that need a season refresh without persisted fixture history. */
export interface AdvanceCareerReportRefreshMode {
  /** Discriminator for report-only season refresh. */
  readonly kind: "reportRefresh";
  /** Adapter-provided next season ID for report progression. */
  readonly nextSeasonId: SeasonId;
  /** Adapter-provided next season start date for report progression. */
  readonly nextSeasonStartDate: GameDate;
}

/** Explicit advancement modes supported by the canonical career-season use-case. */
export type AdvanceCareerOneSeasonMode =
  | AdvanceCareerCompletedSeasonMode
  | AdvanceCareerReportRefreshMode;

/** Context for Adapter-owned youth-intake candidate generation. */
export interface CareerYouthIntakeCandidateProviderContext {
  /** Career state after youth lifecycle has removed aged-out academy players. */
  readonly careerState: CareerState;
  /** Canonical advancement season id used by deterministic generators. */
  readonly seasonId: SeasonId;
  /** Date that should be used as the intake reference date. */
  readonly intakeDate: GameDate;
}

/** Context for Adapter-owned senior-intake candidate generation. */
export interface CareerSeniorIntakeCandidateProviderContext {
  /** Career state after youth promotion decisions and before senior maintenance. */
  readonly careerState: CareerState;
  /** Canonical advancement season id used by deterministic generators. */
  readonly seasonId: SeasonId;
}

/** Input for the canonical season advancement Module. */
export interface AdvanceCareerOneSeasonInput {
  /** Durable career state before one season advancement is applied. */
  readonly careerState: CareerState;
  /** Stable world seed used by deterministic career subsystems. */
  readonly worldSeed: string;
  /** Advancement mode and mode-specific content inputs. */
  readonly mode: AdvanceCareerOneSeasonMode;
  /** Optional explicit senior player order for development. Defaults to senior club rosters. */
  readonly seniorDevelopmentPlayerIds?: readonly PlayerId[];
  /** Adapter-generated senior intake candidates used by squad maintenance. */
  readonly seniorIntakeCandidates?: readonly CareerIntakeCandidate[];
  /** Adapter-owned senior intake provider called at the canonical maintenance point. */
  readonly createSeniorIntakeCandidates?: (context: CareerSeniorIntakeCandidateProviderContext) => readonly CareerIntakeCandidate[];
  /** Adapter-generated annual youth intake candidates. */
  readonly youthIntakeCandidates?: readonly YouthIntakeCandidate[];
  /** Adapter-owned youth intake provider called after youth lifecycle. */
  readonly createYouthIntakeCandidates?: (context: CareerYouthIntakeCandidateProviderContext) => readonly YouthIntakeCandidate[];
  /** Whether selected-club youth promotion can be automated. Defaults to protected. */
  readonly allowSelectedClubYouthPromotion?: boolean;
}

/** Stable operation keys emitted to let tests and reports verify ordering. */
export type CareerSeasonAdvancementOperation =
  | "completed_season_validation"
  | "season_archive"
  | "senior_development"
  | "player_exits"
  | "youth_lifecycle"
  | "youth_intake"
  | "youth_promotion"
  | "squad_maintenance"
  | "transfer_turnover"
  | "next_calendar_merge"
  | "player_state_rollover"
  | "season_inbox_delivery";

/** Compact fact for an archived completed season. */
export interface CareerSeasonArchiveFact {
  /** Completed season ID. */
  readonly seasonId: SeasonId;
  /** Champion club ID from the computed final table. */
  readonly championClubId: ClubId;
  /** Position where the selected club finished. */
  readonly selectedClubPosition: number;
  /** Aggregate goal facts captured in the archive entry. */
  readonly aggregateGoals: CareerSeasonAggregateGoals;
}

/** Aggregate player development facts emitted by one advancement. */
export interface CareerPlayerDevelopmentFact {
  /** Number of player development rows emitted. */
  readonly changeCount: number;
  /** Number of rows with any positive growth. */
  readonly playersImproved: number;
  /** Number of rows with any decline. */
  readonly playersDeclined: number;
  /** Rounded total growth across rows. */
  readonly totalGrowth: number;
  /** Rounded total decline across rows. */
  readonly totalDecline: number;
}

/** Aggregate player exit facts emitted by one advancement. */
export interface CareerPlayerExitFact {
  /** Number of players leaving active senior rosters. */
  readonly exitCount: number;
  /** Exit counts grouped by deterministic reason. */
  readonly reasons: Readonly<Record<PlayerExitReason, number>>;
}

/** Aggregate youth lifecycle facts emitted by one advancement. */
export interface CareerYouthLifecycleFact {
  /** Number of active-youth development rows. */
  readonly developmentChangeCount: number;
  /** Number of youth lifecycle records. */
  readonly recordCount: number;
  /** Number of age-out records that became senior-promotion candidates. */
  readonly promotionCandidateCount: number;
  /** Number of age-out records that became external-move candidates. */
  readonly externalMoveCandidateCount: number;
  /** Number of youth players released from the active world. */
  readonly releasedCount: number;
  /** Selected-club lifecycle decisions that future UI may need to surface. */
  readonly selectedClubDecisionCount: number;
}

/** Aggregate youth intake facts emitted by one advancement. */
export interface CareerYouthIntakeFact {
  /** Number of generated youth candidates supplied by the Adapter. */
  readonly candidateCount: number;
  /** Number of youth candidates accepted into active academies. */
  readonly acceptedPlayerCount: number;
}

/** Aggregate youth promotion facts emitted by one advancement. */
export interface CareerYouthPromotionFact {
  /** Number of promotion candidates evaluated. */
  readonly candidateCount: number;
  /** Number of promotion candidates moved into senior squads. */
  readonly promotedCount: number;
  /** Number of selected-club candidates protected from automatic promotion. */
  readonly selectedClubProtectedCount: number;
}

/** Aggregate senior squad maintenance facts emitted by one advancement. */
export interface CareerSquadMaintenanceFact {
  /** Number of generated senior intake candidates supplied by the Adapter. */
  readonly candidateCount: number;
  /** Number of players actually added to senior rosters. */
  readonly addedPlayerCount: number;
  /** Number of structural warnings remaining after maintenance. */
  readonly warningCount: number;
}

/** Aggregate transfer-turnover facts emitted by one advancement. */
export interface CareerTransferTurnoverFact {
  /** Number of deterministic inter-club player movements. */
  readonly transferCount: number;
}

/** Senior squad health facts after one advancement. */
export interface CareerSquadHealthFact {
  /** Total senior players in active club rosters. */
  readonly seniorPlayerCount: number;
  /** Smallest senior squad size. */
  readonly minimumSquadSize: number;
  /** Average senior squad size. */
  readonly averageSquadSize: number;
  /** Largest senior squad size. */
  readonly maximumSquadSize: number;
  /** Number of clubs below the minimum playable squad size. */
  readonly clubsBelowMinimumSquadSize: number;
  /** Number of clubs without a natural goalkeeper. */
  readonly clubsWithoutNaturalGoalkeeper: number;
}

/** Youth academy health facts after one advancement. */
export interface CareerYouthHealthFact {
  /** Total active academy players. */
  readonly youthPlayerCount: number;
  /** Active senior plus academy player count. */
  readonly activePlayerCount: number;
  /** Smallest active youth roster size. */
  readonly minimumYouthRosterSize: number;
  /** Average active youth roster size. */
  readonly averageYouthRosterSize: number;
  /** Largest active youth roster size. */
  readonly maximumYouthRosterSize: number;
  /** Active youth size for the manager-selected club. */
  readonly selectedClubYouthSize: number;
  /** Number of clubs above the target youth roster band. */
  readonly clubsAboveYouthTarget: number;
  /** Number of clubs below the target youth roster band. */
  readonly clubsBelowYouthMinimum: number;
}

/** Stable warning keys emitted by the canonical advancement use-case. */
export type CareerSeasonAdvancementWarning =
  | "selected_club_youth_decision_pending";

/** Structured facts returned by the canonical season advancement Module. */
export interface CareerSeasonAdvancementFacts {
  /** Advancement mode used by this call. */
  readonly mode: AdvanceCareerOneSeasonMode["kind"];
  /** Manager-selected club affected by protected manager-decision rules. */
  readonly selectedClubId: ClubId;
  /** Previous active season. */
  readonly previousSeasonId: SeasonId;
  /** Next active season. */
  readonly nextSeasonId: SeasonId;
  /** Previous career date. */
  readonly previousDate: GameDate;
  /** Date applied as the next season start. */
  readonly nextSeasonStartDate: GameDate;
  /** Ordered operation keys that describe the canonical sequence. */
  readonly operationOrder: readonly CareerSeasonAdvancementOperation[];
  /** Completed-season archive facts when durable rollover was used. */
  readonly seasonArchive?: CareerSeasonArchiveFact;
  /** Player development aggregate facts. */
  readonly playerDevelopment: CareerPlayerDevelopmentFact;
  /** Player exit aggregate facts. */
  readonly playerExits: CareerPlayerExitFact;
  /** Youth lifecycle aggregate facts. */
  readonly youthLifecycle: CareerYouthLifecycleFact;
  /** Youth intake aggregate facts. */
  readonly youthIntake: CareerYouthIntakeFact;
  /** Youth promotion aggregate facts. */
  readonly youthPromotions: CareerYouthPromotionFact;
  /** Senior squad maintenance aggregate facts. */
  readonly squadMaintenance: CareerSquadMaintenanceFact;
  /** Transfer turnover aggregate facts. */
  readonly transferTurnover: CareerTransferTurnoverFact;
  /** Senior squad health after advancement. */
  readonly squadHealth: CareerSquadHealthFact;
  /** Youth academy health after advancement. */
  readonly youthHealth: CareerYouthHealthFact;
  /** Machine-readable warnings for future UI/report adapters. */
  readonly warnings: readonly CareerSeasonAdvancementWarning[];
}

/** Invalid reasons emitted before any partial advancement is applied. */
export type AdvanceCareerOneSeasonInvalidReason =
  | "current_season_incomplete"
  | "fixture_missing"
  | "fixture_home_club_not_found"
  | "fixture_away_club_not_found"
  | "no_current_season_fixtures"
  | "multiple_current_season_competitions"
  | "season_table_empty"
  | "selected_club_not_in_table";

/** Successful canonical season advancement result. */
export interface AdvanceCareerOneSeasonAdvanced {
  /** Discriminator for successful advancement. */
  readonly status: "advanced";
  /** Copied career state after advancement. */
  readonly careerState: CareerState;
  /** Structured facts describing the advancement. */
  readonly facts: CareerSeasonAdvancementFacts;
}

/** Invalid canonical season advancement result. */
export interface AdvanceCareerOneSeasonInvalid {
  /** Discriminator for invalid state. */
  readonly status: "invalid";
  /** Original career state, unchanged. */
  readonly careerState: CareerState;
  /** Stable invalid reason. */
  readonly reason: AdvanceCareerOneSeasonInvalidReason;
  /** Related fixture ID when available. */
  readonly fixtureId?: FixtureId;
}

/** Canonical season advancement result. */
export type AdvanceCareerOneSeasonResult =
  | AdvanceCareerOneSeasonAdvanced
  | AdvanceCareerOneSeasonInvalid;

/**
 * Advances one career season through the canonical engine order.
 *
 * The Module owns season-level orchestration and emits structured facts. It
 * does not load saves, generate content candidates, render text, or make hidden
 * selected-club decisions.
 */
export function advanceCareerOneSeason(input: AdvanceCareerOneSeasonInput): AdvanceCareerOneSeasonResult {
  const previousSeasonId = input.careerState.gameState.calendar.currentSeasonId;
  const previousDate = input.careerState.gameState.calendar.currentDate;
  const seasonContext = prepareSeasonContext(input);

  if (seasonContext.status === "invalid") {
    return {
      status: "invalid",
      careerState: input.careerState,
      reason: seasonContext.reason,
      ...(seasonContext.fixtureId === undefined ? {} : { fixtureId: seasonContext.fixtureId }),
    };
  }

  const operationOrder: CareerSeasonAdvancementOperation[] = [...seasonContext.operationOrder];
  const advancementSeasonId = seasonId(`${previousSeasonId}:advance:${seasonContext.nextSeasonId}`);

  operationOrder.push("senior_development");
  const developed = developPlayersForSeason({
    careerState: input.careerState,
    worldSeed: input.worldSeed,
    seasonId: advancementSeasonId,
    playerIds: input.seniorDevelopmentPlayerIds ?? seniorPlayerIds(input.careerState),
  });

  operationOrder.push("player_exits");
  const exits = applyEndOfSeasonPlayerExits({
    careerState: developed.careerState,
    worldSeed: input.worldSeed,
    seasonId: advancementSeasonId,
  });

  operationOrder.push("youth_lifecycle");
  const youthLifecycle = applyYouthAcademyLifecycle({
    careerState: exits.careerState,
    worldSeed: input.worldSeed,
    seasonId: advancementSeasonId,
  });

  operationOrder.push("youth_intake");
  const youthIntakeCandidates =
    input.createYouthIntakeCandidates?.({
      careerState: youthLifecycle.careerState,
      seasonId: advancementSeasonId,
      intakeDate: previousDate,
    }) ??
    input.youthIntakeCandidates ??
    [];
  const youthIntake = applyYouthIntakeIfCandidatesExist({
    careerState: youthLifecycle.careerState,
    seasonId: advancementSeasonId,
    intakeDate: previousDate,
    candidates: youthIntakeCandidates,
  });

  operationOrder.push("youth_promotion");
  const youthPromotions = promoteYouthCandidatesToSeniorSquads({
    careerState: youthIntake.careerState,
    allowSelectedClubPromotion: input.allowSelectedClubYouthPromotion ?? false,
  });

  operationOrder.push("squad_maintenance");
  const seniorIntakeCandidates =
    input.createSeniorIntakeCandidates?.({
      careerState: youthPromotions.careerState,
      seasonId: advancementSeasonId,
    }) ??
    input.seniorIntakeCandidates ??
    [];
  const maintained = maintainCareerSquadShape({
    careerState: youthPromotions.careerState,
    intakeCandidates: seniorIntakeCandidates,
  });

  operationOrder.push("transfer_turnover");
  const turnover = simulateTransferTurnover({
    careerState: maintained.careerState,
    worldSeed: input.worldSeed,
    seasonId: advancementSeasonId,
  });

  const stateBeforePlayerRollover = applyCompletedSeasonChangesIfNeeded(turnover.careerState, seasonContext, operationOrder);

  operationOrder.push("player_state_rollover");
  const rolledOver = rolloverPlayersForNextSeason({
    careerState: stateBeforePlayerRollover,
    nextSeasonId: seasonContext.nextSeasonId,
    nextSeasonStartDate: seasonContext.nextSeasonStartDate,
  });
  const careerState = seasonContext.archive === undefined
    ? rolledOver.careerState
    : deliverCareerInboxMessages(rolledOver.careerState, [createSeasonRolloverInboxMessage({
        nextSeasonId: seasonContext.nextSeasonId,
        date: seasonContext.nextSeasonStartDate,
        selectedClubId: input.careerState.selectedClubId,
      })]);
  if (seasonContext.archive !== undefined) operationOrder.push("season_inbox_delivery");

  const warnings = advancementWarnings(youthLifecycle.records, input.careerState.selectedClubId);
  return {
    status: "advanced",
    careerState,
    facts: {
      mode: input.mode.kind,
      selectedClubId: input.careerState.selectedClubId,
      previousSeasonId,
      nextSeasonId: seasonContext.nextSeasonId,
      previousDate,
      nextSeasonStartDate: seasonContext.nextSeasonStartDate,
      operationOrder,
      ...(seasonContext.archive === undefined ? {} : { seasonArchive: seasonContext.archive.fact }),
      playerDevelopment: playerDevelopmentFact(developed.changes),
      playerExits: playerExitFact(exits.exits),
      youthLifecycle: youthLifecycleFact(youthLifecycle.developmentChanges, youthLifecycle.records, input.careerState.selectedClubId),
      youthIntake: {
        candidateCount: youthIntakeCandidates.length,
        acceptedPlayerCount: youthIntake.records.reduce((sum, record) => sum + record.acceptedPlayerIds.length, 0),
      },
      youthPromotions: {
        candidateCount: youthPromotions.records.length,
        promotedCount: youthPromotions.records.filter((record) => record.promoted).length,
        selectedClubProtectedCount: youthPromotions.records.filter((record) => record.reason === "selected_club_protected").length,
      },
      squadMaintenance: {
        candidateCount: seniorIntakeCandidates.length,
        addedPlayerCount: maintained.records.reduce((sum, record) => sum + record.addedPlayerIds.length, 0),
        warningCount: maintained.records.reduce((sum, record) => sum + record.warnings.length, 0),
      },
      transferTurnover: {
        transferCount: turnover.transfers.length,
      },
      squadHealth: squadHealthFact(rolledOver.careerState),
      youthHealth: youthHealthFact(rolledOver.careerState),
      warnings,
    },
  };
}

type PreparedSeasonContext =
  | PreparedSeasonContextValid
  | {
      readonly status: "invalid";
      readonly reason: AdvanceCareerOneSeasonInvalidReason;
      readonly fixtureId?: FixtureId;
    };

interface PreparedSeasonContextValid {
  readonly status: "valid";
  readonly nextSeasonId: SeasonId;
  readonly nextSeasonStartDate: GameDate;
  readonly operationOrder: readonly CareerSeasonAdvancementOperation[];
  readonly archive?: {
    readonly entry: CareerSeasonArchiveEntry;
    readonly fact: CareerSeasonArchiveFact;
  };
  readonly nextSeasonFixtures?: readonly Fixture[];
}

function prepareSeasonContext(input: AdvanceCareerOneSeasonInput): PreparedSeasonContext {
  if (input.mode.kind === "reportRefresh") {
    return {
      status: "valid",
      nextSeasonId: input.mode.nextSeasonId,
      nextSeasonStartDate: input.mode.nextSeasonStartDate,
      operationOrder: [],
    };
  }

  const nextCalendar = generateNextSeasonCalendar(input.careerState);
  if (nextCalendar.status === "invalid") {
    return {
      status: "invalid",
      reason: nextCalendar.reason,
      ...(nextCalendar.fixtureId === undefined ? {} : { fixtureId: nextCalendar.fixtureId }),
    };
  }

  const archive = buildSeasonArchive(input.careerState, nextCalendar, input.mode.tableRules);
  if (archive.status === "invalid") {
    return archive;
  }

  return {
    status: "valid",
    nextSeasonId: nextCalendar.seasonId,
    nextSeasonStartDate: nextCalendar.seasonStartDate,
    operationOrder: ["completed_season_validation", "season_archive"],
    archive: archive.archive,
    nextSeasonFixtures: nextCalendar.fixtures,
  };
}

type SeasonArchiveBuildResult =
  | { readonly status: "valid"; readonly archive: NonNullable<PreparedSeasonContextValid["archive"]> }
  | { readonly status: "invalid"; readonly reason: "season_table_empty" | "selected_club_not_in_table" };

function buildSeasonArchive(
  careerState: CareerState,
  nextCalendar: NextSeasonCalendarGenerated,
  tableRules: LeagueTableRules,
): SeasonArchiveBuildResult {
  const fixtureIds = currentSeasonFixtureIds(careerState);
  const finalTable = computeLeagueTable({
    clubIds: careerState.gameState.clubIds,
    fixtures: careerState.gameState.fixtures,
    fixtureIds,
    rules: tableRules,
  });
  const champion = finalTable[0];
  if (champion === undefined) {
    return {
      status: "invalid",
      reason: "season_table_empty",
    };
  }

  const selectedClubFinish = finalTable.find((row) => row.clubId === careerState.selectedClubId);
  if (selectedClubFinish === undefined) {
    return {
      status: "invalid",
      reason: "selected_club_not_in_table",
    };
  }

  const aggregateGoals = aggregateGoalsFor(careerState, fixtureIds);
  const entry: CareerSeasonArchiveEntry = {
    sequenceNumber: nextSeasonSequenceNumber(careerState),
    seasonId: nextCalendar.previousSeasonId,
    competitionId: nextCalendar.competitionId,
    finalTable,
    championClubId: champion.clubId,
    selectedClubFinish,
    aggregateGoals,
  };

  return {
    status: "valid",
    archive: {
      entry,
      fact: {
        seasonId: entry.seasonId,
        championClubId: entry.championClubId,
        selectedClubPosition: selectedClubFinish.position,
        aggregateGoals,
      },
    },
  };
}

function applyYouthIntakeIfCandidatesExist(input: {
  readonly careerState: CareerState;
  readonly seasonId: SeasonId;
  readonly intakeDate: GameDate;
  readonly candidates: readonly YouthIntakeCandidate[];
}): { readonly careerState: CareerState; readonly records: ReturnType<typeof applySeasonalYouthIntake>["records"] } {
  if (input.candidates.length === 0) {
    return {
      careerState: input.careerState,
      records: [],
    };
  }

  return applySeasonalYouthIntake(input);
}

function applyCompletedSeasonChangesIfNeeded(
  careerState: CareerState,
  seasonContext: PreparedSeasonContextValid,
  operationOrder: CareerSeasonAdvancementOperation[],
): CareerState {
  if (seasonContext.archive === undefined || seasonContext.nextSeasonFixtures === undefined) {
    return careerState;
  }

  operationOrder.push("next_calendar_merge");
  const mergedFixtures = mergeFixtures(careerState, seasonContext.nextSeasonFixtures);
  const {
    matchPreparation: _matchPreparation,
    currentSeasonInbox: _previousSeasonInbox,
    ...careerStateWithoutPreparation
  } = careerState;

  return createCareerState({
    ...careerStateWithoutPreparation,
    gameState: {
      ...careerState.gameState,
      fixtures: mergedFixtures.fixtures,
      fixtureIds: mergedFixtures.fixtureIds,
    },
    seasonHistory: [...(careerState.seasonHistory ?? []), seasonContext.archive.entry],
    currentSeasonInbox: [],
  });
}

function currentSeasonFixtureIds(careerState: CareerState): readonly FixtureId[] {
  const fixtureIds: FixtureId[] = [];
  const currentSeasonId = careerState.gameState.calendar.currentSeasonId;

  for (const fixtureId of careerState.gameState.fixtureIds) {
    const fixture = careerState.gameState.fixtures[fixtureId];
    if (fixture?.seasonId === currentSeasonId) {
      fixtureIds.push(fixtureId);
    }
  }

  return fixtureIds;
}

function aggregateGoalsFor(careerState: CareerState, fixtureIds: readonly FixtureId[]): CareerSeasonAggregateGoals {
  let fixtureCount = 0;
  let totalGoals = 0;

  for (const fixtureId of fixtureIds) {
    const result = careerState.gameState.fixtures[fixtureId]?.result;
    if (result === undefined) {
      continue;
    }

    fixtureCount += 1;
    totalGoals += result.homeGoals + result.awayGoals;
  }

  return { fixtureCount, totalGoals };
}

function mergeFixtures(
  careerState: CareerState,
  nextFixtures: readonly Fixture[],
): { readonly fixtures: CareerState["gameState"]["fixtures"]; readonly fixtureIds: CareerState["gameState"]["fixtureIds"] } {
  const fixtures = { ...careerState.gameState.fixtures };
  const fixtureIds = [...careerState.gameState.fixtureIds];

  for (const fixture of nextFixtures) {
    fixtures[fixture.id] = fixture;
    fixtureIds.push(fixture.id);
  }

  return { fixtures, fixtureIds };
}

function nextSeasonSequenceNumber(careerState: CareerState): number {
  let maxSequenceNumber = 0;

  for (const entry of careerState.seasonHistory ?? []) {
    maxSequenceNumber = Math.max(maxSequenceNumber, entry.sequenceNumber);
  }

  return maxSequenceNumber + 1;
}

function seniorPlayerIds(careerState: CareerState): readonly PlayerId[] {
  const playerIds: PlayerId[] = [];

  for (const clubId of careerState.gameState.clubIds) {
    const club = careerState.gameState.clubs[clubId];
    if (club === undefined) {
      continue;
    }

    for (const playerId of club.playerIds) {
      playerIds.push(playerId);
    }
  }

  return playerIds;
}

function playerDevelopmentFact(changes: readonly PlayerDevelopmentChange[]): CareerPlayerDevelopmentFact {
  return {
    changeCount: changes.length,
    playersImproved: changes.filter((change) => change.totalGrowth > 0).length,
    playersDeclined: changes.filter((change) => change.totalDecline > 0).length,
    totalGrowth: roundFactNumber(changes.reduce((sum, change) => sum + change.totalGrowth, 0)),
    totalDecline: roundFactNumber(changes.reduce((sum, change) => sum + change.totalDecline, 0)),
  };
}

function playerExitFact(exits: readonly PlayerExitRecord[]): CareerPlayerExitFact {
  return {
    exitCount: exits.length,
    reasons: {
      retirement: exits.filter((exit) => exit.reason === "retirement").length,
      released: exits.filter((exit) => exit.reason === "released").length,
      career_step_down: exits.filter((exit) => exit.reason === "career_step_down").length,
    },
  };
}

function youthLifecycleFact(
  developmentChanges: readonly PlayerDevelopmentChange[],
  records: readonly YouthLifecycleRecord[],
  selectedClubId: ClubId,
): CareerYouthLifecycleFact {
  return {
    developmentChangeCount: developmentChanges.length,
    recordCount: records.length,
    promotionCandidateCount: records.filter((record) => record.outcome === "promotion_candidate").length,
    externalMoveCandidateCount: records.filter((record) => record.outcome === "external_move_candidate").length,
    releasedCount: records.filter((record) => record.outcome === "released").length,
    selectedClubDecisionCount: records.filter((record) => record.clubId === selectedClubId && record.outcome === "promotion_candidate").length,
  };
}

function advancementWarnings(records: readonly YouthLifecycleRecord[], selectedClubId: ClubId): readonly CareerSeasonAdvancementWarning[] {
  return records.some((record) => record.clubId === selectedClubId && record.outcome === "promotion_candidate")
    ? ["selected_club_youth_decision_pending"]
    : [];
}

function squadHealthFact(careerState: CareerState): CareerSquadHealthFact {
  const squadSizes = careerState.gameState.clubIds.map((clubId) => careerState.gameState.clubs[clubId]?.playerIds.length ?? 0);
  const seniorPlayerCount = squadSizes.reduce((sum, size) => sum + size, 0);

  return {
    seniorPlayerCount,
    minimumSquadSize: safeMin(squadSizes),
    averageSquadSize: average(squadSizes),
    maximumSquadSize: safeMax(squadSizes),
    clubsBelowMinimumSquadSize: squadSizes.filter((size) => size < MINIMUM_CAREER_SQUAD_SIZE).length,
    clubsWithoutNaturalGoalkeeper: careerState.gameState.clubIds.filter((clubId) => !hasNaturalGoalkeeper(careerState, clubId)).length,
  };
}

function youthHealthFact(careerState: CareerState): CareerYouthHealthFact {
  const youthSizes = careerState.gameState.clubIds.map((clubId) => careerState.youthAcademyState?.clubRosters[clubId]?.playerIds.length ?? 0);
  const seniorPlayerCount = seniorPlayerIds(careerState).length;
  const youthPlayerCount = youthSizes.reduce((sum, size) => sum + size, 0);

  return {
    youthPlayerCount,
    activePlayerCount: seniorPlayerCount + youthPlayerCount,
    minimumYouthRosterSize: safeMin(youthSizes),
    averageYouthRosterSize: average(youthSizes),
    maximumYouthRosterSize: safeMax(youthSizes),
    selectedClubYouthSize: careerState.youthAcademyState?.clubRosters[careerState.selectedClubId]?.playerIds.length ?? 0,
    clubsAboveYouthTarget: youthSizes.filter((size) => size > YOUTH_ROSTER_TARGET_MAXIMUM).length,
    clubsBelowYouthMinimum: youthSizes.filter((size) => size < YOUTH_ROSTER_TARGET_MINIMUM).length,
  };
}

function hasNaturalGoalkeeper(careerState: CareerState, clubId: ClubId): boolean {
  const club = careerState.gameState.clubs[clubId];
  if (club === undefined) {
    return false;
  }

  return club.playerIds.some((playerId) => careerState.gameState.players[playerId]?.naturalPositions[0] === "gk");
}

function safeMin(values: readonly number[]): number {
  return values.length === 0 ? 0 : Math.min(...values);
}

function safeMax(values: readonly number[]): number {
  return values.length === 0 ? 0 : Math.max(...values);
}

function average(values: readonly number[]): number {
  return values.length === 0 ? 0 : roundFactNumber(values.reduce((sum, value) => sum + value, 0) / values.length);
}

function roundFactNumber(value: number): number {
  return Math.round(value * 100) / 100;
}
