import { createFakeLeagueSystem } from "@game/content";
import { computeLeagueTable } from "@game/engine";
import type { MessageKey, Translator } from "@game/i18n";
import { toISO } from "@game/shared";
import {
  buildCareerDashboardView,
  type CareerDashboardActionAvailability,
  type CareerDashboardBlockerKey,
  type CareerDashboardFixtureInput,
  type CareerDashboardRecentMatchInput,
  type CareerDashboardTableRowInput,
  type CareerDashboardView,
} from "@game/ui";

import { clubLabel, findNextSelectedClubFixture } from "./format.ts";
import type { CliCareerState, CliGameState } from "./types.ts";

type CliFixtureId = CliGameState["fixtureIds"][number];
type CliFixture = CliGameState["fixtures"][CliFixtureId];

/** Input for the read-only career dashboard smoke output. */
export interface FormatCareerDashboardOutputInput {
  /** Loaded career save to inspect without mutation. */
  readonly careerState: CliCareerState;
  /** Directory used by the storage adapter, shown for operator clarity. */
  readonly saveDirectoryPath: string;
  /** Localized label resolver owned by the command adapter. */
  readonly text: Translator;
}

/**
 * Formats a compact career dashboard smoke output from the shared UI view.
 *
 * The CLI performs only save adaptation and text rendering here. Dashboard
 * readiness, action blockers, and first-screen fields stay centralized in the
 * `@game/ui` builder so the future web UI can consume the same contract.
 */
export function formatCareerDashboardOutput(input: FormatCareerDashboardOutputInput): readonly string[] {
  const view = buildCareerDashboardViewFromCareerState(input.careerState);

  return [
    input.text("career.dashboard.title"),
    `${input.text("career.save")}: ${view.context.saveId}`,
    `${input.text("career.saveDirectory")}: ${input.saveDirectoryPath}`,
    ...formatOptionalContextLines(view, input.text),
    `${input.text("career.currentDate")}: ${view.context.currentDateIso}`,
    `${input.text("career.currentSeason")}: ${view.context.currentSeasonId}`,
    `${input.text("career.dashboard.selectedClub")}: ${view.selectedClub.name}`,
    `${input.text("career.selectedClubRosterSize")}: ${view.selectedClub.rosterSize}`,
    `${input.text("career.nextSelectedClubFixture")}:`,
    ...formatNextFixtureLines(view, input.text),
    `${input.text("career.matchPreparation")}:`,
    ...formatPreparationLines(view, input.text),
    `${input.text("career.dashboard.conditionSummary")}:`,
    ...formatConditionSummaryLines(view, input.text),
    `${input.text("career.dashboard.tableContext")}:`,
    ...formatTableContextLines(view, input.text),
    `${input.text("career.dashboard.recentMatch")}:`,
    ...formatRecentMatchLines(view, input.text),
    `${input.text("career.dashboard.actions")}:`,
    ...formatActionLines(view.actions, input.text),
    `${input.text("career.dashboard.blockers")}:`,
    ...formatBlockerLines(view.alertKeys, input.text),
  ];
}

/** Builds the shared career dashboard view from the current CLI save shape. */
export function buildCareerDashboardViewFromCareerState(careerState: CliCareerState): CareerDashboardView {
  const selectedClub = careerState.gameState.clubs[careerState.selectedClubId];
  const nextFixture = findNextSelectedClubFixture(careerState);

  return buildCareerDashboardView({
    saveId: careerState.saveId,
    ...(careerState.careerWorld?.worldSeed === undefined ? {} : { worldSeed: careerState.careerWorld.worldSeed }),
    ...(careerState.careerWorld?.generatorVersion === undefined
      ? {}
      : { generatorVersion: careerState.careerWorld.generatorVersion }),
    currentDateIso: toISO(careerState.gameState.calendar.currentDate),
    currentSeasonId: careerState.gameState.calendar.currentSeasonId,
    selectedClub: {
      clubId: careerState.selectedClubId,
      name: clubLabel(careerState.selectedClubId, careerState.gameState),
      rosterSize: selectedClub?.playerIds.length ?? 0,
    },
    ...optionalField("nextFixture", toDashboardFixture(careerState, nextFixture)),
    ...(careerState.matchPreparation === undefined
      ? {}
      : {
          preparation: {
            hasSavedLineup: careerState.matchPreparation.selectedLineup !== undefined,
            hasSavedTactic: careerState.matchPreparation.tactic !== undefined,
            ...(careerState.matchPreparation.targetFixtureId === undefined
              ? {}
              : { targetFixtureId: careerState.matchPreparation.targetFixtureId }),
          },
        }),
    playerConditions: selectedClub?.playerIds.map((playerId) => ({
      playerId,
      fitness: careerState.gameState.playerStates[playerId]?.fitness ?? 100,
    })) ?? [],
    ...optionalField("tableRow", buildSelectedClubTableRow(careerState)),
    ...optionalField("recentMatch", buildRecentSelectedClubMatch(careerState)),
  });
}

