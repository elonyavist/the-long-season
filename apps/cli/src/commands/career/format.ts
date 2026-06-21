import { getGeneratedPlayerArchetype, type FakeLeagueSystem } from "@game/content";
import type { ApplyCareerPermanentTransferResult } from "@game/engine";
import type { MessageKey, Translator } from "@game/i18n";
import { toISO } from "@game/shared";

import { CLI_CAREER_WORLD_GENERATOR_VERSION, type CareerMarketScenario } from "./scenarios.ts";
import type { CareerAdvanceResult } from "./progression.ts";
import type { CliCareerState, CliClubTransferBudget, CliGameState, CliMarketState, CliMoney, ClubId, PlayerId } from "./types.ts";

type CliFixtureId = CliGameState["fixtureIds"][number];
type CliFixture = CliGameState["fixtures"][CliFixtureId];

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
      `${input.text("career.advance.reason")}: ${input.result.reason}`,
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

      if (archetypeKey === "high_potential_prospect") {
        counts.highPotential += 1;
      }

      if (archetypeKey === "rare_wonderkid") {
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

function playerLabel(playerId: PlayerId, gameState: CliGameState): string {
  const player = gameState.players[playerId];
  return player === undefined ? String(playerId) : `${player.firstName} ${player.lastName}`;
}

function clubLabel(clubId: ClubId, gameState: CliGameState): string {
  return gameState.clubs[clubId]?.shortName ?? String(clubId);
}

function presentationMessageKey(prefix: string, value: string): MessageKey {
  return `${prefix}.${value}` as MessageKey;
}
