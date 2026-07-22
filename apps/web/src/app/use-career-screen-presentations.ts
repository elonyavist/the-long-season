import type { CareerPostaFilter } from "@game/ui";
import { useMemo } from "react";

import { buildCareerDashboard } from "../features/dashboard/build-career-dashboard";
import {
  presentCareerDashboard,
  type CareerDashboardPresentation,
} from "../features/dashboard/career-dashboard-presenter";
import {
  buildCareerTacticalBoardPlayers,
  buildMatchPreparationView,
  getCareerMatchPreparationPlayerFact,
  type MatchPreparationDraft,
  type MatchPreparationPlayerFact,
} from "../features/match-preparation/match-preparation-adapter";
import {
  buildWebMatchdayTeamControlPanel,
  buildWebMatchdayPhaseView,
  buildWebMatchdayView,
  type WebMatchdayTeamControlPanel,
  type WebMatchdayState,
} from "../features/matchday/matchday-adapter";
import { presentCareerInbox } from "../features/inbox/career-inbox-presenter";
import type { CareerInboxPresentation } from "../features/inbox/career-inbox-presenter";
import {
  presentCareerSquad,
  type CareerSquadPresentation,
} from "../features/squad/career-squad-adapter";
import type {
  WebCareerContinueResult,
  WebCareerState,
} from "../runtime/web-career-runtime";

/** Current career facts required to derive every mounted screen presentation. */
export type CareerScreenPresentationInput = Readonly<{
  activeCareerState?: WebCareerState;
  continueResult?: WebCareerContinueResult;
  inboxFilter: CareerPostaFilter;
  selectedInboxMessageId?: string;
  matchPreparationState?: MatchPreparationDraft;
  matchdayState?: WebMatchdayState;
}>;

/** Current presentation contracts consumed by App's explicit screen branches. */
export type CareerScreenPresentations = Readonly<{
  dashboard?: CareerDashboardPresentation;
  inbox?: CareerInboxPresentation;
  squad?: CareerSquadPresentation;
  matchPreparation?: ReturnType<typeof buildMatchPreparationView>;
  tacticalBoardPlayers: ReturnType<typeof buildCareerTacticalBoardPlayers>;
  matchPreparationPlayerFactsById: ReadonlyMap<string, MatchPreparationPlayerFact>;
  matchday?: ReturnType<typeof buildWebMatchdayView>;
  matchdayPhase?: ReturnType<typeof buildWebMatchdayPhaseView>;
  teamControlPanel?: WebMatchdayTeamControlPanel;
}>;

/**
 * Derives current screen read models without moving runtime or routing into a hook.
 *
 * App still chooses the active screen and issues commands; this hook only keeps
 * pure presentation construction in one traceable place.
 */
export function useCareerScreenPresentations({
  activeCareerState,
  continueResult,
  inboxFilter,
  selectedInboxMessageId,
  matchPreparationState,
  matchdayState,
}: CareerScreenPresentationInput): CareerScreenPresentations {
  const dashboard = useMemo(
    () => activeCareerState === undefined
      ? undefined
      : presentCareerDashboard(buildCareerDashboard(activeCareerState), continueResult),
    [activeCareerState, continueResult],
  );
  const inbox = useMemo(
    () => activeCareerState === undefined
      ? undefined
      : presentCareerInbox({
          careerState: activeCareerState,
          activeFilter: inboxFilter,
          ...(selectedInboxMessageId === undefined ? {} : { selectedMessageId: selectedInboxMessageId }),
        }),
    [activeCareerState, inboxFilter, selectedInboxMessageId],
  );
  const matchPreparation = useMemo(
    () => activeCareerState === undefined || matchPreparationState === undefined
      ? undefined
      : buildMatchPreparationView(activeCareerState, matchPreparationState),
    [activeCareerState, matchPreparationState],
  );
  const squad = useMemo(
    () => activeCareerState === undefined || matchPreparationState === undefined
      ? undefined
      : presentCareerSquad(activeCareerState, matchPreparationState),
    [activeCareerState, matchPreparationState],
  );
  const tacticalBoardPlayers = useMemo(
    () => activeCareerState === undefined ? [] : buildCareerTacticalBoardPlayers(activeCareerState),
    [activeCareerState],
  );
  const matchPreparationPlayerFactsById = useMemo(
    () => activeCareerState === undefined
      ? new Map<string, MatchPreparationPlayerFact>()
      : new Map(tacticalBoardPlayers.flatMap((player) => {
          const fact = getCareerMatchPreparationPlayerFact(activeCareerState, player.playerId);
          return fact === undefined ? [] : [[player.playerId, fact] as const];
        })),
    [activeCareerState, tacticalBoardPlayers],
  );
  const matchday = useMemo(
    () => matchdayState === undefined ? undefined : buildWebMatchdayView(matchdayState, matchPreparationState),
    [matchPreparationState, matchdayState],
  );
  const matchdayPhase = useMemo(
    () => matchdayState === undefined ? undefined : buildWebMatchdayPhaseView(matchdayState),
    [matchdayState],
  );
  const teamControlPanel = useMemo(
    () => matchdayState === undefined ? undefined : buildWebMatchdayTeamControlPanel(matchdayState),
    [matchdayState],
  );

  return {
    ...(dashboard === undefined ? {} : { dashboard }),
    ...(inbox === undefined ? {} : { inbox }),
    ...(squad === undefined ? {} : { squad }),
    ...(matchPreparation === undefined ? {} : { matchPreparation }),
    tacticalBoardPlayers,
    matchPreparationPlayerFactsById,
    ...(matchday === undefined ? {} : { matchday }),
    ...(matchdayPhase === undefined ? {} : { matchdayPhase }),
    ...(teamControlPanel === undefined ? {} : { teamControlPanel }),
  };
}
