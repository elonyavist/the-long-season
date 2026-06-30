import {
  continueCareerUntilAttention,
  type ContinueCareerUntilAttentionInput,
  type CareerContinueStopReason,
} from "@game/engine";
import { fromISO, toISO } from "@game/shared";
import type { CareerInboxMessageInput } from "@game/ui";

import { buildDemoCareerDashboardInput } from "./build-demo-career-dashboard";
import type { DemoDashboardMatchdayState } from "./build-demo-career-dashboard";
import type { DemoMatchPreparationState } from "../match-preparation/match-preparation-demo";
import { buildDemoSavedPreparationInput } from "../match-preparation/match-preparation-demo";

/** Presentation-safe result of pressing Continue in the deterministic demo career. */
export interface DemoCareerContinueResult {
  /** Machine-readable stop reason from the engine. */
  readonly stopReason: CareerContinueStopReason;
  /** Start date in display-ready ISO format. */
  readonly startDateIso: string;
  /** Stop date in display-ready ISO format. */
  readonly stopDateIso: string;
  /** Number of in-world days advanced before the stop. */
  readonly daysAdvanced: number;
  /** Localization key for the visible stop title. */
  readonly titleKey: string;
  /** Localization key for the visible stop summary. */
  readonly summaryKey: string;
  /** Inbox message inputs produced by this Continue attempt. */
  readonly inboxMessages: readonly CareerInboxMessageInput[];
}

/**
 * Runs the first web Continue prototype against explicit demo career facts.
 *
 * The app uses this as the replacement point for future real-save adapters. It
 * delegates the actual stop logic to `@game/engine` and keeps browser state
 * in-memory only.
 */
export function continueDemoCareer(
  preparationState?: DemoMatchPreparationState,
  matchdayState?: DemoDashboardMatchdayState,
): DemoCareerContinueResult {
  const dashboardInput = buildDemoCareerDashboardInput(
    preparationState === undefined ? undefined : buildDemoSavedPreparationInput(preparationState),
    matchdayState,
  );
  const nextFixture = dashboardInput.nextFixture;
  const currentDate = fromISO(dashboardInput.currentDateIso);
  const engineInput = {
    currentDate,
    selectedClubId: dashboardInput.selectedClub.clubId,
    ...(nextFixture === undefined
      ? {}
      : {
          nextFixture: {
            id: nextFixture.fixtureId,
            competitionId: "competition:demo-third-division",
            seasonId: dashboardInput.currentSeasonId,
            roundNumber: nextFixture.round,
            date: fromISO(nextFixture.dateIso),
            homeClubId: nextFixture.homeClub.clubId,
            awayClubId: nextFixture.awayClub.clubId,
          },
        }),
    preparation:
      dashboardInput.preparation === undefined
        ? undefined
        : {
            hasSavedLineup: dashboardInput.preparation.hasSavedLineup,
            hasSavedTactic: dashboardInput.preparation.hasSavedTactic,
            targetFixtureId: dashboardInput.preparation.targetFixtureId,
          },
  } as ContinueCareerUntilAttentionInput;
  const result = continueCareerUntilAttention(engineInput);
  const firstMessage = result.inboxMessages[0];

  return {
    stopReason: result.stopReason,
    startDateIso: toISO(result.startDate),
    stopDateIso: toISO(result.stopDate),
    daysAdvanced: result.daysAdvanced,
    titleKey: firstMessage?.titleKey ?? `career.dashboard.continueStopped.${result.stopReason}`,
    summaryKey: firstMessage?.summaryKey ?? `career.dashboard.continueStopped.${result.stopReason}`,
    inboxMessages: result.inboxMessages.map((message) => ({
      messageId: message.id,
      dateIso: toISO(message.date),
      category: message.category,
      priority: message.priority,
      status: message.status,
      titleKey: message.titleKey,
      summaryKey: message.summaryKey,
      actionRequired: message.actionRequired,
      actions: message.actionIds.map((actionId) => ({
        actionId,
        labelKey: `career.inbox.action.${actionId}`,
      })),
    })),
  };
}
