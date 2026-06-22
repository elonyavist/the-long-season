import { getGeneratedPlayerArchetype, type FakeLeagueSystem } from "@game/content";
import type { ApplyCareerPermanentTransferResult, MatchExplanationTrace } from "@game/engine";
import type { MessageKey, Translator } from "@game/i18n";
import { toISO } from "@game/shared";

import { CLI_CAREER_WORLD_GENERATOR_VERSION, type CareerMarketScenario } from "./scenarios.ts";
import type { SaveCareerLineupDemoResult, SaveCareerTacticDemoResult } from "./preparation.ts";
import type { CareerAdvanceResult } from "./progression.ts";
import type {
  CliCareerState,
  CliClubTransferBudget,
  CliGameState,
  CliMarketState,
  CliMoney,
  CliPlayer,
  ClubId,
  PlayerId,
} from "./types.ts";

type CliFixtureId = CliGameState["fixtureIds"][number];
type CliFixture = CliGameState["fixtures"][CliFixtureId];

type CareerSeasonRolloverFormatResult =
  | {
      readonly status: "rolledOver";
      readonly careerState: CliCareerState;
      readonly previousSeasonId: string;
      readonly nextSeasonId: string;
      readonly championClubId: ClubId;
      readonly selectedClubFinish: NonNullable<CliCareerState["seasonHistory"]>[number]["selectedClubFinish"];
      readonly aggregateGoals: NonNullable<CliCareerState["seasonHistory"]>[number]["aggregateGoals"];
      readonly archivedSeasonCount: number;
      readonly newFixtureCount: number;
    }
  | {
      readonly status: "invalid";
      readonly careerState: CliCareerState;
      readonly reason: string;
      readonly fixtureId?: CliFixtureId;
    };

type CareerDevelopmentReportFormatResult = {
  readonly careerState: CliCareerState;
  readonly seasonsSimulated: number;
  readonly playersReviewed: number;
  readonly playersImproved: number;
  readonly playersDeclined: number;
  readonly stalledProspects: number;
  readonly totalGrowth: number;
  readonly totalDecline: number;
  readonly biggestImprover?: CareerDevelopmentReportPlayerExample;
  readonly biggestDecline?: CareerDevelopmentReportPlayerExample;
  readonly stalledProspect?: CareerDevelopmentReportPlayerExample;
  readonly decliningVeteran?: CareerDevelopmentReportPlayerExample;
};

type CareerDevelopmentReportPlayerExample = {
  readonly playerId: PlayerId;
  readonly startAge: number;
  readonly endAge: number;
  readonly totalGrowth: number;
  readonly totalDecline: number;
};

/** Formats the result of applying a profile-based permanent-transfer demo. */
export function formatCareerMarketApplyOutput(input: {
  readonly league: FakeLeagueSystem;
  readonly seed: string;
  readonly saveId: string;
  readonly saveDirectoryPath: string;
  readonly profileKey: string;
  readonly scenario: CareerMarketScenario;
  readonly result: ApplyCareerPermanentTransferResult;
  readonly careerSaveWritten: boolean;
  readonly text: Translator;
}): readonly string[] {
  const buyerBudgetBefore = input.scenario.marketState.clubBudgets[input.scenario.buyingClubId]?.transferBudget;
  const buyerBudgetAfter = input.result.careerState.marketState.clubBudgets[input.scenario.buyingClubId]?.transferBudget;
  const lines = [
    input.text("career.marketApply.title"),
    `${input.text("season.seed")}: ${input.seed}`,
    `${input.text("season.competition")}: ${input.league.competition.name}`,
    `${input.text("career.save")}: ${input.saveId}`,
    `${input.text("career.saveDirectory")}: ${input.saveDirectoryPath}`,
    `${input.text("market.demo")}: ${input.profileKey}`,
    `${input.text("setup.selectedClub")}: ${clubLabel(input.scenario.selectedClubId, input.scenario.gameState)}`,
    `${input.text("market.transferKind")}: ${input.text("market.transferKind.permanent")}`,
    `${input.text("market.buyingClub")}: ${clubLabel(input.scenario.buyingClubId, input.scenario.gameState)}`,
    `${input.text("market.sellingClub")}: ${clubLabel(input.scenario.sellingClubId, input.scenario.gameState)}`,
    `${input.text("market.targetPlayer")}: ${playerLabel(input.scenario.targetPlayerId, input.scenario.gameState)}`,
    `${input.text("market.status")}: ${formatCareerTransferStatus(input.result, input.text)}`,
    `${input.text("market.transferValue")}: ${formatMoney(input.result.transferFee)}`,
    `${input.text("market.buyerBudgetBefore")}: ${formatMoney(buyerBudgetBefore)}`,
    `${input.text("market.buyerBudgetAfter")}: ${formatMoney(buyerBudgetAfter)}`,
    `${input.text("career.saveWritten")}: ${input.text(input.careerSaveWritten ? "common.yes" : "common.no")}`,
    `${input.text("career.transferHistoryEntries")}: ${input.result.careerState.transferHistory.length}`,
    `${input.text("market.reasons")}:`,
    ...formatReasonLines(input.result, input.text),
    `${input.text("career.rosterPersisted")}:`,
    ...formatRosterPersistedLines(input.scenario, input.result, input.text),
  ];

  return lines;
}

/** Formats the persisted career inspection view. */
export function formatCareerInspectOutput(input: {
  readonly careerState: CliCareerState;
  readonly saveDirectoryPath: string;
  readonly text: Translator;
}): readonly string[] {
  const selectedClub = input.careerState.gameState.clubs[input.careerState.selectedClubId];
  const selectedBudget = findClubTransferBudget(input.careerState.marketState, input.careerState.selectedClubId);
  const lines = [
    input.text("career.inspect.title"),
    `${input.text("career.save")}: ${input.careerState.saveId}`,
    `${input.text("career.saveDirectory")}: ${input.saveDirectoryPath}`,
    ...formatCareerWorldMetadataLines(input.careerState, input.text),
    `${input.text("setup.selectedClub")}: ${clubLabel(input.careerState.selectedClubId, input.careerState.gameState)}`,
    `${input.text("career.selectedClubRosterSize")}: ${selectedClub?.playerIds.length ?? 0}`,
    `${input.text("career.selectedClubTransferFunds")}: ${formatMoney(selectedBudget?.transferBudget)}`,
    `${input.text("career.selectedClubPlayedFixtures")}: ${countPlayedSelectedClubFixtures(input.careerState)}`,
    `${input.text("career.transferHistory")}:`,
    ...formatTransferHistoryLines(input.careerState, input.text),
    `${input.text("career.matchPreparation")}:`,
    ...formatCareerMatchPreparationLines(input.careerState, input.text),
    `${input.text("career.affectedClubs")}:`,
    ...formatAffectedClubLines(input.careerState, input.text),
  ];

  return lines;
}

