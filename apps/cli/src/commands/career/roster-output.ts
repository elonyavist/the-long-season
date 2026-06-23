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