/** Creates an optional object property without passing explicit `undefined`. */
function optionalField<Key extends string, Value>(key: Key, value: Value | undefined): Record<Key, Value> | Record<string, never> {
  return value === undefined ? {} : { [key]: value } as Record<Key, Value>;
}

/** Formats optional world metadata lines from the dashboard context. */
function formatOptionalContextLines(view: CareerDashboardView, text: Translator): readonly string[] {
  return [
    ...(view.context.worldSeed === undefined ? [] : [`${text("career.worldSeed")}: ${view.context.worldSeed}`]),
    ...(view.context.generatorVersion === undefined
      ? []
      : [`${text("career.generatorVersion")}: ${view.context.generatorVersion}`]),
  ];
}

/** Formats the next selected-club fixture section. */
function formatNextFixtureLines(view: CareerDashboardView, text: Translator): readonly string[] {
  if (view.nextFixture.status === "none") {
    return [`  ${text("career.noNextSelectedClubFixture")}`];
  }

  return [
    `  ${text("career.dashboard.nextFixtureLine", {
      fixture: view.nextFixture.fixtureId ?? "",
      date: view.nextFixture.dateIso ?? "",
      round: view.nextFixture.round ?? 0,
      home: view.nextFixture.homeClubName ?? "",
      away: view.nextFixture.awayClubName ?? "",
      side: formatFixtureSide(view.nextFixture.selectedClubSide, text),
    })}`,
  ];
}

/** Formats saved lineup/tactic readiness lines. */
function formatPreparationLines(view: CareerDashboardView, text: Translator): readonly string[] {
  return [
    `  ${text("career.matchPreparation.savedLineup")}: ${formatDashboardStatus(view.preparation.lineupStatus, text)}`,
    `  ${text("career.matchPreparation.savedTactic")}: ${formatDashboardStatus(view.preparation.tacticStatus, text)}`,
    ...(view.preparation.targetFixtureId === undefined
      ? []
      : [`  ${text("career.matchPreparation.targetFixture")}: ${view.preparation.targetFixtureId}`]),
  ];
}

/** Formats compact selected-club condition facts. */
function formatConditionSummaryLines(view: CareerDashboardView, text: Translator): readonly string[] {
  return [
    `  ${text("career.dashboard.conditionPlayerCount")}: ${view.conditionSummary.playerCount}`,
    `  ${text("career.dashboard.conditionFitnessLine", {
      average: view.conditionSummary.averageFitness.toFixed(2),
      minimum: view.conditionSummary.lowestFitness,
      low: view.conditionSummary.lowFitnessPlayerCount,
    })}`,
  ];
}

/** Formats compact selected-club table context when it is meaningful. */
function formatTableContextLines(view: CareerDashboardView, text: Translator): readonly string[] {
  if (view.tableContext.status !== "available") {
    return [`  ${formatDashboardStatus(view.tableContext.status, text)}`];
  }

  return [
    `  ${text("career.dashboard.tableLine", {
      position: view.tableContext.position ?? 0,
      played: view.tableContext.played ?? 0,
      points: view.tableContext.points ?? 0,
      goalDifference: formatSignedNumber(view.tableContext.goalDifference ?? 0),
    })}`,
  ];
}

/** Formats the latest selected-club played match section. */
function formatRecentMatchLines(view: CareerDashboardView, text: Translator): readonly string[] {
  if (view.recentMatch.status === "none") {
    return [`  ${text("common.none")}`];
  }

  return [
    `  ${text("career.dashboard.recentMatchLine", {
      fixture: view.recentMatch.fixtureId ?? "",
      home: view.recentMatch.homeClubName ?? "",
      away: view.recentMatch.awayClubName ?? "",
      homeGoals: view.recentMatch.homeGoals ?? 0,
      awayGoals: view.recentMatch.awayGoals ?? 0,
    })}`,
  ];
}

