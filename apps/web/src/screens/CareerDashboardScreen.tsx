import type { MessageKey, Translator } from "@game/i18n";
import { buildCareerInboxView, buildCareerShellView } from "@game/ui";
import type {
  CareerDashboardActionAvailabilityStatus,
  CareerDashboardAvailabilityStatus,
  CareerDashboardBlockerKey,
  CareerDashboardFixtureSide,
} from "@game/ui";

import type { CareerDashboardPresentation } from "../career/career-dashboard-presenter";
import type { DemoCareerContinueResult } from "../career/continue-demo-career";
import { CareerShell } from "../components/CareerShell";

/** Props for the first read-only web career dashboard screen. */
export type CareerDashboardScreenProps = Readonly<{
  presentation: CareerDashboardPresentation;
  continueResult?: DemoCareerContinueResult;
  text: Translator;
  onBackToMenu: () => void;
  onContinueCareer: () => void;
  onOpenMatchPreparation: () => void;
  onInboxActionClick: (actionId: string) => void;
}>;

/** Renders the first career dashboard/matchday hub prototype. */
export function CareerDashboardScreen({
  presentation,
  continueResult,
  text,
  onBackToMenu,
  onContinueCareer,
  onOpenMatchPreparation,
  onInboxActionClick,
}: CareerDashboardScreenProps): React.JSX.Element {
  const { view } = presentation;
  const inboxView = buildCareerInboxView(continueResult?.inboxMessages ?? []);
  const shellView = buildCareerShellView({
    activeSectionKey: "dashboard",
    inboxView,
  });

  return (
    <CareerShell
      shellView={shellView}
      selectedClubName={view.selectedClub.name}
      text={text}
      onBackToMenu={onBackToMenu}
      onContinueCareer={onContinueCareer}
      onInboxActionClick={onInboxActionClick}
    >
      <section className="tls-shell-panel tls-dashboard-panel" aria-labelledby="career-dashboard-title">
        <header className="tls-dashboard-header">
          <div>
            <h1 className="tls-shell-title" id="career-dashboard-title">{text("career.dashboard.title")}</h1>
            <p className="tls-shell-status">{view.selectedClub.name}</p>
          </div>
        </header>

        <section className="tls-dashboard-strip" aria-label={text("career.save")}>
          <DashboardFact label={text("career.save")} value={view.context.saveId} />
          <DashboardFact label={text("career.worldSeed")} value={view.context.worldSeed ?? text("common.unknown")} />
          <DashboardFact label={text("career.currentDate")} value={view.context.currentDateIso} />
          <DashboardFact label={text("career.currentSeason")} value={view.context.currentSeasonId} />
        </section>

        <section className="tls-dashboard-attention" aria-label={text("career.dashboard.blockers")}>
          <h2>{text("career.dashboard.blockers")}</h2>
          {presentation.primaryBlockers.length === 0 ? (
            <p>{text("career.matchPreparation.noBlockers")}</p>
          ) : (
            <ul>
              {presentation.primaryBlockers.map((blocker) => (
                <li key={blocker}>{text(blockerLabelKey(blocker))}</li>
              ))}
            </ul>
          )}
        </section>

        <div className="tls-dashboard-grid">
          <DashboardCard title={text("career.dashboard.selectedClub")}>
            <DashboardFact label={text("setup.selectedClub")} value={view.selectedClub.name} />
            <DashboardFact label={text("career.selectedClubRosterSize")} value={String(view.selectedClub.rosterSize)} />
          </DashboardCard>

          <DashboardCard title={text("career.nextSelectedClubFixture")}>
            <p className="tls-dashboard-line">{formatNextFixture(view.nextFixture, text)}</p>
          </DashboardCard>

          <DashboardCard title={text("career.matchPreparation")}>
            <DashboardFact
              label={text("career.matchPreparation.savedLineup")}
              value={text(statusLabelKey(view.preparation.lineupStatus))}
            />
            <DashboardFact
              label={text("career.matchPreparation.savedTactic")}
              value={text(statusLabelKey(view.preparation.tacticStatus))}
            />
          </DashboardCard>

          <DashboardCard title={text("career.dashboard.conditionSummary")}>
            <DashboardFact
              label={text("career.dashboard.conditionPlayerCount")}
              value={String(view.conditionSummary.playerCount)}
            />
            <p className="tls-dashboard-line">
              {text("career.dashboard.conditionFitnessLine", {
                average: view.conditionSummary.averageFitness.toFixed(2),
                minimum: view.conditionSummary.lowestFitness,
                low: view.conditionSummary.lowFitnessPlayerCount,
              })}
            </p>
          </DashboardCard>

          <DashboardCard title={text("career.dashboard.tableContext")}>
            <p className="tls-dashboard-line">{formatTableContext(view.tableContext, text)}</p>
          </DashboardCard>

          <DashboardCard title={text("career.dashboard.recentMatch")}>
            <p className="tls-dashboard-line">{formatRecentMatch(view.recentMatch, text)}</p>
          </DashboardCard>
        </div>

        <section className="tls-dashboard-actions" aria-label={text("career.dashboard.actions")}>
          <h2>{text("career.dashboard.actions")}</h2>
          <div className="tls-dashboard-action-list">
            {presentation.actions.map((action) => (
              <button
                className="tls-dashboard-action"
                disabled={action.status !== "available"}
                key={action.actionId}
                onClick={action.actionId === "prepare_match" ? onOpenMatchPreparation : undefined}
                type="button"
              >
                <span>{text(action.labelKey as MessageKey)}</span>
                <small>{text(actionStatusLabelKey(action.status))}</small>
              </button>
            ))}
          </div>
        </section>

        {continueResult === undefined ? null : (
          <section className="tls-dashboard-continue-result" aria-label={text("career.dashboard.attentionStop")}>
            <h2>{text("career.dashboard.attentionStop")}</h2>
            <p className="tls-dashboard-line tls-dashboard-stop-title">
              {text(continueResult.titleKey as MessageKey)}
            </p>
            <p className="tls-dashboard-line">
              {text(continueResult.summaryKey as MessageKey)}
            </p>
            <DashboardFact
              label={text("career.dashboard.daysAdvanced")}
              value={String(continueResult.daysAdvanced)}
            />
            <DashboardFact
              label={text("career.dashboard.stopDate")}
              value={continueResult.stopDateIso}
            />
          </section>
        )}

      </section>
    </CareerShell>
  );
}