/** Formats the result of save-writing career fixture advancement. */
export function formatCareerAdvanceOutput(input: {
  readonly result: CareerAdvanceResult;
  readonly saveId: string;
  readonly saveDirectoryPath: string;
  readonly text: Translator;
}): readonly string[] {
  if (input.result.status === "none") {
    return [
      input.text("career.advance.title"),
      `${input.text("career.save")}: ${input.saveId}`,
      `${input.text("career.saveDirectory")}: ${input.saveDirectoryPath}`,
      `${input.text("career.advance.status")}: ${input.text("career.advance.status.none")}`,
      `${input.text("career.saveWritten")}: ${input.text("common.no")}`,
    ];
  }

  if (input.result.status === "invalid") {
    return [
      input.text("career.advance.title"),
      `${input.text("career.save")}: ${input.saveId}`,
      `${input.text("career.saveDirectory")}: ${input.saveDirectoryPath}`,
      `${input.text("career.advance.status")}: ${input.text("career.advance.status.invalid")}`,
      `${input.text("career.advance.reason")}: ${formatCareerAdvanceInvalidReason(input.result.reason, input.text)}`,
      `${input.text("career.saveWritten")}: ${input.text("common.no")}`,
    ];
  }

  const nextFixture = findNextSelectedClubFixture(input.result.careerState);

  const lines = [
    input.text("career.advance.title"),
    `${input.text("career.save")}: ${input.saveId}`,
    `${input.text("career.saveDirectory")}: ${input.saveDirectoryPath}`,
    `${input.text("career.advance.status")}: ${input.text("career.advance.status.advanced")}`,
    `${input.text("career.advance.fixture")}: ${input.result.fixtureId}`,
    `${input.text("career.advance.result")}: ${clubLabel(
      input.result.fixtureAfter.homeClubId,
      input.result.careerState.gameState,
    )} ${input.result.fixtureAfter.result?.homeGoals ?? 0}-${input.result.fixtureAfter.result?.awayGoals ?? 0} ${clubLabel(
      input.result.fixtureAfter.awayClubId,
      input.result.careerState.gameState,
    )}`,
    `${input.text("career.saveWritten")}: ${input.text("common.yes")}`,
    `${input.text("career.advance.recovery")}:`,
    ...formatCareerAdvanceRecoveryLines(input.result, input.text),
    `${input.text("career.advance.conditionChanges")}:`,
    ...formatCareerAdvanceConditionLines(input.result, input.text),
    `${input.text("career.nextSelectedClubFixture")}:`,
    ...formatNextSelectedClubFixtureLines(input.result.careerState, nextFixture, input.text),
  ];

  if (input.result.explanationTrace !== undefined) {
    lines.push(...formatCareerFixtureExplanationTraceOutput(input.result.explanationTrace, input.result.careerState.gameState, input.text));
  }

  return lines;
}

function formatCareerAdvanceRecoveryLines(
  result: Extract<CareerAdvanceResult, { readonly status: "advanced" }>,
  text: Translator,
): readonly string[] {
  const changes = result.preMatchRecovery.changes;
  const improvedCount = changes.filter((change) => change.recovered).length;

  return [
    `  ${text("career.advance.recoveryDays")}: ${result.preMatchRecovery.dayCount}`,
    `  ${text("career.advance.recoveryPlayersImproved")}: ${improvedCount}`,
    `  ${text("career.advance.recoveryFitnessRange")}: ${formatFitnessRange(changes, text)}`,
  ];
}

function formatCareerAdvanceConditionLines(
  result: Extract<CareerAdvanceResult, { readonly status: "advanced" }>,
  text: Translator,
): readonly string[] {
  const startedChanges = result.conditionChanges.filter((change) => change.started);
  const restedFirstTeamChanges = restedFirstTeamConditionChanges(result);

  return [
    `  ${text("career.advance.conditionStarted")}:`,
    ...formatConditionChangeLines(startedChanges, result.careerState.gameState, text),
    `  ${text("career.advance.conditionRestedFirstTeam")}:`,
    ...formatConditionChangeLines(restedFirstTeamChanges, result.careerState.gameState, text),
  ];
}

function restedFirstTeamConditionChanges(
  result: Extract<CareerAdvanceResult, { readonly status: "advanced" }>,
): readonly (typeof result.conditionChanges)[number][] {
  const selectedClub = result.careerState.gameState.clubs[result.careerState.selectedClubId];
  const firstTeamIds = selectedClub?.playerIds.slice(0, 11) ?? [];
  const firstTeamIdSet = new Set(firstTeamIds);

  return result.conditionChanges.filter((change) => !change.started && firstTeamIdSet.has(change.playerId));
}

function formatConditionChangeLines(
  changes: readonly { readonly playerId: PlayerId; readonly beforeFitness: number; readonly afterFitness: number; readonly delta: number }[],
  gameState: CliGameState,
  text: Translator,
): readonly string[] {
  if (changes.length === 0) {
    return [`    ${text("common.none")}`];
  }

  return changes.map((change) =>
    `    ${text("career.advance.conditionLine", {
      player: playerLabel(change.playerId, gameState),
      before: String(change.beforeFitness),
      after: String(change.afterFitness),
      delta: formatSignedNumber(change.delta),
    })}`
  );
}

function formatFitnessRange(
  changes: readonly { readonly beforeFitness: number; readonly afterFitness: number }[],
  text: Translator,
): string {
  if (changes.length === 0) {
    return text("common.none");
  }

  const beforeValues = changes.map((change) => change.beforeFitness);
  const afterValues = changes.map((change) => change.afterFitness);

  return text("career.advance.recoveryRangeValue", {
    beforeMin: String(Math.min(...beforeValues)),
    beforeMax: String(Math.max(...beforeValues)),
    afterMin: String(Math.min(...afterValues)),
    afterMax: String(Math.max(...afterValues)),
  });
}

