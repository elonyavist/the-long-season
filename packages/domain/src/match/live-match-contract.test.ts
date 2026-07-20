import assert from "node:assert/strict";
import { test } from "vitest";

import { createCompetitionMatchRules, type CompetitionMatchRules } from "../entities/competition.entity.ts";
import type { MatchEventSide } from "../entities/match-event.entity.ts";
import { createTacticSetup } from "../entities/tactic.entity.ts";
import { fixtureId, playerId, type PlayerId } from "../types/ids.ts";
import type { CanonicalPlayerRole } from "../tactics/index.ts";
import { validateLiveMatchCommand } from "./live-match-command.ts";
import {
  createLiveMatchSession,
  LiveMatchSessionError,
  type LiveMatchSession,
  type LiveMatchTeamState,
} from "./live-match-session.ts";
import { emptyLiveMatchStatistics } from "./live-match-statistics.ts";

const RULES: CompetitionMatchRules = createCompetitionMatchRules({
  maximumSubstitutions: 5,
  substitutionWindowLimit: null,
  allowsPlayerReentry: false,
  yellowCardAccumulationThreshold: 5,
  straightRedSuspensionMatches: 3,
  secondYellowSuspensionMatches: 1,
  yellowAccumulationSuspensionMatches: 1,
});

test("complete pre-match live session keeps only regulation phases and structured facts", () => {
  const session = createLiveMatchSession(baseSession("pre_match", 0, "paused", "pre_match"), RULES);

  assert.equal(session.home.lineup.length, 11);
  assert.equal(session.away.bench.length, 8);
  assert.equal(session.statistics.home.possessionShare, 0);
  assert.equal(JSON.stringify(session).includes("commentary"), false);
});

test("live session rejects duplicated players and score-statistic disagreement", () => {
  const input = baseSession("pre_match", 0, "paused", "pre_match");
  const firstPlayer = input.home.lineup[0]?.playerId;
  assert.ok(firstPlayer !== undefined);

  assert.throws(
    () => createLiveMatchSession({
      ...input,
      home: {
        ...input.home,
        bench: input.home.bench.map((slot, index) => index === 0 ? { ...slot, playerId: firstPlayer } : slot),
      },
    }, RULES),
    (error: unknown) => error instanceof LiveMatchSessionError && error.code === "duplicate_player",
  );

  assert.throws(
    () => createLiveMatchSession({ ...input, score: { home: 1, away: 0 } }, RULES),
    (error: unknown) => error instanceof LiveMatchSessionError && error.code === "score_statistics_mismatch",
  );
});

test("manual pause and resume remain unlimited presentation commands", () => {
  const running = createLiveMatchSession(baseSession("first_half", 12, "running"), RULES);
  const paused = createLiveMatchSession(baseSession("first_half", 12, "paused", "manual"), RULES);

  for (let index = 0; index < 20; index += 1) {
    assert.deepEqual(validateLiveMatchCommand(running, { type: "pause" }, RULES), { accepted: true });
    assert.deepEqual(validateLiveMatchCommand(paused, { type: "resume" }, RULES), { accepted: true });
  }
});

test("paused grouped changes accept one substitution and explicit role-position plan", () => {
  const session = createLiveMatchSession(baseSession("first_half", 30, "paused", "manual"), RULES);
  const { nextTeam, outgoingPlayerId, incomingPlayerId } = substituteFirstOutfielder(session.home);

  assert.deepEqual(validateLiveMatchCommand(session, {
    type: "apply_team_changes",
    side: "home",
    substitutions: [{ outgoingPlayerId, incomingPlayerId, reasonKey: "manager_decision" }],
    nextTeam,
  }, RULES), { accepted: true });
});

test("a pending dismissal accepts a ten-player reorganization without consuming a substitution", () => {
  const base = baseSession("first_half", 30, "paused", "selected_club_red_card");
  const dismissedPlayerId = base.home.lineup[5]?.playerId;
  assert.ok(dismissedPlayerId !== undefined);
  const session = createLiveMatchSession({
    ...base,
    pendingDecision: {
      type: "red_card_reorganization",
      minute: 30,
      side: "home",
      playerId: dismissedPlayerId,
    },
  }, RULES);
  const nextTeam: LiveMatchTeamState = {
    ...session.home,
    lineup: session.home.lineup.filter((slot) => slot.playerId !== dismissedPlayerId),
    unavailable: [{ playerId: dismissedPlayerId, reason: "dismissed" }],
  };

  assert.deepEqual(validateLiveMatchCommand(session, {
    type: "apply_team_changes",
    side: "home",
    substitutions: [],
    nextTeam,
  }, RULES), { accepted: true });
});

