import type { MessageKey, Translator } from "@game/i18n";
import { buildCareerInboxView, buildCareerShellView } from "@game/ui";
import type {
  CareerDashboardBlockerKey,
  CareerDashboardFixtureSide,
} from "@game/ui";
import * as m from "motion/react-m";

import type {
  CareerDashboardPresentation,
  CareerDashboardTaskState,
} from "./career-dashboard-presenter";
import type { CareerCommandActivity } from "../../stores/career-ui-store";
import { AppShell } from "../app-shell/AppShell";
import { CommandActivityIndicator } from "../shared/CommandActivityIndicator";
import { webMotion, webMotionTargets } from "../../shared/motion/web-motion";

/** Inputs for the operational Dashboard surface. */
export type CareerDashboardScreenProps = Readonly<{
  presentation: CareerDashboardPresentation;
  commandActivity: CareerCommandActivity | undefined;
  text: Translator;
  onBackToMenu: () => void;
  onContinueCareer: () => void;
  onOpenMatchday: () => void;
  onOpenMatchPreparation: () => void;
  onInboxActionClick: (actionId: string) => void;
}>;

/** Renders one current manager decision followed by concise football context. */
export function CareerDashboardScreen({
  presentation,
  commandActivity,
  text,
  onBackToMenu,
  onContinueCareer,
  onOpenMatchday,
  onOpenMatchPreparation,
  onInboxActionClick,
}: CareerDashboardScreenProps): React.JSX.Element {
  const { view } = presentation;
  const primaryAction = dashboardPrimaryAction({
    presentation,
    onContinueCareer,
    onOpenMatchday,
    onOpenMatchPreparation,
  });
  const inboxView = buildCareerInboxView(presentation.attention?.inboxMessages ?? []);
  const shellView = buildCareerShellView({
    activeSectionKey: "dashboard",
    inboxView,
    mode: "preparation",
  });
  const commandPending = commandActivity?.status === "pending";
  const nextFixture = formatNextFixtureCompact(view.nextFixture, text);
  const recentMatch = formatRecentMatchCompact(view.recentMatch, text);
  const taskTitle = presentation.taskState === "post_match"
    ? recentMatch ?? text(taskStateLabelKey(presentation.taskState))
    : nextFixture ?? text(taskStateLabelKey(presentation.taskState));
  const taskSummary = presentation.attention === undefined
    ? text(taskStateSummaryKey(presentation.taskState))
    : text(presentation.attention.summaryKey as MessageKey);
  const taskMotionKey = buildTaskMotionKey(presentation);

  return (
    <AppShell
      shellView={shellView}
      selectedClubName={view.selectedClub.name}
      currentDateIso={view.context.currentDateIso}
      text={text}
      onBackToMenu={onBackToMenu}
      onContinueCareer={onContinueCareer}
      onInboxActionClick={onInboxActionClick}
    >
      <section
        className="tls-shell-panel tls-dashboard-panel"
        data-state={commandPending ? "pending" : "idle"}
        aria-labelledby="career-dashboard-title"
        aria-busy={commandPending}
      >
        <header className="tls-dashboard-header">
          <p className="tls-dashboard-kicker">{text("career.dashboard.commandCentre")}</p>
          <h1 className="tls-shell-title" id="career-dashboard-title">
            {text("career.shell.nav.dashboard")}
          </h1>
        </header>

        <m.section
          key={taskMotionKey}
          className="tls-dashboard-priority"
          data-motion-key={taskMotionKey}
          data-task-state={presentation.taskState}
          aria-labelledby="career-dashboard-task-title"
          initial={webMotionTargets.dashboardTaskEnter}
          animate={webMotionTargets.rest}
          transition={webMotion.transition}
        >
          <div className="tls-dashboard-task-copy">
            <p className="tls-dashboard-task-state">
              {text(taskStateLabelKey(presentation.taskState))}
            </p>
            <h2 id="career-dashboard-task-title">{taskTitle}</h2>
            <p className="tls-dashboard-task-summary">{taskSummary}</p>
            {presentation.primaryBlockers.length === 0 ? null : (
              <ul className="tls-dashboard-readiness" aria-label={text("career.dashboard.readiness") }>
                {presentation.primaryBlockers.map((blocker) => (
                  <li key={blocker}>{text(blockerTaskLabelKey(blocker))}</li>
                ))}
              </ul>
            )}
          </div>

          <button
            className="tls-menu-button tls-menu-button-primary tls-dashboard-primary-action"
            data-state={commandPending ? "pending" : "idle"}
            disabled={commandPending}
            type="button"
            onClick={primaryAction.onClick}
          >
            <CommandActivityIndicator
              activity={commandActivity}
              commandIds={["continue_career"]}
              idleLabel={text(primaryAction.labelKey)}
              text={text}
            />
          </button>
        </m.section>

        <section className="tls-dashboard-overview" aria-label={text("career.dashboard.clubSnapshot")}>
          <LeagueTableWidget leagueTable={view.leagueTable} text={text} />
          <LeagueResultsWidget leagueResults={view.leagueResults} text={text} />
        </section>
      </section>
    </AppShell>
  );
}

