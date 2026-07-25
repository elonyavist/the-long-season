import { describe, expect, it } from "vitest";
import {
  createMatchdayAttention,
  createTransferNegotiationId,
  findNextCareerFixture,
  projectSelectedClubContractAttention,
  projectSelectedClubMarketAttention,
  submitTransferOffer,
} from "@game/engine";
import { careerNonNegativeMoneyFromMinorUnits } from "@game/ui";

import {
  buildWebCareerState,
  type WebCareerSaveId,
  type WebCareerState,
} from "../../runtime/web-career-runtime";
import { resolveCareerTransferWindows } from "../market/market-transfer-windows";
import { presentCareerInbox } from "./career-inbox-presenter";

describe("presentCareerInbox", () => {
  it("resolves opponent and fixture facts without exposing technical IDs", () => {
    const career = careerWithMatchdayMessage();
    const presentation = presentCareerInbox({ careerState: career, activeFilter: "all" });
    const detail = presentation.postaView.selectedMessage;

    expect(presentation.postaView.totalCount).toBe(1);
    expect(presentation.railView.actionRequiredCount).toBe(1);
    expect(detail?.subjectKey).toBe("career.inbox.subject.matchday");
    expect(detail?.factRows.map((row) => row.labelKey)).toEqual([
      "career.inbox.fact.opponent",
      "career.inbox.fact.competition",
      "career.inbox.fact.round",
      "career.inbox.fact.venue",
      "career.inbox.fact.lineup",
      "career.inbox.fact.bench",
      "career.inbox.fact.tactic",
    ]);
    expect(detail?.factRows.some((row) => "value" in row && row.value?.startsWith("fixture:"))).toBe(false);
    expect(detail?.factRows).toContainEqual({
      labelKey: "career.inbox.fact.competition",
      value: "Demo Third Division",
    });
    expect(detail?.primaryAction?.actionId).toBe("prepare_match");
  });

  it("keeps selection deterministic when the requested message is absent", () => {
    const career = careerWithMatchdayMessage();
    const presentation = presentCareerInbox({
      careerState: career,
      activeFilter: "all",
      selectedMessageId: "inbox:missing",
    });

    expect(presentation.postaView.selectedMessageId).toBe(
      String(career.currentSeasonInbox?.[0]?.id),
    );
  });

  it("keeps the fixture identity while complete preparation changes the destination", () => {
    const career = careerWithMatchdayMessage({ ready: true });
    const presentation = presentCareerInbox({ careerState: career, activeFilter: "all" });

    expect(presentation.postaView.selectedMessageId).toBe(String(career.currentSeasonInbox?.[0]?.id));
    expect(presentation.postaView.selectedMessage?.primaryAction?.actionId).toBe("open_matchday");
    expect(presentation.postaView.selectedMessage?.factRows.slice(-3)).toEqual([
      { labelKey: "career.inbox.fact.lineup", valueKey: "career.inbox.readiness.ready" },
      { labelKey: "career.inbox.fact.bench", valueKey: "career.inbox.readiness.ready" },
      { labelKey: "career.inbox.fact.tactic", valueKey: "career.inbox.readiness.ready" },
    ]);
  });

  it("presents one informational result from the committed fixture score", () => {
    const career = careerWithMatchdayMessage();
    const fixtureId = career.currentSeasonInbox?.[0]?.related.fixtureId;
    if (fixtureId === undefined) throw new Error("Expected related fixture");
    const fixture = career.gameState.fixtures[fixtureId];
    if (fixture === undefined) throw new Error("Expected fixture");
    const playedCareer: WebCareerState = {
      ...career,
      gameState: {
        ...career.gameState,
        fixtures: {
          ...career.gameState.fixtures,
          [fixtureId]: { ...fixture, result: { played: true, homeGoals: 3, awayGoals: 1 } },
        },
      },
    };
    const sourceMessage = career.currentSeasonInbox?.[0];
    if (sourceMessage === undefined) throw new Error("Expected matchday message");
    const message = {
      ...sourceMessage,
      id: `inbox:match-result:${fixtureId}` as typeof sourceMessage.id,
      category: "match_result",
      source: "match_report",
      level: "informational",
      continuePolicy: "never",
      lifecycle: { read: false, acknowledged: false, resolved: false },
      related: { fixtureId },
      blockerKeys: [],
      actionIds: [],
    } as const;
    const presentation = presentCareerInbox({
      careerState: { ...playedCareer, currentSeasonInbox: [message] },
      activeFilter: "all",
    });

    expect(presentation.postaView.toHandleCount).toBe(0);
    expect(presentation.postaView.selectedMessage?.sourceKey).toBe("career.inbox.source.match_report");
    expect(presentation.postaView.selectedMessage?.factRows).toContainEqual({
      labelKey: "career.inbox.fact.finalScore",
      value: fixture.homeClubId === career.selectedClubId ? "3 - 1" : "1 - 3",
    });
    expect(presentation.postaView.selectedMessage?.factRows).not.toContainEqual(
      expect.objectContaining({ labelKey: "career.inbox.fact.lineup" }),
    );
    expect(presentation.railView.messages[0]?.category).toBe("match_result");
  });

  it("presents a renewal reminder as visible contract context without blocking Continue", () => {
    const career = buildWebCareerState({
      saveId: "save:posta-contract-reminder" as WebCareerSaveId,
      worldSeed: "posta-contract-reminder-seed",
    });
    const contract = career.seniorSquadState?.activeContractIds
      .map((id) => career.seniorSquadState?.contracts[id])
      .find((candidate) => candidate?.clubId === career.selectedClubId);
    if (contract === undefined) throw new Error("Expected selected-club contract");
    const reminder = projectSelectedClubContractAttention(
      career,
      (contract.endsOn - 243) as typeof contract.endsOn,
    ).find((attention) => attention.message.category === "contract_reminder");
    if (reminder === undefined) throw new Error("Expected contract reminder");

    const presentation = presentCareerInbox({
      careerState: { ...career, currentSeasonInbox: [reminder.message] },
      activeFilter: "all",
    });

    expect(presentation.postaView.toHandleCount).toBe(0);
    expect(presentation.railView.actionRequiredCount).toBe(0);
    expect(presentation.postaView.selectedMessage).toMatchObject({
      subjectKey: "career.inbox.subject.contract_reminder",
      sourceKey: "career.inbox.source.contract_office",
      primaryAction: {
        actionId: "open_contract_negotiation",
        labelKey: "career.inbox.action.open_contract_negotiation",
      },
    });
    expect(presentation.postaView.selectedMessage?.factRows.map((row) => row.labelKey)).toEqual([
      "career.inbox.fact.player",
      "career.inbox.fact.contractExpiry",
    ]);
  });

  it("presents an important rollover from the latest durable season archive", () => {
    const career = buildWebCareerState({
      saveId: "save:posta-rollover" as WebCareerSaveId,
      worldSeed: "posta-rollover-seed",
    });
    const selectedClub = career.gameState.clubs[career.selectedClubId];
    if (selectedClub === undefined) throw new Error("Expected selected club");
    const tableRow = {
      position: 1,
      clubId: selectedClub.id,
      played: 34,
      wins: 22,
      draws: 7,
      losses: 5,
      goalsFor: 68,
      goalsAgainst: 31,
      goalDifference: 37,
      points: 73,
    };
    const nextFixture = findNextCareerFixture(career);
    if (nextFixture.status !== "found") throw new Error("Expected fixture");
    const sourceMessage = createMatchdayAttention({
      fixtureId: nextFixture.fixture.id,
      clubId: career.selectedClubId,
      date: career.gameState.calendar.currentDate,
      preparation: {
        hasSavedLineup: true,
        hasSavedTactic: true,
        hasCompleteBench: true,
        hasBenchGoalkeeper: true,
      },
    }).message;
    const message = {
      ...sourceMessage,
      id: `inbox:season-rollover:${career.gameState.calendar.currentSeasonId}` as typeof sourceMessage.id,
      category: "season_rollover",
      source: "competition_office",
      level: "important",
      continuePolicy: "until_acknowledged",
      lifecycle: { read: false, acknowledged: false, resolved: false },
      related: { clubId: career.selectedClubId },
      actionIds: [],
    } as const;
    const rolloverCareer: WebCareerState = {
      ...career,
      seasonHistory: [{
        sequenceNumber: 1,
        seasonId: career.gameState.calendar.currentSeasonId,
        competitionId: career.gameState.fixtures[career.gameState.fixtureIds[0]!]!.competitionId,
        finalTable: [tableRow],
        championClubId: selectedClub.id,
        selectedClubFinish: tableRow,
        aggregateGoals: { fixtureCount: 306, totalGoals: 872 },
      }],
      currentSeasonInbox: [message],
    };
    const presentation = presentCareerInbox({ careerState: rolloverCareer, activeFilter: "all" });

    expect(presentation.postaView.toHandleCount).toBe(1);
    expect(presentation.postaView.selectedMessage?.sourceKey).toBe("career.inbox.source.competition_office");
    expect(presentation.postaView.selectedMessage?.factRows).toEqual([
      { labelKey: "career.inbox.fact.seasonNumber", value: "1" },
      { labelKey: "career.inbox.fact.selectedClubPosition", value: "1" },
      { labelKey: "career.inbox.fact.champion", value: selectedClub.name },
      { labelKey: "career.inbox.fact.matches", value: "306" },
      { labelKey: "career.inbox.fact.goals", value: "872" },
    ]);
    expect(presentation.railView.messages[0]?.category).toBe("season_rollover");
  });
  it("presents a market counteroffer with resolved player and counterparty names", () => {
    const career = buildWebCareerState({
      saveId: "save:posta-market" as WebCareerSaveId,
      worldSeed: "posta-market-seed",
    });
    const sellingClubId = career.gameState.clubIds.find((id) => id !== career.selectedClubId);
    if (sellingClubId === undefined) throw new Error("Expected a selling club");
    const targetPlayerId = career.gameState.clubs[sellingClubId]?.playerIds[0];
    const targetPlayer = targetPlayerId === undefined
      ? undefined
      : career.gameState.players[targetPlayerId];
    if (targetPlayerId === undefined || targetPlayer === undefined) {
      throw new Error("Expected a market target player");
    }

    const negotiationId = createTransferNegotiationId(career.selectedClubId, targetPlayerId, 1);
    const submitted = submitTransferOffer({
      careerState: career,
      negotiationId,
      buyingClubId: career.selectedClubId,
      sellingClubId,
      playerId: targetPlayerId,
      offeredFee: careerNonNegativeMoneyFromMinorUnits(50_000_00),
      submittedOn: career.gameState.calendar.currentDate,
      transferWindows: resolveCareerTransferWindows(career),
    });
    if (submitted.status !== "applied" || submitted.negotiation.status !== "submitted") {
      throw new Error("Expected a submitted transfer offer");
    }
    const countered = {
      id: negotiationId,
      buyingClubId: career.selectedClubId,
      sellingClubId,
      playerId: targetPlayerId,
      status: "countered",
      submittedOn: submitted.negotiation.submittedOn,
      offeredFee: submitted.negotiation.offeredFee,
      counterFee: careerNonNegativeMoneyFromMinorUnits(80_000_00),
      counterIssuedOn: career.gameState.calendar.currentDate,
      clock: submitted.negotiation.clock,
    };
    const counteredCareer: WebCareerState = {
      ...submitted.careerState,
      transferNegotiationState: {
        negotiations: { [negotiationId]: countered },
        negotiationIds: [negotiationId],
      } as NonNullable<WebCareerState["transferNegotiationState"]>,
    };
    const messages = projectSelectedClubMarketAttention(
      counteredCareer,
      counteredCareer.gameState.calendar.currentDate,
    );
    const presentation = presentCareerInbox({
      careerState: { ...counteredCareer, currentSeasonInbox: messages },
      activeFilter: "all",
    });

    expect(presentation.postaView.toHandleCount).toBe(1);
    expect(presentation.postaView.selectedMessage).toMatchObject({
      subjectKey: "career.inbox.subject.market_club_counteroffer",
      sourceKey: "career.inbox.source.transfer_office",
      primaryAction: {
        actionId: "open_market_negotiation",
        labelKey: "career.inbox.action.open_market_negotiation",
      },
    });
    expect(presentation.postaView.selectedMessage?.factRows).toEqual([
      {
        labelKey: "career.inbox.fact.player",
        value: `${targetPlayer.firstName} ${targetPlayer.lastName}`,
      },
      {
        labelKey: "career.inbox.fact.counterpartyClub",
        value: career.gameState.clubs[sellingClubId]?.name,
      },
    ]);
    expect(presentation.railView.messages[0]?.relatedLabels).toEqual([
      `${targetPlayer.firstName} ${targetPlayer.lastName}`,
    ]);
  });
});

function careerWithMatchdayMessage(options: { readonly ready?: boolean } = {}): WebCareerState {
  const career = buildWebCareerState({
    saveId: "save:posta-presenter" as WebCareerSaveId,
    worldSeed: "posta-presenter-seed",
  });
  const nextFixture = findNextCareerFixture(career);
  if (nextFixture.status !== "found") throw new Error("Expected selected-club fixture");
  const message = createMatchdayAttention({
    fixtureId: nextFixture.fixture.id,
    clubId: career.selectedClubId,
    date: nextFixture.fixture.date,
    preparation: {
      hasSavedLineup: options.ready === true,
      hasSavedTactic: options.ready === true,
      hasCompleteBench: options.ready === true,
      hasBenchGoalkeeper: options.ready === true,
    },
  }).message;
  return { ...career, currentSeasonInbox: [message] };
}
