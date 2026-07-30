import type { Translator } from "@game/i18n";
import { toISO } from "@game/shared";

import { clubLabel, formatSignedNumber } from "./format.ts";
import type { CliCareerState, CliGameState, ClubId } from "./types.ts";

type CliFixtureId = CliGameState["fixtureIds"][number];

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
    case "fixture_id_collision":
      return text("career.rollover.reason.fixtureIdCollision");
    case "season_table_empty":
      return text("career.rollover.reason.seasonTableEmpty");
    case "selected_club_not_in_table":
      return text("career.rollover.reason.selectedClubNotInTable");
    case "promotion_relegation_invalid":
      return text("career.rollover.reason.promotionRelegationInvalid");
    case "finance_lifecycle_rejected":
      return text("career.rollover.reason.financeLifecycleRejected");
    default:
      return reason;
  }
}
