import type { Translator } from "@game/i18n";
import { toISO } from "@game/shared";

import type { SaveCareerLineupDemoResult, SaveCareerTacticDemoResult } from "./preparation.ts";
import {
  clubLabel,
  formatLineupRole,
  formatNextSelectedClubFixtureLines,
  formatTacticKnob,
  playerLabel,
  presentationMessageKey,
} from "./format.ts";
import type { CliCareerState, CliGameState, PlayerId } from "./types.ts";

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

/** Formats persisted match-preparation data for summary and inspection views. */
export function formatCareerMatchPreparationLines(careerState: CliCareerState, text: Translator): readonly string[] {
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

/** Formats selected lineup slots in the compact CLI table style. */
function formatSavedLineupSlotLines(
  slots: readonly { readonly slotKey: string; readonly playerId: PlayerId; readonly roleKey: string }[],
  gameState: CliGameState,
  text: Translator,
): readonly string[] {
  return slots.map((slot) => `  ${slot.slotKey} ${playerLabel(slot.playerId, gameState)} ${formatLineupRole(slot.roleKey, text)}`);
}

/** Formats first-team-to-selected-lineup player replacement lines. */
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

/** Formats a saved tactic setup with localized labels and fixed precision. */
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