/** Formats the lab command that rolls a completed career save into next season. */
export function formatCareerSeasonRolloverOutput(input: {
  readonly result: CareerSeasonRolloverFormatResult;
  readonly saveId: string;
  readonly saveDirectoryPath: string;
  readonly text: Translator;
}): readonly string[] {
  if (input.result.status === "invalid") {
    return [
      input.text("career.rollover.title"),
      `${input.text("career.save")}: ${input.saveId}`,
      `${input.text("career.saveDirectory")}: ${input.saveDirectoryPath}`,
      `${input.text("career.rollover.status")}: ${input.text("career.rollover.status.invalid")}`,
      `${input.text("career.rollover.reason")}: ${formatCareerRolloverInvalidReason(input.result.reason, input.text)}`,
      ...(input.result.fixtureId === undefined ? [] : [`${input.text("career.rollover.blockingFixture")}: ${input.result.fixtureId}`]),
      `${input.text("career.saveWritten")}: ${input.text("common.no")}`,
    ];
  }

  return [
    input.text("career.rollover.title"),
    `${input.text("career.save")}: ${input.saveId}`,
    `${input.text("career.saveDirectory")}: ${input.saveDirectoryPath}`,
    `${input.text("career.rollover.status")}: ${input.text("career.rollover.status.rolledOver")}`,
    `${input.text("career.rollover.previousSeason")}: ${input.result.previousSeasonId}`,
    `${input.text("career.rollover.nextSeason")}: ${input.result.nextSeasonId}`,
    `${input.text("career.currentDate")}: ${toISO(input.result.careerState.gameState.calendar.currentDate)}`,
    `${input.text("career.rollover.archivedSeasons")}: ${input.result.archivedSeasonCount}`,
    `${input.text("career.rollover.champion")}: ${clubLabel(input.result.championClubId, input.result.careerState.gameState)}`,
    `${input.text("career.rollover.selectedClubFinish")}: ${input.text("career.rollover.selectedClubFinishValue", {
      position: String(input.result.selectedClubFinish.position),
      points: String(input.result.selectedClubFinish.points),
      goalDifference: formatSignedNumber(input.result.selectedClubFinish.goalDifference),
    })}`,
    `${input.text("career.rollover.aggregateGoals")}: ${input.text("career.rollover.aggregateGoalsValue", {
      goals: String(input.result.aggregateGoals.totalGoals),
      fixtures: String(input.result.aggregateGoals.fixtureCount),
    })}`,
    `${input.text("career.rollover.nextSeasonFixtures")}: ${input.result.newFixtureCount}`,
    `${input.text("career.rollover.playerState")}: ${input.text("career.rollover.playerStateValue")}`,
    `${input.text("career.rollover.matchPreparation")}: ${input.text("career.rollover.matchPreparationCleared")}`,
    `${input.text("career.saveWritten")}: ${input.text("common.yes")}`,
  ];
}

/** Formats the in-memory lab report for multi-season player development. */
export function formatCareerDevelopmentReportOutput(input: {
  readonly result: CareerDevelopmentReportFormatResult;
  readonly saveId: string;
  readonly saveDirectoryPath: string;
  readonly text: Translator;
}): readonly string[] {
  return [
    input.text("career.developmentReport.title"),
    `${input.text("career.save")}: ${input.saveId}`,
    `${input.text("career.saveDirectory")}: ${input.saveDirectoryPath}`,
    `${input.text("career.developmentReport.seasonsSimulated")}: ${input.result.seasonsSimulated}`,
    `${input.text("career.developmentReport.inspectionOnly")}`,
    `${input.text("career.saveWritten")}: ${input.text("common.no")}`,
    `${input.text("career.developmentReport.aggregate")}:`,
    `  ${input.text("career.developmentReport.playersReviewed")}: ${input.result.playersReviewed}`,
    `  ${input.text("career.developmentReport.playersImproved")}: ${input.result.playersImproved}`,
    `  ${input.text("career.developmentReport.playersDeclined")}: ${input.result.playersDeclined}`,
    `  ${input.text("career.developmentReport.stalledProspects")}: ${input.result.stalledProspects}`,
    `  ${input.text("career.developmentReport.totalGrowth")}: ${formatDelta(input.result.totalGrowth)}`,
    `  ${input.text("career.developmentReport.totalDecline")}: ${formatDelta(input.result.totalDecline)}`,
    `${input.text("career.developmentReport.examples")}:`,
    `  ${input.text("career.developmentReport.biggestImprover")}: ${formatDevelopmentExample(
      input.result.biggestImprover,
      input.result.careerState,
      input.text,
    )}`,
    `  ${input.text("career.developmentReport.biggestDecline")}: ${formatDevelopmentExample(
      input.result.biggestDecline,
      input.result.careerState,
      input.text,
    )}`,
    `  ${input.text("career.developmentReport.stalledProspect")}: ${formatDevelopmentExample(
      input.result.stalledProspect,
      input.result.careerState,
      input.text,
    )}`,
    `  ${input.text("career.developmentReport.decliningVeteran")}: ${formatDevelopmentExample(
      input.result.decliningVeteran,
      input.result.careerState,
      input.text,
    )}`,
  ];
}

/** Formats the output emitted after saving a lineup into a career save. */
export function formatCareerLineupSaveOutput(input: {
  readonly result: SaveCareerLineupDemoResult;
  readonly saveId: string;
  readonly saveDirectoryPath: string;
  readonly text: Translator;
}): readonly string[] {
  return [
    input.text("career.lineupSave.title"),
    `${input.text("career.save")}: ${input.saveId}`,
    `${input.text("career.saveDirectory")}: ${input.saveDirectoryPath}`,
    `${input.text("career.lineupSave.profile")}: ${input.result.profileKey}`,
    `${input.text("setup.selectedClub")}: ${clubLabel(input.result.clubId, input.result.careerState.gameState)}`,
    `${input.text("career.saveWritten")}: ${input.text("common.yes")}`,
    `${input.text("career.lineupSave.appliesToNextFixture")}: ${input.result.nextFixture === undefined ? input.text("common.no") : input.text("common.yes")}`,
    `${input.text("career.nextSelectedClubFixture")}:`,
    ...formatNextSelectedClubFixtureLines(input.result.careerState, input.result.nextFixture, input.text),
    `${input.text("lineup.selectedStarters")}:`,
    ...formatSavedLineupSlotLines(input.result.selectedLineup.slots, input.result.careerState.gameState, input.text),
    `${input.text("lineup.changesFromFirstTeam")}:`,
    ...formatLineupChangeLines(input.result.playerChanges, input.result.careerState.gameState, input.text),
  ];
}

/** Formats the output emitted after saving a tactic into a career save. */
export function formatCareerTacticSaveOutput(input: {
  readonly result: SaveCareerTacticDemoResult;
  readonly saveId: string;
  readonly saveDirectoryPath: string;
  readonly text: Translator;
}): readonly string[] {
  return [
    input.text("career.tacticSave.title"),
    `${input.text("career.save")}: ${input.saveId}`,
    `${input.text("career.saveDirectory")}: ${input.saveDirectoryPath}`,
    `${input.text("career.tacticSave.profile")}: ${input.result.profileKey}`,
    `${input.text("setup.selectedClub")}: ${clubLabel(input.result.clubId, input.result.careerState.gameState)}`,
    `${input.text("career.saveWritten")}: ${input.text("common.yes")}`,
    `${input.text("career.nextSelectedClubFixture")}:`,
    ...formatNextSelectedClubFixtureLines(input.result.careerState, input.result.nextFixture, input.text),
    `${input.text("career.matchPreparation.savedTactic")}: ${formatTacticSetup(input.result.tactic, input.text)}`,
  ];
}

