import { selectPlayerValuationConfig } from "@game/content";
import {
  derivePublicPlayerAssessment,
  type PlayerValuationConfig,
  type PublicPlayerAssessment,
} from "@game/engine";
import type { Translator } from "@game/i18n";
import { toISO } from "@game/shared";

import {
  clubLabel,
  formatCareerWorldMetadataLines,
  playerLabel,
  presentationMessageKey,
} from "./format.ts";
import type { CliCareerState, CliPlayer, PlayerId } from "./types.ts";

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
  const valuationConfig = selectPlayerValuationConfig(
    input.careerState.gameState.meta.calibrationVersions,
  );

  return [
    ...lines,
    ...selectedClub.playerIds.map((playerId) => formatCareerSquadPlayerLine(
      input.careerState,
      playerId,
      input.text,
      valuationConfig,
    )),
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
  const valuationConfig = selectPlayerValuationConfig(
    input.careerState.gameState.meta.calibrationVersions,
  );

  return [
    ...lines,
    ...selectedYouthIds.map((playerId) => formatCareerYouthPlayerLine(
      input.careerState,
      playerId,
      input.text,
      valuationConfig,
    )),
  ];
}

function formatCareerSquadPlayerLine(
  careerState: CliCareerState,
  playerId: PlayerId,
  text: Translator,
  valuationConfig: PlayerValuationConfig,
): string {
  const player = careerState.gameState.players[playerId];
  const playerState = careerState.gameState.playerStates[playerId];

  if (player === undefined) {
    return `  ${String(playerId).padEnd(28)} ${text("common.unknown")}`;
  }

  const assessment = assessmentFor(player, careerState, valuationConfig);
  const position = formatPrimaryPosition(player);

  return [
    "  ",
    playerLabel(playerId, careerState.gameState).padEnd(28),
    String(assessment.age).padStart(3),
    " ",
    position.padEnd(4),
    " ",
    assessment.currentAbility.toFixed(1).padStart(4),
    " ",
    String(playerState?.fitness ?? "--").padStart(3),
    " ",
    String(playerState?.form ?? "--").padStart(4),
    " ",
    String(playerState?.morale ?? "--").padStart(3),
  ].join("");
}

function formatCareerYouthPlayerLine(
  careerState: CliCareerState,
  playerId: PlayerId,
  text: Translator,
  valuationConfig: PlayerValuationConfig,
): string {
  const player = careerState.gameState.players[playerId];
  const lifecycle = careerState.youthAcademyState?.playerLifecycle[playerId];

  if (player === undefined) {
    return `  ${String(playerId).padEnd(24)} ${text("common.unknown")}`;
  }

  const assessment = assessmentFor(player, careerState, valuationConfig);
  const position = formatPrimaryPosition(player);
  const abilityBand = text(presentationMessageKey("career.youth.abilityBand", youthAbilityBand(assessment)));
  const developmentCategory = text(presentationMessageKey("career.youth.developmentCategory", youthDevelopmentCategory(assessment)));
  const status = lifecycle?.status ?? "academy";

  return [
    "  ",
    playerLabel(playerId, careerState.gameState).padEnd(24),
    String(assessment.age).padStart(3),
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

function youthAbilityBand(assessment: PublicPlayerAssessment): string {
  const roleAbility = assessment.currentAbility;

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

function youthDevelopmentCategory(assessment: PublicPlayerAssessment): string {
  const roleAbility = assessment.currentAbility;
  const potentialRoom = assessment.upperAbility - assessment.currentAbility;

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

function formatPrimaryPosition(player: CliPlayer): string {
  return (player.naturalPositions[0] ?? "n/a").toUpperCase();
}

/** Derives the same dated public facts used by Market, Squad, value, and AI. */
function assessmentFor(
  player: CliPlayer,
  careerState: CliCareerState,
  valuationConfig: PlayerValuationConfig,
): PublicPlayerAssessment {
  return derivePublicPlayerAssessment({
    player,
    currentDate: careerState.gameState.calendar.currentDate,
    potentialProjectionPolicy: valuationConfig.potentialProjectionPolicy,
    ratingScale: valuationConfig.ratingScale,
  });
}