test("a pending forced injury accepts either a replacement or a player-short continuation", () => {
  const base = baseSession("second_half", 60, "paused", "forced_injury");
  const injuredPlayerId = base.home.lineup[5]?.playerId;
  const replacement = base.home.bench[0];
  assert.ok(injuredPlayerId !== undefined && replacement !== undefined);
  const session = createLiveMatchSession({
    ...base,
    pendingDecision: {
      type: "forced_injury",
      minute: 60,
      side: "home",
      playerId: injuredPlayerId,
      severity: "moderate",
    },
  }, RULES);
  const replaced: LiveMatchTeamState = {
    ...session.home,
    lineup: session.home.lineup.map((slot) => slot.playerId === injuredPlayerId
      ? { ...slot, playerId: replacement.playerId }
      : slot),
    bench: session.home.bench.slice(1),
    unavailable: [{ playerId: injuredPlayerId, reason: "injured" }],
    substitutionsUsed: 1,
  };

  assert.deepEqual(validateLiveMatchCommand(session, {
    type: "apply_team_changes",
    side: "home",
    substitutions: [{
      outgoingPlayerId: injuredPlayerId,
      incomingPlayerId: replacement.playerId,
      reasonKey: "forced_injury",
    }],
    nextTeam: replaced,
  }, RULES), { accepted: true });

  assert.deepEqual(validateLiveMatchCommand(session, {
    type: "apply_team_changes",
    side: "home",
    substitutions: [],
    nextTeam: {
      ...session.home,
      lineup: session.home.lineup.filter((slot) => slot.playerId !== injuredPlayerId),
      unavailable: [{ playerId: injuredPlayerId, reason: "injured" }],
    },
  }, RULES), { accepted: true });
});

test("grouped changes reject no re-entry, moved goalkeeper, dismissals, injuries, and the sixth substitution", () => {
  const initial = createLiveMatchSession(baseSession("first_half", 30, "paused", "manual"), RULES);
  const firstChange = substituteFirstOutfielder(initial.home);
  const afterFirst = createLiveMatchSession({ ...initial, home: firstChange.nextTeam }, RULES);
  const secondOutgoing = afterFirst.home.lineup[2]?.playerId;
  const returnedPlayer = afterFirst.home.bench.find((player) => player.status === "substituted_out")?.playerId;
  assert.ok(secondOutgoing !== undefined && returnedPlayer !== undefined);

  const reentryTeam = replaceLineupPlayer(afterFirst.home, secondOutgoing, returnedPlayer, "substituted_out");
  const reentry = validateLiveMatchCommand(afterFirst, {
    type: "apply_team_changes",
    side: "home",
    substitutions: [{ outgoingPlayerId: secondOutgoing, incomingPlayerId: returnedPlayer, reasonKey: "manager_decision" }],
    nextTeam: { ...reentryTeam, substitutionsUsed: 2 },
  }, RULES);
  assert.equal(hasRejection(reentry, "player_cannot_reenter"), true);

  const currentGoalkeeper = initial.home.lineup.find((slot) => slot.role === "goalkeeper");
  assert.ok(currentGoalkeeper !== undefined);
  const movedGoalkeeper = validateLiveMatchCommand(initial, {
    type: "apply_team_changes",
    side: "home",
    substitutions: [],
    nextTeam: {
      ...initial.home,
      lineup: initial.home.lineup.map((slot) => slot.slotId === currentGoalkeeper.slotId ? { ...slot, ny: slot.ny - 0.05 } : slot),
    },
  }, RULES);
  assert.equal(hasRejection(movedGoalkeeper, "goalkeeper_role_or_area_change"), true);

  for (const reason of ["dismissed", "injured"] as const) {
    const unavailablePlayer = initial.home.bench[0];
    assert.ok(unavailablePlayer !== undefined);
    const currentTeam: LiveMatchTeamState = {
      ...initial.home,
      bench: initial.home.bench.slice(1),
      unavailable: [{ playerId: unavailablePlayer.playerId, reason }],
    };
    const unavailableSession = createLiveMatchSession({ ...initial, home: currentTeam }, RULES);
    const outgoingPlayerId = unavailableSession.home.lineup[1]?.playerId;
    assert.ok(outgoingPlayerId !== undefined);
    const nextTeam = replaceUnavailablePlayer(unavailableSession.home, outgoingPlayerId, unavailablePlayer.playerId);
    const validation = validateLiveMatchCommand(unavailableSession, {
      type: "apply_team_changes",
      side: "home",
      substitutions: [{ outgoingPlayerId, incomingPlayerId: unavailablePlayer.playerId, reasonKey: "manager_decision" }],
      nextTeam: { ...nextTeam, substitutionsUsed: 1 },
    }, RULES);
    assert.equal(hasRejection(validation, reason === "dismissed" ? "dismissed_player" : "injured_player"), true);
  }

  const maxedSession = createLiveMatchSession({
    ...initial,
    home: { ...initial.home, substitutionsUsed: 5 },
  }, RULES);
  const maxChange = substituteFirstOutfielder(maxedSession.home);
  const maxed = validateLiveMatchCommand(maxedSession, {
    type: "apply_team_changes",
    side: "home",
    substitutions: [{
      outgoingPlayerId: maxChange.outgoingPlayerId,
      incomingPlayerId: maxChange.incomingPlayerId,
      reasonKey: "manager_decision",
    }],
    nextTeam: { ...maxChange.nextTeam, substitutionsUsed: 6 },
  }, RULES);
  assert.equal(hasRejection(maxed, "maximum_substitutions_reached"), true);
});