/** Formats the compact save-driven summary used before advancing a career. */
export function formatCareerSummaryOutput(input: {
  readonly careerState: CliCareerState;
  readonly saveDirectoryPath: string;
  readonly text: Translator;
}): readonly string[] {
  const selectedClub = input.careerState.gameState.clubs[input.careerState.selectedClubId];
  const selectedBudget = findClubTransferBudget(input.careerState.marketState, input.careerState.selectedClubId);
  const nextFixture = findNextSelectedClubFixture(input.careerState);

  return [
    input.text("career.summary.title"),
    `${input.text("career.save")}: ${input.careerState.saveId}`,
    `${input.text("career.saveDirectory")}: ${input.saveDirectoryPath}`,
    ...formatCareerWorldMetadataLines(input.careerState, input.text),
    `${input.text("career.currentDate")}: ${toISO(input.careerState.gameState.calendar.currentDate)}`,
    `${input.text("career.currentSeason")}: ${input.careerState.gameState.calendar.currentSeasonId}`,
    `${input.text("setup.selectedClub")}: ${clubLabel(input.careerState.selectedClubId, input.careerState.gameState)}`,
    `${input.text("career.selectedClubRosterSize")}: ${selectedClub?.playerIds.length ?? 0}`,
    `${input.text("career.selectedClubTransferFunds")}: ${formatMoney(selectedBudget?.transferBudget)}`,
    `${input.text("career.nextSelectedClubFixture")}:`,
    ...formatNextSelectedClubFixtureLines(input.careerState, nextFixture, input.text),
    `${input.text("career.matchPreparation")}:`,
    ...formatCareerMatchPreparationLines(input.careerState, input.text),
  ];
}

function formatCareerMatchPreparationLines(careerState: CliCareerState, text: Translator): readonly string[] {
  const preparation = careerState.matchPreparation;
  if (preparation === undefined) {
    return [`  ${text("career.matchPreparation.none")}`];
  }

  const lines = [
    `  ${text("career.matchPreparation.updatedAt")}: ${toISO(preparation.updatedAt)}`,
    `  ${text("career.matchPreparation.targetFixture")}: ${preparation.targetFixtureId ?? text("common.none")}`,
    `  ${text("career.matchPreparation.savedLineup")}:`,
  ];

  if (preparation.selectedLineup === undefined) {
    lines.push(`    ${text("common.none")}`);
  } else {
    lines.push(...formatSavedLineupSlotLines(preparation.selectedLineup.slots, careerState.gameState, text).map((line) => `  ${line}`));
  }

  lines.push(
    `  ${text("career.matchPreparation.savedTactic")}: ${
      preparation.tactic === undefined ? text("common.none") : formatTacticSetup(preparation.tactic, text)
    }`,
  );

  return lines;
}

function formatSavedLineupSlotLines(
  slots: readonly { readonly slotKey: string; readonly playerId: PlayerId; readonly roleKey: string }[],
  gameState: CliGameState,
  text: Translator,
): readonly string[] {
  return slots.map((slot) => `  ${slot.slotKey} ${playerLabel(slot.playerId, gameState)} ${formatLineupRole(slot.roleKey, text)}`);
}

function formatLineupChangeLines(
  changes: readonly { readonly fromPlayerId: PlayerId; readonly toPlayerId: PlayerId }[],
  gameState: CliGameState,
  text: Translator,
): readonly string[] {
  if (changes.length === 0) {
    return [`  ${text("common.none")}`];
  }

  return changes.map((change) =>
    `  ${text("lineup.replacedBy", {
      from: playerLabel(change.fromPlayerId, gameState),
      to: playerLabel(change.toPlayerId, gameState),
    })}`
  );
}

function formatLineupRole(roleKey: string, text: Translator): string {
  return text(presentationMessageKey("lineup.role", roleKey));
}

function formatCareerAdvanceInvalidReason(reason: string, text: Translator): string {
  switch (reason) {
    case "missing_match_preparation":
      return text("career.advance.reason.missingMatchPreparation");
    case "missing_saved_lineup":
      return text("career.advance.reason.missingSavedLineup");
    case "missing_saved_tactic":
      return text("career.advance.reason.missingSavedTactic");
    default:
      return reason;
  }
}

function formatCareerRolloverInvalidReason(reason: string, text: Translator): string {
  switch (reason) {
    case "current_season_incomplete":
      return text("career.rollover.reason.currentSeasonIncomplete");
    case "fixture_missing":
      return text("career.rollover.reason.fixtureMissing");
    case "fixture_home_club_not_found":
      return text("career.rollover.reason.fixtureHomeClubNotFound");
    case "fixture_away_club_not_found":
      return text("career.rollover.reason.fixtureAwayClubNotFound");
    case "no_current_season_fixtures":
      return text("career.rollover.reason.noCurrentSeasonFixtures");
    case "multiple_current_season_competitions":
      return text("career.rollover.reason.multipleCurrentSeasonCompetitions");
    case "season_table_empty":
      return text("career.rollover.reason.seasonTableEmpty");
    case "selected_club_not_in_table":
      return text("career.rollover.reason.selectedClubNotInTable");
    default:
      return reason;
  }
}

function formatDevelopmentExample(
  example: CareerDevelopmentReportPlayerExample | undefined,
  careerState: CliCareerState,
  text: Translator,
): string {
  if (example === undefined) {
    return text("common.none");
  }

  return text("career.developmentReport.exampleValue", {
    player: playerLabel(example.playerId, careerState.gameState),
    startAge: String(example.startAge),
    endAge: String(example.endAge),
    growth: formatDelta(example.totalGrowth),
    decline: formatDelta(example.totalDecline),
  });
}

function formatDelta(value: number): string {
  return value.toFixed(2);
}

function formatTacticSetup(
  tactic: { readonly mentality: string; readonly pressing: number; readonly directness: number; readonly width: number; readonly risk: number },
  text: Translator,
): string {
  return `${text("setup.mentality")}=${formatMentality(tactic.mentality, text)} ${text("setup.pressing")}=${formatTacticKnob(
    tactic.pressing,
  )} ${text("setup.directness")}=${formatTacticKnob(tactic.directness)} ${text("setup.width")}=${formatTacticKnob(tactic.width)} ${text(
    "setup.risk",
  )}=${formatTacticKnob(tactic.risk)}`;
}

function formatMentality(mentality: string, text: Translator): string {
  return text(presentationMessageKey("setup.mentalityValue", mentality));
}

function formatTacticKnob(value: number): string {
  return value.toFixed(2);
}

/**
 * Formats optional career fixture explanation output from language-agnostic
 * engine trace data.
 */
function formatCareerFixtureExplanationTraceOutput(
  trace: MatchExplanationTrace,
  gameState: CliGameState,
  text: Translator,
): readonly string[] {
  return [
    `${text("fixture.explanation.title")}:`,
    `  ${text("fixture.explanation.teamStrength")}:`,
    formatExplanationStrengthLine(trace.home, gameState, text),
    formatExplanationStrengthLine(trace.away, gameState, text),
    `  ${text("fixture.explanation.tacticDistribution")}:`,
    formatExplanationTacticLine(trace.home, gameState, text),
    formatExplanationTacticLine(trace.away, gameState, text),
    `  ${text("fixture.explanation.lineupRoles")}:`,
    formatExplanationLineupLine(trace.home, gameState, text),
    formatExplanationLineupLine(trace.away, gameState, text),
    `  ${text("fixture.explanation.conditionImpact")}:`,
    formatExplanationConditionLine(trace.home, gameState, text),
    formatExplanationConditionLine(trace.away, gameState, text),
    `  ${text("fixture.explanation.chanceSummary")}:`,
    formatExplanationOpportunityLine(trace.home.clubId, trace.opportunitySummary.home, gameState, text),
    formatExplanationOpportunityLine(trace.away.clubId, trace.opportunitySummary.away, gameState, text),
    `  ${text("fixture.explanation.variance")}: ${trace.variance.markers.map((marker) => formatVarianceMarker(marker, text)).join(", ")}`,
  ];
}