function DashboardCard({
  title,
  children,
}: Readonly<{ title: string; children: React.ReactNode }>): React.JSX.Element {
  return (
    <section className="tls-dashboard-card">
      <h2>{title}</h2>
      {children}
    </section>
  );
}

function DashboardFact({ label, value }: Readonly<{ label: string; value: string }>): React.JSX.Element {
  return (
    <div className="tls-dashboard-fact">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function formatNextFixture(
  fixture: CareerDashboardPresentation["view"]["nextFixture"],
  text: Translator,
): string {
  if (fixture.status !== "available") {
    return text("career.noNextSelectedClubFixture");
  }

  return text("career.dashboard.nextFixtureLine", {
    fixture: fixture.fixtureId ?? "",
    date: fixture.dateIso ?? "",
    round: fixture.round ?? "",
    home: fixture.homeClubName ?? "",
    away: fixture.awayClubName ?? "",
    side: text(fixtureSideLabelKey(fixture.selectedClubSide ?? "unknown")),
  });
}

function formatTableContext(
  table: CareerDashboardPresentation["view"]["tableContext"],
  text: Translator,
): string {
  if (table.status !== "available") {
    return text(statusLabelKey(table.status));
  }

  return text("career.dashboard.tableLine", {
    position: table.position ?? "",
    played: table.played ?? "",
    points: table.points ?? "",
    goalDifference: table.goalDifference ?? "",
  });
}

function formatRecentMatch(
  recentMatch: CareerDashboardPresentation["view"]["recentMatch"],
  text: Translator,
): string {
  if (recentMatch.status !== "available") {
    return text("common.none");
  }

  return text("career.dashboard.recentMatchLine", {
    fixture: recentMatch.fixtureId ?? "",
    home: recentMatch.homeClubName ?? "",
    homeGoals: recentMatch.homeGoals ?? "",
    awayGoals: recentMatch.awayGoals ?? "",
    away: recentMatch.awayClubName ?? "",
  });
}

function statusLabelKey(status: CareerDashboardAvailabilityStatus): MessageKey {
  return `career.dashboard.status.${status}`;
}

function fixtureSideLabelKey(side: CareerDashboardFixtureSide | "unknown"): MessageKey {
  return `career.dashboard.fixtureSide.${side}`;
}

function actionStatusLabelKey(status: CareerDashboardActionAvailabilityStatus): MessageKey {
  return `career.dashboard.actionStatus.${status}`;
}

function blockerLabelKey(blocker: CareerDashboardBlockerKey): MessageKey {
  return `career.dashboard.blocker.${blocker}`;
}