function baseSession(
  phase: LiveMatchSession["phase"],
  currentMinute: number,
  runState: LiveMatchSession["runState"],
  pauseReason?: LiveMatchSession["pauseReason"],
): LiveMatchSession {
  return {
    fixtureId: fixtureId("fixture:live-contract"),
    controlledSide: "home",
    phase,
    currentMinute,
    runState,
    ...(pauseReason === undefined ? {} : { pauseReason }),
    score: { home: 0, away: 0 },
    statistics: emptyLiveMatchStatistics(),
    home: team("home"),
    away: team("away"),
    events: [],
    substitutions: [],
  };
}

function team(side: MatchEventSide): LiveMatchTeamState {
  const roles: readonly CanonicalPlayerRole[] = [
    "goalkeeper",
    "right_full_back",
    "center_back",
    "center_back",
    "left_full_back",
    "right_midfielder",
    "central_midfielder",
    "central_midfielder",
    "left_midfielder",
    "striker",
    "striker",
  ];

  return {
    side,
    formation: "4-4-2",
    lineup: roles.map((role, index) => ({
      slotId: `xi-${index + 1}`,
      playerId: playerId(`player:${side}-xi-${index + 1}`),
      role,
      nx: index === 0 ? 0.5 : 0.1 + (index % 5) * 0.2,
      ny: index === 0 ? 0.92 : 0.75 - Math.floor((index - 1) / 4) * 0.25,
    })),
    bench: Array.from({ length: 8 }, (_, index) => ({
      slotId: `bench-${index + 1}`,
      playerId: playerId(`player:${side}-bench-${index + 1}`),
      status: "available" as const,
    })),
    unavailable: [],
    substitutionsUsed: 0,
    tactic: createTacticSetup({ mentality: "balanced", pressing: 0.5, directness: 0.5, width: 0.5, risk: 0.5 }),
  };
}

function substituteFirstOutfielder(teamState: LiveMatchTeamState): {
  readonly nextTeam: LiveMatchTeamState;
  readonly outgoingPlayerId: PlayerId;
  readonly incomingPlayerId: PlayerId;
} {
  const outgoingPlayerId = teamState.lineup[1]?.playerId;
  const incomingPlayerId = teamState.bench.find((player) => player.status === "available")?.playerId;
  assert.ok(outgoingPlayerId !== undefined && incomingPlayerId !== undefined);

  return {
    outgoingPlayerId,
    incomingPlayerId,
    nextTeam: {
      ...replaceLineupPlayer(teamState, outgoingPlayerId, incomingPlayerId, "available"),
      substitutionsUsed: teamState.substitutionsUsed + 1,
    },
  };
}

function replaceLineupPlayer(
  teamState: LiveMatchTeamState,
  outgoingPlayerId: PlayerId,
  incomingPlayerId: PlayerId,
  expectedIncomingStatus: "available" | "substituted_out",
): LiveMatchTeamState {
  return {
    ...teamState,
    lineup: teamState.lineup.map((slot) => slot.playerId === outgoingPlayerId ? { ...slot, playerId: incomingPlayerId } : slot),
    bench: teamState.bench.map((slot) => slot.playerId === incomingPlayerId && slot.status === expectedIncomingStatus
      ? { ...slot, playerId: outgoingPlayerId, status: "substituted_out" as const }
      : slot),
  };
}

function replaceUnavailablePlayer(
  teamState: LiveMatchTeamState,
  outgoingPlayerId: PlayerId,
  incomingPlayerId: PlayerId,
): LiveMatchTeamState {
  return {
    ...teamState,
    lineup: teamState.lineup.map((slot) => slot.playerId === outgoingPlayerId ? { ...slot, playerId: incomingPlayerId } : slot),
    bench: [...teamState.bench, { slotId: "bench-returned", playerId: outgoingPlayerId, status: "substituted_out" }],
    unavailable: [],
  };
}

function hasRejection(
  validation: ReturnType<typeof validateLiveMatchCommand>,
  code: string,
): boolean {
  return !validation.accepted && validation.rejections.some((rejection) => rejection.code === code);
}