/** Formats one team's strength snapshot. */
function formatExplanationStrengthLine(
  team: MatchExplanationTrace["home"],
  gameState: CliGameState,
  text: Translator,
): string {
  return `    ${clubLabel(team.clubId, gameState)}: ${text("fixture.explanation.attack")}=${formatDecimal(team.strength.attack)} ${text("fixture.explanation.midfield")}=${formatDecimal(team.strength.midfield)} ${text("fixture.explanation.defense")}=${formatDecimal(team.strength.defense)} ${text("fixture.explanation.goalkeeper")}=${formatDecimal(team.strength.goalkeeper)} ${text("fixture.explanation.overall")}=${formatDecimal(team.strength.overall)}`;
}

/** Formats one team's tactic snapshot. */
function formatExplanationTacticLine(
  team: MatchExplanationTrace["home"],
  gameState: CliGameState,
  text: Translator,
): string {
  return `    ${clubLabel(team.clubId, gameState)}: ${text("setup.directness")}=${formatTacticKnob(team.tacticDistribution.directness)} ${text("setup.pressing")}=${formatTacticKnob(team.tacticDistribution.pressing)} ${text("setup.width")}=${formatTacticKnob(team.tacticDistribution.width)} ${text("setup.risk")}=${formatTacticKnob(team.tacticDistribution.risk)}`;
}

/** Formats one team's role-count snapshot. */
function formatExplanationLineupLine(
  team: MatchExplanationTrace["home"],
  gameState: CliGameState,
  text: Translator,
): string {
  return `    ${clubLabel(team.clubId, gameState)}: ${formatRoleCounts(team, text)}`;
}

/** Formats one team's condition-impact snapshot. */
function formatExplanationConditionLine(
  team: MatchExplanationTrace["home"],
  gameState: CliGameState,
  text: Translator,
): string {
  return `    ${clubLabel(team.clubId, gameState)}: ${formatConditionTracking(team.conditionImpact.tracking, text)} ${text("fixture.explanation.effect")}=${formatConditionEffect(team.conditionImpact.effectDirection, text)} ${text("fixture.explanation.affectedPlayers")}=${team.conditionImpact.affectedPlayerCount}`;
}

/** Formats one team's chance and shot summary. */
function formatExplanationOpportunityLine(
  clubId: ClubId,
  summary: MatchExplanationTrace["opportunitySummary"]["home"],
  gameState: CliGameState,
  text: Translator,
): string {
  return `    ${clubLabel(clubId, gameState)}: ${text("fixture.explanation.opportunities")}=${summary.opportunities} ${text("fixture.explanation.shots")}=${summary.shots} ${text("fixture.explanation.shotsOnTarget")}=${summary.shotsOnTarget} ${text("fixture.explanation.goals")}=${summary.goals} ${text("fixture.explanation.blocks")}=${summary.blockedShots} ${text("fixture.explanation.savedShots")}=${summary.savedShots} ${text("fixture.explanation.chanceTypes")}=${formatTraceBuckets(summary.chanceTypeCounts, (key) => formatChanceType(key, text), text)} ${text("fixture.explanation.shotTypes")}=${formatTraceBuckets(summary.shotTypeCounts, (key) => formatShotType(key, text), text)}`;
}

/** Formats a numeric trace value with stable precision. */
function formatDecimal(value: number): string {
  return value.toFixed(2);
}

/** Formats a stable shot-type key for presentation output. */
function formatShotType(shotType: string, text: Translator): string {
  return text(presentationMessageKey("event.shotType", shotType));
}

/** Formats a stable chance-type key for presentation output. */
function formatChanceType(chanceType: string, text: Translator): string {
  return text(presentationMessageKey("event.chanceType", chanceType));
}

/** Formats sorted role counts for one explanation snapshot. */
function formatRoleCounts(team: MatchExplanationTrace["home"], text: Translator): string {
  const counts: { readonly roleKey: string; readonly count: number }[] = [];

  for (const slot of team.lineup.slots) {
    const existing = counts.find((candidate) => candidate.roleKey === slot.roleKey);

    if (existing === undefined) {
      counts.push({ roleKey: slot.roleKey, count: 1 });
      continue;
    }

    counts.splice(counts.indexOf(existing), 1, { roleKey: existing.roleKey, count: existing.count + 1 });
  }

  return counts
    .sort((left, right) => compareAscii(left.roleKey, right.roleKey))
    .map((entry) => `${formatLineupRole(entry.roleKey, text)}=${entry.count}`)
    .join(" ");
}

/** Formats trace buckets with stable machine-key order. */
function formatTraceBuckets(
  buckets: readonly { readonly key: string; readonly count: number }[],
  formatKey: (key: string) => string,
  text: Translator,
): string {
  if (buckets.length === 0) {
    return text("common.none");
  }

  return buckets.map((bucket) => `${formatKey(bucket.key)}=${bucket.count}`).join(",");
}

/** Formats condition tracking state. */
function formatConditionTracking(
  tracking: MatchExplanationTrace["home"]["conditionImpact"]["tracking"],
  text: Translator,
): string {
  return text(presentationMessageKey("fixture.explanation.conditionTracking", tracking));
}

/** Formats condition effect direction. */
function formatConditionEffect(
  effect: MatchExplanationTrace["home"]["conditionImpact"]["effectDirection"],
  text: Translator,
): string {
  return text(presentationMessageKey("fixture.explanation.effectDirection", effect));
}

/** Formats one variance marker. */
function formatVarianceMarker(marker: MatchExplanationTrace["variance"]["markers"][number], text: Translator): string {
  return text(presentationMessageKey("fixture.explanation.varianceMarker", marker));
}

/** Formats the selected club squad from a persisted career save. */
export function formatCareerSquadOutput(input: {
  readonly careerState: CliCareerState;
  readonly saveDirectoryPath: string;
  readonly text: Translator;
}): readonly string[] {
  const selectedClub = input.careerState.gameState.clubs[input.careerState.selectedClubId];
  const lines = [
    input.text("career.squad.title"),
    `${input.text("career.save")}: ${input.careerState.saveId}`,
    `${input.text("career.saveDirectory")}: ${input.saveDirectoryPath}`,
    ...formatCareerWorldMetadataLines(input.careerState, input.text),
    `${input.text("career.currentDate")}: ${toISO(input.careerState.gameState.calendar.currentDate)}`,
    `${input.text("setup.selectedClub")}: ${clubLabel(input.careerState.selectedClubId, input.careerState.gameState)}`,
    `${input.text("career.selectedClubRosterSize")}: ${selectedClub?.playerIds.length ?? 0}`,
    `${input.text("career.squad.inspectionOnly")}`,
    `${input.text("career.squad.players")}:`,
    input.text("career.squad.tableHeader"),
  ];

  if (selectedClub === undefined || selectedClub.playerIds.length === 0) {
    return [...lines, `  ${input.text("common.none")}`];
  }

  return [
    ...lines,
    ...selectedClub.playerIds.map((playerId) => formatCareerSquadPlayerLine(input.careerState, playerId, input.text)),
  ];
}