function dashboardPrimaryAction(input: Readonly<{
  presentation: CareerDashboardPresentation;
  onContinueCareer: () => void;
  onOpenMatchday: () => void;
  onOpenMatchPreparation: () => void;
}>): Readonly<{ labelKey: MessageKey; onClick: () => void }> {
  const fixtureDateIso = input.presentation.view.nextFixture.dateIso;
  const fixtureIsDue = fixtureDateIso !== undefined
    && fixtureDateIso <= input.presentation.view.context.currentDateIso;

  if (fixtureIsDue && input.presentation.canAdvanceNextFixture) {
    return {
      labelKey: "career.dashboard.action.go_to_matchday",
      onClick: input.onOpenMatchday,
    };
  }

  if (fixtureIsDue && input.presentation.primaryBlockers.length > 0) {
    return {
      labelKey: "career.dashboard.action.prepare_match",
      onClick: input.onOpenMatchPreparation,
    };
  }

  return {
    labelKey: "career.dashboard.continue",
    onClick: input.onContinueCareer,
  };
}

/** Renders a five-row table window around the manager's club. */
function LeagueTableWidget({
  leagueTable,
  text,
}: Readonly<{
  leagueTable: CareerDashboardPresentation["view"]["leagueTable"];
  text: Translator;
}>): React.JSX.Element {
  const motionKey = buildLeagueTableMotionKey(leagueTable);

  return (
    <m.section
      key={motionKey}
      className="tls-dashboard-widget tls-dashboard-table-widget"
      data-motion-key={motionKey}
      aria-labelledby="dashboard-table-title"
      initial={webMotionTargets.footballContextEnter}
      animate={webMotionTargets.rest}
      transition={webMotion.transition}
    >
      <header className="tls-dashboard-widget-header">
        <div>
          <p>{text("career.dashboard.competition")}</p>
          <h2 id="dashboard-table-title">{text("career.dashboard.leagueTable")}</h2>
        </div>
        {leagueTable.selectedClubPosition === undefined ? null : (
          <strong>{text("career.dashboard.positionValue", { position: leagueTable.selectedClubPosition })}</strong>
        )}
      </header>

      {leagueTable.status === "unstarted" ? (
        <DashboardEmptyState>{text("career.dashboard.leagueTable.unstarted")}</DashboardEmptyState>
      ) : (
        <div className="tls-dashboard-table-frame">
          <table className="tls-dashboard-table">
            <thead>
              <tr>
                <th scope="col">{text("career.dashboard.column.position")}</th>
                <th scope="col">{text("career.dashboard.column.club")}</th>
                <th scope="col">{text("career.dashboard.column.played")}</th>
                <th className="tls-dashboard-table-secondary" scope="col">
                  {text("career.dashboard.column.goalDifference")}
                </th>
                <th scope="col">{text("career.dashboard.column.points")}</th>
              </tr>
            </thead>
            <tbody>
              {leagueTable.rows.map((row) => (
                <tr key={row.clubId} data-selected={row.isSelectedClub ? "true" : "false"}>
                  <td>{row.position}</td>
                  <th scope="row">
                    {row.clubName}
                    {row.isSelectedClub ? (
                      <span className="tls-visually-hidden"> {text("career.dashboard.selectedClubRow")}</span>
                    ) : null}
                  </th>
                  <td>{row.played}</td>
                  <td className="tls-dashboard-table-secondary">{formatSignedNumber(row.goalDifference)}</td>
                  <td><strong>{row.points}</strong></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </m.section>
  );
}

/** Shows every completed fixture from the newest played league round. */
function LeagueResultsWidget({
  leagueResults,
  text,
}: Readonly<{
  leagueResults: CareerDashboardPresentation["view"]["leagueResults"];
  text: Translator;
}>): React.JSX.Element {
  const motionKey = buildLeagueResultsMotionKey(leagueResults);

  return (
    <m.section
      key={motionKey}
      className="tls-dashboard-widget tls-dashboard-league-results-widget"
      data-motion-key={motionKey}
      aria-labelledby="dashboard-results-title"
      initial={webMotionTargets.footballContextEnter}
      animate={webMotionTargets.rest}
      transition={webMotion.transition}
    >
      <header className="tls-dashboard-widget-header">
        <div>
          <p>{text("career.dashboard.competition")}</p>
          <h2 id="dashboard-results-title">{text("career.dashboard.leagueResults")}</h2>
        </div>
        {leagueResults.round === undefined ? null : (
          <strong>{text("career.dashboard.roundValue", { round: leagueResults.round })}</strong>
        )}
      </header>

      {leagueResults.status === "none" ? (
        <DashboardEmptyState>{text("career.dashboard.leagueResults.none")}</DashboardEmptyState>
      ) : (
        <ul className="tls-dashboard-league-results-list">
          {leagueResults.results.map((result) => (
            <li key={result.fixtureId} data-selected={result.isSelectedClubFixture ? "true" : "false"}>
              <span className="tls-dashboard-league-result-club">{result.homeClubName}</span>
              <strong className="tls-dashboard-league-result-score">
                {result.homeGoals}-{result.awayGoals}
              </strong>
              <span className="tls-dashboard-league-result-club">{result.awayClubName}</span>
              {result.isSelectedClubFixture ? (
                <span className="tls-visually-hidden"> {text("career.dashboard.selectedClubFixture")}</span>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </m.section>
  );
}

/** Builds a remount key only when the manager's visible priority changes. */
function buildTaskMotionKey(presentation: CareerDashboardPresentation): string {
  const fixture = presentation.view.nextFixture;
  const recentMatch = presentation.view.recentMatch;
  const visibleFact = presentation.taskState === "post_match"
    ? [
        recentMatch.status,
        recentMatch.homeClubName,
        recentMatch.homeGoals,
        recentMatch.awayGoals,
        recentMatch.awayClubName,
      ].join(":")
    : [
        fixture.status,
        fixture.round,
        fixture.homeClubName,
        fixture.awayClubName,
        fixture.selectedClubSide,
      ].join(":");

  return [
    presentation.taskState,
    visibleFact,
    ...presentation.primaryBlockers,
  ].join(":");
}

/** Builds a stable key from the league facts rendered by the table widget. */
function buildLeagueTableMotionKey(
  leagueTable: CareerDashboardPresentation["view"]["leagueTable"],
): string {
  const rows = leagueTable.rows
    .map((row) => `${row.clubId}:${row.position}:${row.played}:${row.goalDifference}:${row.points}`)
    .join("|");
  return `table:${leagueTable.status}:${leagueTable.selectedClubPosition ?? "-"}:${rows}`;
}

/** Builds a stable key from the completed-round facts shown in the widget. */
function buildLeagueResultsMotionKey(
  leagueResults: CareerDashboardPresentation["view"]["leagueResults"],
): string {
  const results = leagueResults.results
    .map((result) => `${result.fixtureId}:${result.homeGoals}:${result.awayGoals}`)
    .join("|");
  return `results:${leagueResults.status}:${leagueResults.round ?? "-"}:${results}`;
}

function DashboardEmptyState({ children }: Readonly<{ children: React.ReactNode }>): React.JSX.Element {
  return <p className="tls-dashboard-empty-state">{children}</p>;
}

function formatNextFixtureCompact(
  fixture: CareerDashboardPresentation["view"]["nextFixture"],
  text: Translator,
): string | undefined {
  if (fixture.status !== "available") return undefined;

  return text("career.dashboard.nextFixtureCompactLine", {
    round: fixture.round ?? "",
    home: fixture.homeClubName ?? "",
    away: fixture.awayClubName ?? "",
    side: text(fixtureSideLabelKey(fixture.selectedClubSide)),
  });
}

function formatRecentMatchCompact(
  recentMatch: CareerDashboardPresentation["view"]["recentMatch"],
  text: Translator,
): string | undefined {
  if (recentMatch.status !== "available") return undefined;

  return text("career.dashboard.recentMatchCompactLine", {
    home: recentMatch.homeClubName ?? "",
    homeGoals: recentMatch.homeGoals ?? "",
    awayGoals: recentMatch.awayGoals ?? "",
    away: recentMatch.awayClubName ?? "",
  });
}

function taskStateLabelKey(state: CareerDashboardTaskState): MessageKey {
  return `career.dashboard.task.${state}`;
}

function taskStateSummaryKey(state: CareerDashboardTaskState): MessageKey {
  return `career.dashboard.task.${state}.summary`;
}

function fixtureSideLabelKey(side: CareerDashboardFixtureSide | undefined): MessageKey {
  return `career.dashboard.fixtureSide.${side ?? "unknown"}`;
}

function blockerTaskLabelKey(blocker: CareerDashboardBlockerKey): MessageKey {
  return `career.dashboard.readiness.${blocker}`;
}

function formatSignedNumber(value: number): string {
  return value > 0 ? `+${value}` : String(value);
}
