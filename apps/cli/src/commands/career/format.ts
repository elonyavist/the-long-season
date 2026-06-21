import { getGeneratedPlayerArchetype, type FakeLeagueSystem } from "@game/content";
import type { ApplyCareerPermanentTransferResult } from "@game/engine";
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

  return [
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
    `${input.text("career.nextSelectedClubFixture")}:`,
    ...formatNextSelectedClubFixtureLines(input.result.careerState, nextFixture, input.text),
  ];
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
