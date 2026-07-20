import { useEffect, useState } from "react";
import { ChartNoAxesCombined, Goal, ListTree } from "lucide-react";
import type { Translator } from "@game/i18n";
import type {
  CareerMatchPreparationFormationId,
  CareerMatchPreparationView,
  CareerMatchdayPhaseView,
} from "@game/ui";

import type { TacticalBoardDraft } from "../tactics-board/tactical-board-state";
import type { TacticalBoardRoleCode } from "../tactics-board/tactical-board-types";
import type { CareerMatchdayPresentationView } from "./career-matchday-presenter";
import type {
  WebMatchdaySubstitutionDecision,
  WebMatchdayTeamControlPanel,
} from "./matchday-adapter";
import { MatchdayPhaseTabs, type MatchdayPhaseTabItem } from "./MatchdayPhaseTabs";
import { MatchdayStatistics } from "./MatchdayStatistics";
import { MatchdayTabellino } from "./MatchdayTabellino";
import { MatchdayTacticalWorkspace } from "./MatchdayTacticalWorkspace";

type LiveMatchdayTabId = "match" | "statistics" | "tactics";

/** Props for the three stable live Matchday views. */
export interface MatchdayLiveWorkspaceProps {
  readonly phaseView: CareerMatchdayPhaseView;
  readonly presentation: CareerMatchdayPresentationView;
  readonly text: Translator;
  readonly matchPreparationView?: CareerMatchPreparationView;
  readonly tacticalBoardDraft?: TacticalBoardDraft;
  readonly teamControlPanel?: WebMatchdayTeamControlPanel;
  readonly hasPendingTeamChanges?: boolean;
  readonly onSubstitution?: (decision: WebMatchdaySubstitutionDecision) => void;
  readonly onFormationChange?: (formationId: CareerMatchPreparationFormationId) => void;
  readonly onTacticProfileChange?: (tacticProfileId: string | undefined) => void;
  readonly onBoardSlotMove?: (slotKey: string, nx: number, ny: number) => void;
  readonly onBoardSlotRoleChange?: (slotKey: string, role: TacticalBoardRoleCode) => void;
  readonly onBoardSlotAdapt?: (slotKey: string, role: TacticalBoardRoleCode, nx: number, ny: number) => void;
  readonly onBoardSlotExchange?: (firstSlotKey: string, secondSlotKey: string) => void;
  readonly onDiscardPendingChanges?: () => void;
}

/** Composes Partita, Statistiche, and a read-only tactical view during play. */
export function MatchdayLiveWorkspace({
  phaseView,
  presentation,
  text,
  matchPreparationView,
  tacticalBoardDraft,
  teamControlPanel,
  hasPendingTeamChanges = false,
  onSubstitution,
  onFormationChange,
  onTacticProfileChange,
  onBoardSlotMove,
  onBoardSlotRoleChange,
  onBoardSlotAdapt,
  onBoardSlotExchange,
  onDiscardPendingChanges,
}: MatchdayLiveWorkspaceProps): React.JSX.Element {
  const [activeTabId, setActiveTabId] = useState<LiveMatchdayTabId>("match");
  const decisionRequiresTactics = phaseView.liveControl?.pendingDecision !== undefined;

  useEffect(() => {
    if (decisionRequiresTactics) setActiveTabId("tactics");
  }, [decisionRequiresTactics]);

  const tabs: readonly MatchdayPhaseTabItem<LiveMatchdayTabId>[] = [
    {
      tabId: "match",
      label: text("career.matchday.liveTab.match"),
      icon: ListTree,
      panel: (
        <div className="tls-match-live-match-panel">
          {presentation.statistics === undefined ? null : (
            <MatchdayStatistics mode="compact" text={text} view={presentation.statistics} />
          )}
          <MatchdayTabellino view={presentation.tabellino} text={text} />
        </div>
      ),
    },
    {
      tabId: "statistics",
      label: text("career.matchday.liveTab.statistics"),
      icon: ChartNoAxesCombined,
      panel: presentation.statistics === undefined ? (
        <p className="tls-matchday-empty">{text("career.matchday.statistics.unavailable")}</p>
      ) : (
        <MatchdayStatistics mode="complete" text={text} view={presentation.statistics} />
      ),
    },
    {
      tabId: "tactics",
      label: text("career.matchday.liveTab.tactics"),
      icon: Goal,
      panel: (
        matchPreparationView === undefined || tacticalBoardDraft === undefined ? (
          <p className="tls-matchday-empty">{text("career.matchday.tacticsUnavailable")}</p>
        ) : (
          <MatchdayTacticalWorkspace
            text={text}
            view={matchPreparationView}
            tacticalBoardDraft={tacticalBoardDraft}
            {...(teamControlPanel === undefined ? {} : { panel: teamControlPanel })}
            hasPendingChanges={hasPendingTeamChanges}
            {...(onSubstitution === undefined ? {} : { onSubstitution })}
            {...(onFormationChange === undefined ? {} : { onFormationChange })}
            {...(onTacticProfileChange === undefined ? {} : { onTacticProfileChange })}
            {...(onBoardSlotMove === undefined ? {} : { onBoardSlotMove })}
            {...(onBoardSlotRoleChange === undefined ? {} : { onBoardSlotRoleChange })}
            {...(onBoardSlotAdapt === undefined ? {} : { onBoardSlotAdapt })}
            {...(onBoardSlotExchange === undefined ? {} : { onBoardSlotExchange })}
            {...(onDiscardPendingChanges === undefined ? {} : { onDiscardPendingChanges })}
          />
        )
      ),
    },
  ];

  return (
    <section className="tls-match-live-workspace" aria-label={text("career.matchday.liveTabs")}>
      <MatchdayPhaseTabs
        activeTabId={activeTabId}
        ariaLabel={text("career.matchday.liveTabs")}
        tabs={tabs}
        onActiveTabChange={setActiveTabId}
      />
    </section>
  );
}
