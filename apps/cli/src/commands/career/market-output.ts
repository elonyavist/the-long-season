import type { FakeDomesticWorld } from "@game/content";
import type { ApplyCareerPermanentTransferResult } from "@game/engine";
import type { Translator } from "@game/i18n";

import {
  clubLabel,
  formatMoney,
  playerLabel,
  presentationMessageKey,
} from "./format.ts";
import type { CareerMarketScenario } from "./scenarios.ts";
import { competitionIdForClubInWorld } from "./scenarios.ts";

/** Formats the result of applying a profile-based permanent-transfer demo. */
export function formatCareerMarketApplyOutput(input: {
  readonly world: FakeDomesticWorld;
  readonly seed: string;
  readonly saveId: string;
  readonly saveDirectoryPath: string;
  readonly profileKey: string;
  readonly scenario: CareerMarketScenario;
  readonly result: ApplyCareerPermanentTransferResult;
  readonly careerSaveWritten: boolean;
  readonly text: Translator;
}): readonly string[] {
  const buyerBudgetBefore = input.scenario.clubFinanceState.accounts[
    input.scenario.buyingClubId
  ]?.availableTransferBudget;
  const buyerBudgetAfter = input.result.careerState.clubFinanceState?.accounts[
    input.scenario.buyingClubId
  ]?.availableTransferBudget;
  const lines = [
    input.text("career.marketApply.title"),
    `${input.text("season.seed")}: ${input.seed}`,
    `${input.text("season.competition")}: ${selectedCompetitionName(input)}`,
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

/** Resolves the selected club's current competition for deterministic output. */
function selectedCompetitionName(input: {
  readonly world: FakeDomesticWorld;
  readonly scenario: CareerMarketScenario;
}): string {
  const competitionId = competitionIdForClubInWorld(
    input.world.domesticCompetitionWorld,
    input.scenario.selectedClubId,
  );
  return competitionId === undefined
    ? "unknown"
    : input.world.domesticCompetitionWorld.competitions[competitionId]?.name ?? String(competitionId);
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

function formatCareerTransferStatus(result: ApplyCareerPermanentTransferResult, text: Translator): string {
  return text(result.status === "accepted" ? "market.status.accepted" : "market.status.rejected");
}