/** Formats a non-mutating inspection of the selected club youth academy. */
export function formatCareerYouthAcademyOutput(input: {
  readonly careerState: CliCareerState;
  readonly saveDirectoryPath: string;
  readonly text: Translator;
}): readonly string[] {
  const selectedClub = input.careerState.gameState.clubs[input.careerState.selectedClubId];
  const selectedYouthIds = input.careerState.youthAcademyState?.clubRosters[input.careerState.selectedClubId]?.playerIds ?? [];
  const seniorPlayerCount = input.careerState.gameState.clubIds.reduce(
    (sum, clubId) => sum + (input.careerState.gameState.clubs[clubId]?.playerIds.length ?? 0),
    0,
  );
  const youthPlayerCount = input.careerState.gameState.clubIds.reduce(
    (sum, clubId) => sum + (input.careerState.youthAcademyState?.clubRosters[clubId]?.playerIds.length ?? 0),
    0,
  );
  const lines = [
    input.text("career.youth.title"),
    `${input.text("career.save")}: ${input.careerState.saveId}`,
    `${input.text("career.saveDirectory")}: ${input.saveDirectoryPath}`,
    ...formatCareerWorldMetadataLines(input.careerState, input.text),
    `${input.text("career.currentDate")}: ${toISO(input.careerState.gameState.calendar.currentDate)}`,
    `${input.text("setup.selectedClub")}: ${clubLabel(input.careerState.selectedClubId, input.careerState.gameState)}`,
    `${input.text("career.selectedClubRosterSize")}: ${selectedClub?.playerIds.length ?? 0}`,
    `${input.text("career.youth.selectedClubYouthCount")}: ${selectedYouthIds.length}`,
    `${input.text("career.youth.activePlayers")}: senior=${seniorPlayerCount} youth=${youthPlayerCount} total=${seniorPlayerCount + youthPlayerCount}`,
    `${input.text("career.youth.inspectionOnly")}`,
    `${input.text("career.youth.players")}:`,
    input.text("career.youth.tableHeader"),
  ];

  if (selectedYouthIds.length === 0) {
    return [...lines, `  ${input.text("common.none")}`];
  }

  return [
    ...lines,
    ...selectedYouthIds.map((playerId) => formatCareerYouthPlayerLine(input.careerState, playerId, input.text)),
  ];
}

/** Formats the output shown after creating a new seeded career world. */
export function formatNewCareerWorldOutput(input: {
  readonly league: FakeLeagueSystem;
  readonly careerState: CliCareerState;
  readonly saveDirectoryPath: string;
  readonly worldSeed: string;
  readonly text: Translator;
}): readonly string[] {
  const selectedClub = input.careerState.gameState.clubs[input.careerState.selectedClubId];

  return [
    input.text("career.newWorld.title"),
    `${input.text("season.seed")}: ${input.worldSeed}`,
    `${input.text("career.worldSeed")}: ${input.worldSeed}`,
    `${input.text("career.generatorVersion")}: ${CLI_CAREER_WORLD_GENERATOR_VERSION}`,
    `${input.text("season.competition")}: ${input.league.competition.name}`,
    `${input.text("career.save")}: ${input.careerState.saveId}`,
    `${input.text("career.saveDirectory")}: ${input.saveDirectoryPath}`,
    `${input.text("setup.selectedClub")}: ${clubLabel(input.careerState.selectedClubId, input.careerState.gameState)}`,
    `${input.text("career.generatedSquadSize")}: ${selectedClub?.playerIds.length ?? 0}`,
    `${input.text("career.saveWritten")}: ${input.text("common.yes")}`,
    `${input.text("identity.nationalitySummary")}:`,
    ...formatCareerNationalitySummary(input.league, input.careerState, input.text),
    `${input.text("career.ageSummary")}:`,
    ...formatCareerAgeSummary(input.careerState, input.text),
    `${input.text("career.prospectSummary")}:`,
    ...formatCareerProspectSummary(input.league, input.careerState, input.text),
  ];
}

function formatCareerSquadPlayerLine(careerState: CliCareerState, playerId: PlayerId, text: Translator): string {
  const player = careerState.gameState.players[playerId];
  const playerState = careerState.gameState.playerStates[playerId];

  if (player === undefined) {
    return `  ${String(playerId).padEnd(28)} ${text("common.unknown")}`;
  }

  const age = Math.floor((careerState.gameState.calendar.currentDate - player.birthDate) / 365);
  const position = formatPrimaryPosition(player);
  const roleAbility = roleRelevantCurrentAbility(player);

  return [
    "  ",
    playerLabel(playerId, careerState.gameState).padEnd(28),
    String(age).padStart(3),
    " ",
    position.padEnd(4),
    " ",
    roleAbility.toFixed(1).padStart(4),
    " ",
    String(playerState?.fitness ?? "--").padStart(3),
    " ",
    String(playerState?.form ?? "--").padStart(4),
    " ",
    String(playerState?.morale ?? "--").padStart(3),
  ].join("");
}

function formatCareerYouthPlayerLine(careerState: CliCareerState, playerId: PlayerId, text: Translator): string {
  const player = careerState.gameState.players[playerId];
  const lifecycle = careerState.youthAcademyState?.playerLifecycle[playerId];

  if (player === undefined) {
    return `  ${String(playerId).padEnd(24)} ${text("common.unknown")}`;
  }

  const age = Math.floor((careerState.gameState.calendar.currentDate - player.birthDate) / 365);
  const position = formatPrimaryPosition(player);
  const abilityBand = text(presentationMessageKey("career.youth.abilityBand", youthAbilityBand(player)));
  const developmentCategory = text(presentationMessageKey("career.youth.developmentCategory", youthDevelopmentCategory(player)));
  const status = lifecycle?.status ?? "academy";

  return [
    "  ",
    playerLabel(playerId, careerState.gameState).padEnd(24),
    String(age).padStart(3),
    " ",
    formatUnknownNationality(text).padEnd(14),
    " ",
    position.padEnd(4),
    " ",
    abilityBand.padEnd(11),
    " ",
    developmentCategory.padEnd(14),
    " ",
    text(presentationMessageKey("career.youth.status", status)),
  ].join("");
}

function formatUnknownNationality(text: Translator): string {
  return text("common.unknown");
}