/** Formats dashboard action availability rows. */
function formatActionLines(actions: readonly CareerDashboardActionAvailability[], text: Translator): readonly string[] {
  return actions.map((action) => {
    const status = text(presentationLabelKey("career.dashboard.actionStatus", action.status));
    const blockers = action.blockerKeys.map((key) => formatBlockerKey(key, text)).join(", ");

    if (blockers.length === 0) {
      return `  ${text(action.labelKey as MessageKey)}: ${status}`;
    }

    return `  ${text(action.labelKey as MessageKey)}: ${status} (${text("career.dashboard.blockedBy", { blockers })})`;
  });
}

/** Formats dashboard blockers as localized bullet rows. */
function formatBlockerLines(blockerKeys: readonly CareerDashboardBlockerKey[], text: Translator): readonly string[] {
  if (blockerKeys.length === 0) {
    return [`  ${text("common.none")}`];
  }

  return blockerKeys.map((key) => `  ${formatBlockerKey(key, text)}`);
}

/** Converts a saved fixture into the UI builder's fixture input. */
function toDashboardFixture(
  careerState: CliCareerState,
  fixture: CliFixture | undefined,
): CareerDashboardFixtureInput | undefined {
  if (fixture === undefined) {
    return undefined;
  }

  return {
    fixtureId: fixture.id,
    dateIso: toISO(fixture.date),
    round: fixture.roundNumber,
    homeClub: {
      clubId: fixture.homeClubId,
      name: clubLabel(fixture.homeClubId, careerState.gameState),
    },
    awayClub: {
      clubId: fixture.awayClubId,
      name: clubLabel(fixture.awayClubId, careerState.gameState),
    },
    selectedClubSide: fixture.homeClubId === careerState.selectedClubId ? "home" : "away",
  };
}

/** Builds a selected-club table row only after the club has played. */
function buildSelectedClubTableRow(careerState: CliCareerState): CareerDashboardTableRowInput | undefined {
  const league = createFakeLeagueSystem(
    careerState.careerWorld?.worldSeed === undefined ? {} : { worldSeed: careerState.careerWorld.worldSeed },
  );
  const table = computeLeagueTable({
    clubIds: careerState.gameState.clubIds,
    fixtures: careerState.gameState.fixtures,
    fixtureIds: careerState.gameState.fixtureIds,
    rules: league.tableRules,
  });
  const row = table.find((tableRow) => tableRow.clubId === careerState.selectedClubId);

  if (row === undefined || row.played === 0) {
    return undefined;
  }

  return {
    position: row.position,
    played: row.played,
    points: row.points,
    goalDifference: row.goalDifference,
  };
}

/** Finds the latest played selected-club fixture in saved fixture order. */
function buildRecentSelectedClubMatch(careerState: CliCareerState): CareerDashboardRecentMatchInput | undefined {
  for (let index = careerState.gameState.fixtureIds.length - 1; index >= 0; index -= 1) {
    const fixtureId = careerState.gameState.fixtureIds[index];
    const fixture = fixtureId === undefined ? undefined : careerState.gameState.fixtures[fixtureId];

    if (
      fixture === undefined ||
      fixture.result?.played !== true ||
      (fixture.homeClubId !== careerState.selectedClubId && fixture.awayClubId !== careerState.selectedClubId)
    ) {
      continue;
    }

    return {
      fixtureId: fixture.id,
      homeClub: {
        clubId: fixture.homeClubId,
        name: clubLabel(fixture.homeClubId, careerState.gameState),
      },
      awayClub: {
        clubId: fixture.awayClubId,
        name: clubLabel(fixture.awayClubId, careerState.gameState),
      },
      homeGoals: fixture.result.homeGoals,
      awayGoals: fixture.result.awayGoals,
    };
  }

  return undefined;
}

/** Localizes a generic dashboard availability status. */
function formatDashboardStatus(status: string, text: Translator): string {
  return text(presentationLabelKey("career.dashboard.status", status));
}

/** Localizes the selected club's home/away side marker. */
function formatFixtureSide(side: string | undefined, text: Translator): string {
  return text(presentationLabelKey("career.dashboard.fixtureSide", side ?? "unknown"));
}

/** Localizes one dashboard blocker machine key. */
function formatBlockerKey(blockerKey: CareerDashboardBlockerKey, text: Translator): string {
  return text(presentationLabelKey("career.dashboard.blocker", blockerKey));
}

/** Builds a typed i18n key for dashboard presentation labels. */
function presentationLabelKey(prefix: string, value: string): MessageKey {
  return `${prefix}.${value}` as MessageKey;
}

/** Formats signed table goal difference values with an explicit plus sign. */
function formatSignedNumber(value: number): string {
  return value >= 0 ? `+${value}` : String(value);
}
