import type { MessageKey, Translator } from "@game/i18n";
import { buildCareerInboxView, buildCareerShellView } from "@game/ui";
import type {
  CareerDashboardAvailabilityStatus,
  CareerDashboardBlockerKey,
  CareerDashboardFixtureSide,
} from "@game/ui";

import type { CareerDashboardPresentation } from "./career-dashboard-presenter";
import type { DemoCareerContinueResult } from "./continue-demo-career";
import { AppShell } from "../app-shell/AppShell";

/** Props for the first read-only web career dashboard screen. */
export type CareerDashboardScreenProps = Readonly<{
  presentation: CareerDashboardPresentation;
  continueResult?: DemoCareerContinueResult;
  text: Translator;
  onBackToMenu: () => void;
  onContinueCareer: () => void;
  onOpenMatchday: () => void;
  onOpenMatchPreparation: () => void;
  onInboxActionClick: (actionId: string) => void;
}>;

/** Renders the career command centre with one clear next action. */
export function CareerDashboardScreen({
  presentation,
  continueResult,
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
  const inboxView = buildCareerInboxView(continueResult?.inboxMessages ?? []);
  const shellView = buildCareerShellView({
    activeSectionKey: "dashboard",
    inboxView,
    mode: "preparation",
  });

  return (
    <AppShell
      shellView={shellView}
      selectedClubName={view.selectedClub.name}
      contextItems={[
        { label: text("career.currentDate"), value: view.context.currentDateIso },
        { label: text("career.currentSeason"), value: view.context.currentSeasonId },
      ]}
      text={text}
      onBackToMenu={onBackToMenu}
      onContinueCareer={onContinueCareer}
      onInboxActionClick={onInboxActionClick}
    >
      <section className="tls-shell-panel tls-dashboard-panel" aria-labelledby="career-dashboard-title">
        <header className="tls-dashboard-header">
          <div className="tls-dashboard-heading">
            <p className="tls-dashboard-kicker">{text("career.dashboard.commandCentre")}</p>
            <h1 className="tls-shell-title" id="career-dashboard-title">{text("career.shell.nav.dashboard")}</h1>
            <p className="tls-shell-status">{view.selectedClub.name}</p>
          </div>
          <button
            className="tls-menu-button tls-menu-button-primary tls-dashboard-primary-action"
            type="button"
            onClick={primaryAction.onClick}
          >
            {text(primaryAction.labelKey)}
          </button>
        </header>

        <section className="tls-dashboard-command-deck" aria-label={text("career.dashboard.commandCentre")}>
          <section className="tls-dashboard-match-desk" aria-label={text("career.nextSelectedClubFixture")}>
            <div>
              <h2>{text("career.nextSelectedClubFixture")}</h2>
              <p className="tls-dashboard-line tls-dashboard-next-fixture">
                {formatNextFixtureCompact(view.nextFixture, text)}
              </p>
            </div>
            <div className="tls-dashboard-preparation-strip">
              <DashboardFact
                label={text("career.matchPreparation.savedLineup")}
                value={text(statusLabelKey(view.preparation.lineupStatus))}
              />
              <DashboardFact
                label={text("career.matchPreparation.savedTactic")}
                value={text(statusLabelKey(view.preparation.tacticStatus))}
              />
            </div>
          </section>

          <section
            className="tls-dashboard-attention"
            data-has-blockers={presentation.primaryBlockers.length > 0}
            aria-label={text("career.dashboard.blockers")}
          >
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
        </section>

        <section className="tls-dashboard-signal-grid" aria-label={text("career.dashboard.clubSnapshot")}>
          <DashboardSignal
            title={text("career.dashboard.conditionSummary")}
            value={`${Math.round(view.conditionSummary.averageFitness)}%`}
          >
            <span>
              {text("career.dashboard.conditionFitnessLine", {
                average: view.conditionSummary.averageFitness.toFixed(0),
                minimum: view.conditionSummary.lowestFitness,
                low: view.conditionSummary.lowFitnessPlayerCount,
              })}
            </span>
          </DashboardSignal>

          <DashboardSignal
            title={text("career.dashboard.selectedClub")}
            value={String(view.selectedClub.rosterSize)}
          >
            <span>{text("career.selectedClubRosterSize")}</span>
          </DashboardSignal>

          <DashboardSignal title={text("career.dashboard.tableContext")} value={formatTableContext(view.tableContext, text)} />

          <DashboardSignal title={text("career.dashboard.recentMatch")} value={formatRecentMatch(view.recentMatch, text)} />
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
    </AppShell>
  );
}

function dashboardPrimaryAction(input: Readonly<{
  presentation: CareerDashboardPresentation;
  onContinueCareer: () => void;
  onOpenMatchday: () => void;
  onOpenMatchPreparation: () => void;
}>): Readonly<{ labelKey: MessageKey; onClick: () => void }> {
  if (input.presentation.canAdvanceNextFixture) {
    return {
      labelKey: "career.dashboard.action.go_to_matchday",
      onClick: input.onOpenMatchday,
    };
  }

  if (input.presentation.view.preparation.blockerKeys.length > 0) {
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

function DashboardSignal({
  title,
  value,
  children,
}: Readonly<{ title: string; value: string; children?: React.ReactNode }>): React.JSX.Element {
  return (
    <section className="tls-dashboard-signal-card">
      <h2>{title}</h2>
      <strong>{value}</strong>
      {children === undefined ? null : <p>{children}</p>}
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

function formatNextFixtureCompact(
  fixture: CareerDashboardPresentation["view"]["nextFixture"],
  text: Translator,
): string {
  if (fixture.status !== "available") {
    return text("career.noNextSelectedClubFixture");
  }

  return text("career.dashboard.nextFixtureCompactLine", {
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

function blockerLabelKey(blocker: CareerDashboardBlockerKey): MessageKey {
  return `career.dashboard.blocker.${blocker}`;
}