function youthAbilityBand(player: CliPlayer): string {
  const roleAbility = roleRelevantCurrentAbility(player);

  if (roleAbility >= 11) {
    return "strong";
  }

  if (roleAbility >= 9) {
    return "good";
  }

  if (roleAbility >= 7) {
    return "developing";
  }

  return "raw";
}

function youthDevelopmentCategory(player: CliPlayer): string {
  const roleAbility = roleRelevantCurrentAbility(player);
  const potentialRoom = averagePotentialRoom(player);

  if (roleAbility >= 9) {
    return "seniorReady";
  }

  if (potentialRoom >= 4.5) {
    return "highCeiling";
  }

  if (roleAbility >= 7.5) {
    return "promising";
  }

  if (potentialRoom >= 2.5) {
    return "developing";
  }

  return "foundation";
}

function averagePotentialRoom(player: CliPlayer): number {
  const current = abilityValues(player.abilities);
  const potential = abilityValues(player.potential);
  let totalRoom = 0;

  for (let index = 0; index < current.length; index += 1) {
    totalRoom += (potential[index] ?? 0) - (current[index] ?? 0);
  }

  return totalRoom / current.length;
}

function abilityValues(abilities: CliPlayer["abilities"]): readonly number[] {
  return [
    abilities.technical.finishing,
    abilities.technical.passing,
    abilities.technical.longPassing,
    abilities.technical.crossing,
    abilities.technical.dribbling,
    abilities.technical.technique,
    abilities.technical.tackling,
    abilities.technical.penalties,
    abilities.technical.freeKicks,
    abilities.physical.pace,
    abilities.physical.strength,
    abilities.physical.stamina,
    abilities.physical.agility,
    abilities.physical.heading,
    abilities.mental.positioning,
    abilities.mental.vision,
    abilities.mental.anticipation,
    abilities.mental.composure,
    abilities.mental.determination,
    abilities.mental.leadership,
    abilities.goalkeeping.reflexes,
    abilities.goalkeeping.handling,
    abilities.goalkeeping.rushingOut,
    abilities.goalkeeping.goalkeeperPositioning,
    abilities.goalkeeping.footwork,
  ];
}

function formatPrimaryPosition(player: CliPlayer): string {
  return (player.naturalPositions[0] ?? "n/a").toUpperCase();
}

function roleRelevantCurrentAbility(player: CliPlayer): number {
  const primaryPosition = player.naturalPositions[0];

  if (primaryPosition === "gk") {
    return average([
      player.abilities.goalkeeping.reflexes,
      player.abilities.goalkeeping.handling,
      player.abilities.goalkeeping.goalkeeperPositioning,
      player.abilities.goalkeeping.rushingOut,
      player.abilities.goalkeeping.footwork,
    ]);
  }

  if (primaryPosition === "cb" || primaryPosition === "rb" || primaryPosition === "lb" || primaryPosition === "rwb" || primaryPosition === "lwb") {
    return average([
      player.abilities.technical.tackling,
      player.abilities.mental.positioning,
      player.abilities.mental.anticipation,
      player.abilities.physical.strength,
      player.abilities.physical.heading,
    ]);
  }

  if (primaryPosition === "dm" || primaryPosition === "cm" || primaryPosition === "am") {
    return average([
      player.abilities.technical.passing,
      player.abilities.technical.technique,
      player.abilities.mental.vision,
      player.abilities.mental.positioning,
      player.abilities.physical.stamina,
    ]);
  }

  return average([
    player.abilities.technical.finishing,
    player.abilities.technical.dribbling,
    player.abilities.technical.technique,
    player.abilities.mental.composure,
    player.abilities.physical.pace,
  ]);
}

function average(values: readonly number[]): number {
  if (values.length === 0) {
    return 0;
  }

  let total = 0;
  for (const value of values) {
    total += value;
  }

  return total / values.length;
}

function formatReasonLines(result: ApplyCareerPermanentTransferResult, text: Translator): readonly string[] {
  const lines: string[] = [];

  if (result.reasons.length === 0) {
    lines.push(`  ${text("common.none")}`);
  } else {
    for (const reason of result.reasons) {
      lines.push(`  ${text(presentationMessageKey("market.reason", reason.code))}`);
    }
  }

  if (result.willingness?.reasons !== undefined && result.willingness.reasons.length > 0) {
    lines.push(`  ${text("market.playerWillingness")}:`);
    for (const reason of result.willingness.reasons) {
      lines.push(`    ${text(presentationMessageKey("market.willingnessReason", reason.code))}`);
    }
  }

  return lines;
}

function formatRosterPersistedLines(
  scenario: CareerMarketScenario,
  result: ApplyCareerPermanentTransferResult,
  text: Translator,
): readonly string[] {
  if (result.status === "rejected") {
    return [`  ${text("career.rosterNotPersisted")}`];
  }

  const buyingBefore = scenario.gameState.clubs[scenario.buyingClubId]?.playerIds.length ?? 0;
  const buyingAfter = result.careerState.gameState.clubs[scenario.buyingClubId]?.playerIds.length ?? buyingBefore;
  const sellingBefore = scenario.gameState.clubs[scenario.sellingClubId]?.playerIds.length ?? 0;
  const sellingAfter = result.careerState.gameState.clubs[scenario.sellingClubId]?.playerIds.length ?? sellingBefore;

  return [
    `  ${text("market.buyingClub")}: ${buyingBefore} -> ${buyingAfter}`,
    `  ${text("market.sellingClub")}: ${sellingBefore} -> ${sellingAfter}`,
  ];
}

function formatCareerWorldMetadataLines(careerState: CliCareerState, text: Translator): readonly string[] {
  if (careerState.careerWorld === undefined) {
    return [];
  }

  return [
    `${text("career.worldSeed")}: ${careerState.careerWorld.worldSeed}`,
    `${text("career.generatorVersion")}: ${careerState.careerWorld.generatorVersion}`,
  ];
}

function formatNextSelectedClubFixtureLines(
  careerState: CliCareerState,
  fixture: CliFixture | undefined,
  text: Translator,
): readonly string[] {
  if (fixture === undefined) {
    return [`  ${text("career.noNextSelectedClubFixture")}`];
  }

  return [
    `  ${fixture.id} ${toISO(fixture.date)} ${text("career.fixtureRound", {
      round: String(fixture.roundNumber),
    })}: ${clubLabel(fixture.homeClubId, careerState.gameState)} vs ${clubLabel(fixture.awayClubId, careerState.gameState)}`,
  ];
}

function findNextSelectedClubFixture(
  careerState: CliCareerState,
): CliFixture | undefined {
  for (const fixtureId of careerState.gameState.fixtureIds) {
    const fixture = careerState.gameState.fixtures[fixtureId];

    if (fixture === undefined || fixture.result?.played === true) {
      continue;
    }

    if (fixture.homeClubId === careerState.selectedClubId || fixture.awayClubId === careerState.selectedClubId) {
      return fixture;
    }
  }

  return undefined;
}

