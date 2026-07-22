import { toISO } from "@game/shared";
import {
  buildCareerInboxView,
  buildCareerPostaView,
  type CareerInboxMessageInput,
  type CareerInboxView,
  type CareerPostaFilter,
  type CareerPostaMessageInput,
  type CareerPostaView,
} from "@game/ui";

import type { WebCareerState } from "../../runtime/web-career-runtime";

/** Complete durable-fact presentation consumed by rail and Posta outlet. */
export interface CareerInboxPresentation {
  readonly postaView: CareerPostaView;
  readonly railView: CareerInboxView;
}

const DEMO_COMPETITION_NAMES: Readonly<Record<string, string>> = {
  "competition:demo-third-division": "Demo Third Division",
};

/**
 * Maps current-season career facts onto framework-free Posta read models.
 *
 * Entity names are resolved here so the UI package never imports storage,
 * engine, or domain. Technical IDs remain routing identities and are not
 * exposed as visible football facts.
 */
export function presentCareerInbox(input: {
  readonly careerState: WebCareerState;
  readonly activeFilter: CareerPostaFilter;
  readonly selectedMessageId?: string;
}): CareerInboxPresentation {
  const latestSeason = input.careerState.seasonHistory?.at(-1);
  const messages = (input.careerState.currentSeasonInbox ?? []).map((message) => {
    const fixtureId = message.related.fixtureId;
    const fixture = fixtureId === undefined
      ? undefined
      : input.careerState.gameState.fixtures[fixtureId];
    const opponentId = fixture === undefined
      ? undefined
      : fixture.homeClubId === input.careerState.selectedClubId
        ? fixture.awayClubId
        : fixture.homeClubId;
    const opponent = opponentId === undefined
      ? undefined
      : input.careerState.gameState.clubs[opponentId];
    const fixtureFacts = fixture === undefined || opponent === undefined
      ? undefined
      : {
          opponentName: opponent.name,
          competitionName: DEMO_COMPETITION_NAMES[String(fixture.competitionId)] ?? "Competition",
          roundNumber: fixture.roundNumber,
          venue: fixture.homeClubId === input.careerState.selectedClubId
            ? "home" as const
            : "away" as const,
          ...(message.category !== "matchday"
            ? {}
            : {
                readiness: {
                  lineup: !message.blockerKeys.includes("missing_saved_lineup"),
                  bench: !message.blockerKeys.includes("missing_bench_slot")
                    && !message.blockerKeys.includes("missing_bench_goalkeeper"),
                  tactic: !message.blockerKeys.includes("missing_saved_tactic"),
                },
              }),
          ...(message.category !== "match_result" || fixture.result === undefined
            ? {}
            : {
                score: fixture.homeClubId === input.careerState.selectedClubId
                  ? {
                      selectedClubGoals: fixture.result.homeGoals,
                      opponentGoals: fixture.result.awayGoals,
                    }
                  : {
                      selectedClubGoals: fixture.result.awayGoals,
                      opponentGoals: fixture.result.homeGoals,
                    },
              }),
        };
    const champion = latestSeason === undefined
      ? undefined
      : input.careerState.gameState.clubs[latestSeason.championClubId];
    const seasonFacts = message.category !== "season_rollover"
      || latestSeason === undefined
      || champion === undefined
      ? undefined
      : {
          sequenceNumber: latestSeason.sequenceNumber,
          selectedClubPosition: latestSeason.selectedClubFinish.position,
          championClubName: champion.name,
          fixtureCount: latestSeason.aggregateGoals.fixtureCount,
          totalGoals: latestSeason.aggregateGoals.totalGoals,
        };
    const contract = message.related.contractId === undefined
      ? undefined
      : input.careerState.seniorSquadState?.contracts[message.related.contractId];
    const contractPlayer = contract === undefined
      ? undefined
      : input.careerState.gameState.players[contract.playerId];
    const contractFacts = contract === undefined || contractPlayer === undefined
      ? undefined
      : {
          playerName: `${contractPlayer.firstName} ${contractPlayer.lastName}`,
          expiresOnIso: toISO(contract.endsOn),
        };

    return {
      messageId: String(message.id),
      dateIso: toISO(message.date),
      category: message.category,
      source: message.source,
      level: message.level,
      continuePolicy: message.continuePolicy,
      lifecycle: message.lifecycle,
      blockerKeys: message.blockerKeys,
      actionIds: message.actionIds,
      ...(fixtureFacts === undefined ? {} : { fixture: fixtureFacts }),
      ...(seasonFacts === undefined ? {} : { season: seasonFacts }),
      ...(contractFacts === undefined ? {} : { contract: contractFacts }),
    } satisfies CareerPostaMessageInput;
  });

  return {
    postaView: buildCareerPostaView({
      messages,
      activeFilter: input.activeFilter,
      ...(input.selectedMessageId === undefined ? {} : { selectedMessageId: input.selectedMessageId }),
    }),
    railView: buildCareerInboxView(messages.map(toRailMessage)),
  };
}

function toRailMessage(message: CareerPostaMessageInput): CareerInboxMessageInput {
  const actionId = message.lifecycle.resolved ? undefined : message.actionIds[0];
  return {
    messageId: message.messageId,
    dateIso: message.dateIso,
    category: message.category,
    priority: message.level === "blocking"
      ? "urgent"
      : message.level === "important"
        ? "important"
        : "routine",
    status: message.lifecycle.resolved
      ? "resolved"
      : message.lifecycle.read
        ? "read"
        : "unread",
    titleKey: `career.inbox.subject.${message.category}`,
    summaryKey: railSummaryKey(message),
    actionRequired: isMessageToHandle(message),
    relatedLabels: message.fixture === undefined
      ? message.season === undefined
        ? message.contract === undefined ? [] : [message.contract.playerName]
        : [message.season.championClubName]
      : [message.fixture.opponentName],
    actions: actionId === undefined
      ? []
      : [{ actionId, labelKey: `career.inbox.action.${actionId}` }],
  };
}

function isMessageToHandle(message: CareerPostaMessageInput): boolean {
  if (message.continuePolicy === "until_resolved") return !message.lifecycle.resolved;
  return message.continuePolicy === "until_acknowledged" && !message.lifecycle.acknowledged;
}

function railSummaryKey(message: CareerPostaMessageInput): string {
  if (message.category === "matchday") {
    return message.blockerKeys.length > 0
      ? "career.inbox.preview.matchdayPreparation"
      : "career.inbox.preview.matchdayReady";
  }

  return `career.inbox.preview.${message.category}`;
}
