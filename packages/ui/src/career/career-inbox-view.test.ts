import assert from "node:assert/strict";
import { test } from "vitest";

import { buildCareerInboxView, buildCareerPostaView } from "./career-inbox-view.ts";

test("buildCareerInboxView derives counts and empty state", () => {
  const view = buildCareerInboxView([]);

  assert.equal(view.viewKey, "career.inbox");
  assert.equal(view.unreadCount, 0);
  assert.equal(view.actionRequiredCount, 0);
  assert.equal(view.highestPriority, undefined);
  assert.equal(view.emptyStateKey, "career.inbox.empty");
});

test("buildCareerInboxView sorts action-required urgent messages first", () => {
  const view = buildCareerInboxView([
    {
      messageId: "inbox:later-routine",
      dateIso: "2026-08-02",
      category: "match_result",
      priority: "routine",
      status: "unread",
      titleKey: "career.inbox.subject.match_result",
      summaryKey: "career.inbox.preview.match_result",
      actionRequired: false,
    },
    {
      messageId: "inbox:prep",
      dateIso: "2026-08-01",
      category: "matchday",
      priority: "urgent",
      status: "unread",
      titleKey: "career.inbox.subject.matchday",
      summaryKey: "career.inbox.preview.matchdayPreparation",
      actionRequired: true,
      actions: [{ actionId: "prepare_match", labelKey: "career.inbox.action.prepare_match" }],
    },
  ]);

  assert.equal(view.messages[0]?.messageId, "inbox:prep");
  assert.equal(view.unreadCount, 2);
  assert.equal(view.actionRequiredCount, 1);
  assert.equal(view.highestPriority, "urgent");
  assert.deepEqual(view.messages[0]?.actions, [
    { actionId: "prepare_match", labelKey: "career.inbox.action.prepare_match" },
  ]);
});

test("buildCareerInboxView uses date and ID as deterministic tie-breakers", () => {
  const view = buildCareerInboxView([
    messageFixture("inbox:beta", "2026-08-02"),
    messageFixture("inbox:alpha", "2026-08-02"),
    messageFixture("inbox:earlier", "2026-08-01"),
  ]);

  assert.deepEqual(
    view.messages.map((message) => message.messageId),
    ["inbox:earlier", "inbox:alpha", "inbox:beta"],
  );
});

function messageFixture(messageId: string, dateIso: string) {
  return {
    messageId,
    dateIso,
    category: "matchday" as const,
    priority: "important" as const,
    status: "unread" as const,
    titleKey: "career.inbox.subject.matchday",
    summaryKey: "career.inbox.preview.matchdayReady",
    actionRequired: true,
  };
}

test("buildCareerPostaView filters durable lifecycle facts and selects deterministically", () => {
  const blocking = postaMessage("inbox:blocking", "blocking", false);
  const informational = postaMessage("inbox:info", "informational", false);
  const view = buildCareerPostaView({
    messages: [informational, blocking],
    activeFilter: "to_handle",
    selectedMessageId: informational.messageId,
  });

  assert.deepEqual(view.filters, ["all", "to_handle", "unread"]);
  assert.deepEqual(view.messages.map((message) => message.messageId), [blocking.messageId]);
  assert.equal(view.selectedMessageId, blocking.messageId);
  assert.equal(view.toHandleCount, 1);
  assert.equal(view.unreadCount, 2);
  assert.equal(view.selectedMessage?.primaryAction?.actionId, "prepare_match");
  assert.deepEqual(view.selectedMessage?.factRows, [
    { labelKey: "career.inbox.fact.opponent", value: "U.S. Pisa" },
    { labelKey: "career.inbox.fact.competition", value: "Demo Third Division" },
    { labelKey: "career.inbox.fact.round", value: "1" },
    { labelKey: "career.inbox.fact.venue", valueKey: "career.inbox.venue.away" },
    { labelKey: "career.inbox.fact.lineup", valueKey: "career.inbox.readiness.needsAttention" },
    { labelKey: "career.inbox.fact.bench", valueKey: "career.inbox.readiness.ready" },
    { labelKey: "career.inbox.fact.tactic", valueKey: "career.inbox.readiness.ready" },
  ]);
});

test("buildCareerPostaView treats acknowledged important and resolved blocking messages as handled", () => {
  const important = {
    ...postaMessage("inbox:important", "important", true),
    lifecycle: { read: true, acknowledged: true, resolved: false },
  };
  const resolved = {
    ...postaMessage("inbox:resolved", "blocking", true),
    lifecycle: { read: true, acknowledged: false, resolved: true },
  };
  const view = buildCareerPostaView({ messages: [important, resolved], activeFilter: "to_handle" });

  assert.equal(view.messages.length, 0);
  assert.equal(view.toHandleCount, 0);
  assert.equal(view.emptyStateKey, "career.inbox.filter.empty");
});

