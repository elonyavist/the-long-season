import { getGeneratedPlayerArchetype, type FakeLeagueSystem } from "@game/content";
import type { Translator } from "@game/i18n";
import { toISO } from "@game/shared";

import {
  clubLabel,
  countPlayedSelectedClubFixtures,
  findClubTransferBudget,
  findNextSelectedClubFixture,
  formatAffectedClubLines,
  formatCareerWorldMetadataLines,
  formatMoney,
  formatNextSelectedClubFixtureLines,
  presentationMessageKey,
  formatTransferHistoryLines,
} from "./format.ts";
import { formatCareerMatchPreparationLines } from "./preparation-output.ts";
import { CLI_CAREER_WORLD_GENERATOR_VERSION } from "./scenarios.ts";
import type { CliCareerState } from "./types.ts";

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