function countPlayedSelectedClubFixtures(careerState: CliCareerState): number {
  let count = 0;

  for (const fixtureId of careerState.gameState.fixtureIds) {
    const fixture = careerState.gameState.fixtures[fixtureId];
    if (fixture === undefined || fixture.result?.played !== true) {
      continue;
    }

    if (fixture.homeClubId === careerState.selectedClubId || fixture.awayClubId === careerState.selectedClubId) {
      count += 1;
    }
  }

  return count;
}

function formatCareerNationalitySummary(
  league: FakeLeagueSystem,
  careerState: CliCareerState,
  text: Translator,
): readonly string[] {
  const selectedClub = careerState.gameState.clubs[careerState.selectedClubId];
  if (selectedClub === undefined) {
    return [`  ${text("common.none")}`];
  }

  const counts = new Map<string, number>();
  for (const playerId of selectedClub.playerIds) {
    const identity = league.playerIdentities[playerId];
    const nationality = identity?.nationality ?? "unknown";
    counts.set(nationality, (counts.get(nationality) ?? 0) + 1);
  }

  const lines: string[] = [];
  for (const nationality of [...counts.keys()].sort()) {
    const label = nationality === "unknown" ? text("common.unknown") : text(presentationMessageKey("identity.nationality", nationality));
    lines.push(`  ${label}: ${counts.get(nationality) ?? 0}`);
  }

  return lines.length === 0 ? [`  ${text("common.none")}`] : lines;
}

function formatCareerAgeSummary(careerState: CliCareerState, text: Translator): readonly string[] {
  const selectedClub = careerState.gameState.clubs[careerState.selectedClubId];
  const counts = {
    under21: 0,
    prime: 0,
    veteran: 0,
  };

  if (selectedClub !== undefined) {
    for (const playerId of selectedClub.playerIds) {
      const player = careerState.gameState.players[playerId];
      if (player === undefined) {
        continue;
      }

      const age = Math.floor((careerState.gameState.calendar.currentDate - player.birthDate) / 365);
      if (age <= 21) {
        counts.under21 += 1;
      } else if (age <= 29) {
        counts.prime += 1;
      } else {
        counts.veteran += 1;
      }
    }
  }

  return [
    `  ${text("career.ageBand.under21")}: ${counts.under21}`,
    `  ${text("career.ageBand.prime")}: ${counts.prime}`,
    `  ${text("career.ageBand.veteran")}: ${counts.veteran}`,
  ];
}

function formatCareerProspectSummary(
  league: FakeLeagueSystem,
  careerState: CliCareerState,
  text: Translator,
): readonly string[] {
  const selectedClub = careerState.gameState.clubs[careerState.selectedClubId];
  const counts = {
    prospects: 0,
    highPotential: 0,
    rareWonderkid: 0,
  };

  if (selectedClub !== undefined) {
    for (const playerId of selectedClub.playerIds) {
      const archetypeKey = league.playerArchetypes[playerId];
      if (archetypeKey === undefined) {
        continue;
      }

      const archetype = getGeneratedPlayerArchetype(archetypeKey);
      if (archetype.depthRole === "prospect") {
        counts.prospects += 1;
      }

      if (archetype.potentialClass === "serious" || archetype.potentialClass === "elite") {
        counts.highPotential += 1;
      }

      if (archetypeKey === "rare_prodigy") {
        counts.rareWonderkid += 1;
      }
    }
  }

  return [
    `  ${text("career.prospect.prospects")}: ${counts.prospects}`,
    `  ${text("career.prospect.highPotential")}: ${counts.highPotential}`,
    `  ${text("career.prospect.rareWonderkid")}: ${counts.rareWonderkid}`,
  ];
}

function formatTransferHistoryLines(careerState: CliCareerState, text: Translator): readonly string[] {
  if (careerState.transferHistory.length === 0) {
    return [`  ${text("career.noTransferHistory")}`];
  }

  return careerState.transferHistory.map((entry) => {
    const base = text("career.historyEntry", {
      sequence: String(entry.sequenceNumber),
      player: playerLabel(entry.playerId, careerState.gameState),
      seller: clubLabel(entry.sellingClubId, careerState.gameState),
      buyer: clubLabel(entry.buyingClubId, careerState.gameState),
    });

    return `  ${base}; ${text("career.historyFee")}: ${formatMoney(entry.transferFee)}; ${text(
      "career.historyDate",
    )}: ${toISO(entry.occurredOn)}`;
  });
}

function formatAffectedClubLines(careerState: CliCareerState, text: Translator): readonly string[] {
  return affectedClubIds(careerState).map((clubId) => {
    const club = careerState.gameState.clubs[clubId];
    const budget = findClubTransferBudget(careerState.marketState, clubId);

    return `  ${clubLabel(clubId, careerState.gameState)}: ${text("career.clubRosterSize")}=${
      club?.playerIds.length ?? 0
    } ${text("career.clubBudget")}=${formatMoney(budget?.transferBudget)}`;
  });
}

function affectedClubIds(careerState: CliCareerState): readonly ClubId[] {
  const seen = new Set<string>();
  const clubIds: ClubId[] = [];

  pushUniqueClubId(clubIds, seen, careerState.selectedClubId);

  for (const entry of careerState.transferHistory) {
    pushUniqueClubId(clubIds, seen, entry.buyingClubId);
    pushUniqueClubId(clubIds, seen, entry.sellingClubId);
  }

  return clubIds;
}

function pushUniqueClubId(clubIds: ClubId[], seen: Set<string>, clubId: ClubId): void {
  if (seen.has(clubId)) {
    return;
  }

  seen.add(clubId);
  clubIds.push(clubId);
}

function findClubTransferBudget(marketState: CliMarketState, clubId: ClubId): CliClubTransferBudget | undefined {
  for (const budgetClubId of marketState.clubBudgetIds) {
    if (budgetClubId === clubId) {
      return marketState.clubBudgets[budgetClubId];
    }
  }

  return undefined;
}

function formatCareerTransferStatus(result: ApplyCareerPermanentTransferResult, text: Translator): string {
  return text(result.status === "accepted" ? "market.status.accepted" : "market.status.rejected");
}

function formatMoney(value: CliMoney | undefined): string {
  if (value === undefined) {
    return "EUR --";
  }

  return `EUR ${(value / 100).toFixed(2)}`;
}

function formatSignedNumber(value: number): string {
  return value >= 0 ? `+${value}` : String(value);
}

function playerLabel(playerId: PlayerId, gameState: CliGameState): string {
  const player = gameState.players[playerId];
  return player === undefined ? String(playerId) : `${player.firstName} ${player.lastName}`;
}

function clubLabel(clubId: ClubId, gameState: CliGameState): string {
  return gameState.clubs[clubId]?.name ?? String(clubId);
}

function presentationMessageKey(prefix: string, value: string): MessageKey {
  return `${prefix}.${value}` as MessageKey;
}

function compareAscii(left: string, right: string): number {
  if (left < right) {
    return -1;
  }

  if (left > right) {
    return 1;
  }

  return 0;
}
