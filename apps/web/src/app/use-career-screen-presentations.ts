import type { CareerPostaFilter } from "@game/ui";
import {
  selectAskingPriceCurves,
  selectPlayerValuationConfig,
} from "@game/content";
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
  matchPreparationShapeReading,
  type MatchPreparationDraft,
  type MatchPreparationPlayerFact,
} from "../features/match-preparation/match-preparation-adapter";
import {
  buildWebMatchdayTeamControlPanel,
  buildWebMatchdayPhaseView,
  buildWebMatchdayView,
  liveMatchdayShapeReading,
  type WebMatchdayTeamControlPanel,
  type WebMatchdayState,
} from "../features/matchday/matchday-adapter";
import { presentCareerInbox } from "../features/inbox/career-inbox-presenter";
import type { CareerInboxPresentation } from "../features/inbox/career-inbox-presenter";
import { presentCareerMarket } from "../features/market/career-market-adapter";
import {
  presentCareerSquad,
  type CareerSquadPresentation,
} from "../features/squad/career-squad-adapter";
import type { CareerMarketViewInput } from "@game/ui";
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
  market?: CareerMarketViewInput;
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
    () => {
      if (activeCareerState === undefined || matchPreparationState === undefined) return undefined;

      // Two authorities, one read model. Before kick-off the board *is* the
      // plan, so it is what gets read. Once a match is running the engine holds
      // the eleven actually on the pitch, and it moves only when a command is
      // accepted - so a rejected change leaves the observations exactly as they
      // were, which is the truth.
      const tacticalShapeReading = matchdayState?.liveProgress === undefined
        ? matchPreparationShapeReading(activeCareerState, matchPreparationState)
        : liveMatchdayShapeReading(matchdayState);

      return buildMatchPreparationView(activeCareerState, matchPreparationState, tacticalShapeReading);
    },
    [activeCareerState, matchPreparationState, matchdayState],
  );
  const squad = useMemo(
    () => activeCareerState === undefined || matchPreparationState === undefined
      ? undefined
      : presentCareerSquad(
          activeCareerState,
          matchPreparationState,
          selectPlayerValuationConfig(activeCareerState.gameState.meta.calibrationVersions),
        ),
    [activeCareerState, matchPreparationState],
  );
  const market = useMemo(
    () => activeCareerState === undefined
      ? undefined
      : presentCareerMarket(
          activeCareerState,
          selectPlayerValuationConfig(activeCareerState.gameState.meta.calibrationVersions),
          selectAskingPriceCurves(activeCareerState.gameState.meta.calibrationVersions),
        ),
    [activeCareerState],
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
    ...(market === undefined ? {} : { market }),
    ...(squad === undefined ? {} : { squad }),
    ...(matchPreparation === undefined ? {} : { matchPreparation }),
    tacticalBoardPlayers,
    matchPreparationPlayerFactsById,
    ...(matchday === undefined ? {} : { matchday }),
    ...(matchdayPhase === undefined ? {} : { matchdayPhase }),
    ...(teamControlPanel === undefined ? {} : { teamControlPanel }),
  };
}