test("buildCareerPostaView presents a played result without readiness noise or a stale action", () => {
  const view = buildCareerPostaView({
    activeFilter: "all",
    messages: [{
      ...postaMessage("inbox:match-result:fixture:000003", "informational", true),
      category: "match_result",
      source: "match_report",
      lifecycle: { read: true, acknowledged: false, resolved: true },
      actionIds: ["open_matchday"],
      fixture: {
        opponentName: "U.S. Pisa",
        competitionName: "Demo Third Division",
        roundNumber: 1,
        venue: "away",
        score: { selectedClubGoals: 0, opponentGoals: 3 },
      },
    }],
  });

  assert.equal(view.selectedMessage?.previewKey, "career.inbox.preview.match_result");
  assert.equal(view.selectedMessage?.primaryAction, undefined);
  assert.deepEqual(view.selectedMessage?.factRows.slice(-1), [
    { labelKey: "career.inbox.fact.finalScore", value: "0 - 3" },
  ]);
  assert.equal(
    view.selectedMessage?.factRows.some((row) => row.labelKey === "career.inbox.fact.lineup"),
    false,
  );
});

test("buildCareerPostaView presents only archived structured facts for season rollover", () => {
  const view = buildCareerPostaView({
    activeFilter: "all",
    messages: [{
      messageId: "inbox:season-rollover:season:0002",
      dateIso: "2027-08-01",
      category: "season_rollover",
      source: "competition_office",
      level: "important",
      continuePolicy: "until_acknowledged",
      lifecycle: { read: false, acknowledged: false, resolved: false },
      blockerKeys: [],
      actionIds: [],
      season: {
        sequenceNumber: 1,
        selectedClubPosition: 4,
        championClubName: "U.S. Pisa",
        fixtureCount: 306,
        totalGoals: 872,
      },
    }],
  });

  assert.equal(view.toHandleCount, 1);
  assert.equal(view.selectedMessage?.sourceKey, "career.inbox.source.competition_office");
  assert.deepEqual(view.selectedMessage?.factRows, [
    { labelKey: "career.inbox.fact.seasonNumber", value: "1" },
    { labelKey: "career.inbox.fact.selectedClubPosition", value: "4" },
    { labelKey: "career.inbox.fact.champion", value: "U.S. Pisa" },
    { labelKey: "career.inbox.fact.matches", value: "306" },
    { labelKey: "career.inbox.fact.goals", value: "872" },
  ]);
});

test("contract reminder stays visible without entering To handle", () => {
  const view = buildCareerPostaView({
    activeFilter: "all",
    messages: [{
      messageId: "inbox:contract-reminder:01",
      dateIso: "2026-11-01",
      category: "contract_reminder",
      source: "contract_office",
      level: "important",
      continuePolicy: "never",
      lifecycle: { read: false, acknowledged: false, resolved: false },
      blockerKeys: [],
      actionIds: ["open_contract_negotiation"],
      contract: { playerName: "Luca Rossi", expiresOnIso: "2027-06-30" },
    }],
  });

  assert.equal(view.toHandleCount, 0);
  assert.equal(view.unreadCount, 1);
  assert.equal(view.selectedMessage?.sourceKey, "career.inbox.source.contract_office");
  assert.deepEqual(view.selectedMessage?.factRows, [
    { labelKey: "career.inbox.fact.player", value: "Luca Rossi" },
    { labelKey: "career.inbox.fact.contractExpiry", value: "2027-06-30" },
  ]);
});

function postaMessage(
  messageId: string,
  level: "blocking" | "important" | "informational",
  read: boolean,
) {
  return {
    messageId,
    dateIso: "2026-08-01",
    category: "matchday" as const,
    source: "technical_staff" as const,
    level,
    continuePolicy: level === "blocking"
      ? "until_resolved" as const
      : level === "important"
        ? "until_acknowledged" as const
        : "never" as const,
    lifecycle: { read, acknowledged: false, resolved: false },
    blockerKeys: level === "blocking" ? ["missing_saved_lineup"] : [],
    actionIds: level === "blocking" ? ["prepare_match"] : [],
    fixture: {
      opponentName: "U.S. Pisa",
      competitionName: "Demo Third Division",
      roundNumber: 1,
      venue: "away" as const,
      readiness: { lineup: false, bench: true, tactic: true },
    },
  };
}
