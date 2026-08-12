import { createLineupSlot } from "../match-engine/index.ts";
import assert from "node:assert/strict";
import { test } from "vitest";

import {
  abilityValue,
  clubId,
  createLiveMatchSession,
  createLiveMatchStatistics,
  createTacticSetup,
  fixtureId,
  playerId,
  validateLiveMatchCommand,
  type CanonicalPlayerRole,
  type CompetitionMatchRules,
  type LiveMatchPendingDecision,
  type LiveMatchSession,
  type LiveMatchTeamState,
  type MatchEventSide,
  type Player,
  type PlayerId,
  type PlayerPosition,
  type PlayerRole,
} from "@game/domain";

import type { MatchContext, MatchTeamContext } from "../match-engine/match-context.ts";
import type { MatchEngineConfig } from "../match-engine/match-engine-config.ts";
import {
  createProgressiveMatchSession,
  resumeProgressiveMatchSession,
  type ProgressiveMatchSessionState,
} from "../match-engine/progressive-match-session.ts";
import {
  applyAiInGameDecision,
  applyProgressiveAiInGameDecisions,
  runAutomatedProgressiveMatch,
  selectAiInGameDecision,
  type SelectAiInGameDecisionInput,
} from "./ai-in-game-decisions.ts";
import {
  matchTacticsCalibrationFixture,
  tacticalShapeProfileFixture,
} from "../test-fixtures/match-tactics-calibration.ts";
import { matchDisciplineConfigFixture } from "../test-fixtures/match-engine-config.ts";
import { withNeutralIncidentProfiles } from "../test-fixtures/match-player-incident-profiles.ts";


/** Tests for the deterministic opponent policy and shared command path. */

test("forced injury replacement has priority and emits a legal substitution fact", () => {
  const session = sessionFixture({
    phase: "first_half",
    minute: 32,
    pauseReason: "forced_injury",
    pendingDecision: {
      type: "forced_injury",
      minute: 32,
      side: "home",
      playerId: homeXi(2),
      severity: "moderate",
    },
  });
  const input = policyInput(session, "home", [signal(homeXi(2), 6.4, 70)]);
  const selection = selectAiInGameDecision(input);

  assert.equal(selection.command?.substitutions.length, 1);
  assert.equal(selection.reasons[0]?.reasonKey, "forced_injury_replacement");
  assert.deepEqual(validateLiveMatchCommand(session, selection.command!, RULES), { accepted: true });

  const applied = applyAiInGameDecision(input);
  assert.equal(applied.facts.some((fact) => fact.type === "substitution"), true);
  assert.equal(applied.session.events.at(-1)?.type, "substitution");
  assert.equal(applied.session.home.unavailable.some((entry) => entry.playerId === homeXi(2)), true);
});

test("selected-side dismissal produces a bounded reorganization without restoring eleven players", () => {
  const dismissedPlayerId = homeXi(5);
  const session = sessionFixture({
    phase: "first_half",
    minute: 37,
    pauseReason: "selected_club_red_card",
    home: teamFixture("home"),
    pendingDecision: {
      type: "red_card_reorganization",
      minute: 37,
      side: "home",
      playerId: dismissedPlayerId,
    },
  });
  const selection = selectAiInGameDecision(policyInput(session, "home"));

  assert.equal(selection.command?.substitutions.length, 0);
  assert.equal(selection.command?.nextTeam.lineup.length, 10);
  assert.equal(selection.command?.nextTeam.tactic.risk, 0.4);
  assert.equal(selection.reasons[0]?.reasonKey, "dismissal_reorganization");
  assert.deepEqual(validateLiveMatchCommand(session, selection.command!, RULES), { accepted: true });
});

test("dismissed player is never selected as a simultaneous score-response substitution", () => {
  const dismissedPlayerId = homeXi(5);
  const session = sessionFixture({
    phase: "second_half",
    minute: 60,
    pauseReason: "selected_club_red_card",
    score: { home: 0, away: 1 },
    pendingDecision: {
      type: "red_card_reorganization",
      minute: 60,
      side: "home",
      playerId: dismissedPlayerId,
    },
  });
  const selection = selectAiInGameDecision(policyInput(
    session,
    "home",
    [signal(dismissedPlayerId, 5.5, 82)],
  ));

  assert.equal(selection.command?.substitutions.length, 0);
  assert.equal(selection.command?.nextTeam.lineup.length, 10);
  assert.equal(selection.command?.nextTeam.unavailable.some((entry) => entry.playerId === dismissedPlayerId), true);
  assert.equal(selection.reasons.some((entry) => entry.reasonKey === "command_rejected"), false);
  assert.deepEqual(validateLiveMatchCommand(session, selection.command!, RULES), { accepted: true });
});

test("trailing AI uses a credible substitute and an offered attacking shape", () => {
  const session = sessionFixture({ phase: "second_half", minute: 60, pauseReason: "manual", score: { home: 1, away: 0 } });
  const awayTeam = session.away;
  const attackingOption: LiveMatchTeamState = {
    ...awayTeam,
    formation: "4-3-3",
    lineup: awayTeam.lineup.map((slot, index) => ({
      ...slot,
      role: ATTACKING_ROLES[index] ?? slot.role,
    })),
  };
  const input = policyInput(session, "away", [signal(awayXi(11), 5.5, 82)], [{
    intent: "chase_match",
    team: attackingOption,
  }]);
  const first = selectAiInGameDecision(input);
  const second = selectAiInGameDecision(input);

  assert.deepEqual(first, second);
  assert.equal(first.command?.nextTeam.formation, "4-3-3");
  assert.equal(first.command?.nextTeam.tactic.mentality, "attacking");
  assert.equal(first.command?.substitutions.length, 1);
  assert.equal(first.reasons.some((entry) => entry.reasonKey === "trailing_response"), true);

  const applied = applyAiInGameDecision(input);
  assert.equal(applied.session.controlledSide, "home");
  assert.equal(applied.facts.some((fact) => fact.type === "formation_change"), true);
  assert.equal(applied.facts.some((fact) => fact.type === "role_change"), true);
  assert.equal(applied.facts.some((fact) => fact.type === "tactic_change"), true);
});

test("leading AI protects a late advantage with a bounded tactical command", () => {
  const session = sessionFixture({ phase: "second_half", minute: 70, pauseReason: "manual", score: { home: 0, away: 1 } });
  const selection = selectAiInGameDecision(policyInput(session, "away"));

  assert.equal(selection.command?.substitutions.length, 0);
  assert.equal(selection.command?.nextTeam.tactic.mentality, "defensive");
  assert.equal(selection.command?.nextTeam.tactic.risk, 0.38);
  assert.equal(selection.reasons[0]?.reasonKey, "protecting_lead");
});

/**
 * Fixes what a side does when its goalkeeper is sent off (Step 09).
 *
 * Football takes an outfielder off and sends the substitute keeper on. The
 * policy used to make no substitution at all and hand the gloves to whichever
 * remaining player sorted last by slot name, while the reserve keeper watched
 * from the bench for the rest of the match.
 */
test("a dismissed goalkeeper is replaced by the substitute keeper, not by whoever is nearest", () => {
  const away = withReserveGoalkeeper(teamFixture("away"));
  const dismissedId = awayXi(1);
  const session = sessionFixture({
    phase: "second_half",
    minute: 55,
    pauseReason: "selected_club_red_card",
    away: away.team,
    pendingDecision: { type: "red_card_reorganization", minute: 55, side: "away", playerId: dismissedId },
  });

  const selection = selectAiInGameDecision(policyInput(session, "away", [], undefined, away.players));
  const nextTeam = selection.command?.nextTeam;
  const inGoal = nextTeam?.lineup.find((slot) => slot.role === "goalkeeper");

  assert.equal(selection.command?.substitutions.length, 1);
  assert.equal(selection.command?.substitutions[0]?.incomingPlayerId, away.reserveGoalkeeperId);
  assert.equal(inGoal?.playerId, away.reserveGoalkeeperId);
  assert.equal(nextTeam?.lineup.length, 10);
  assert.equal(nextTeam?.lineup.some((slot) => slot.playerId === dismissedId), false);
  assert.equal(
    nextTeam?.unavailable.some((entry) => entry.playerId === dismissedId && entry.reason === "dismissed"),
    true,
  );
  // The command has to survive the canonical path, or the reorganization is
  // only correct in this test.
  const applied = applyAiInGameDecision(policyInput(session, "away", [], undefined, away.players));
  assert.equal(applied.facts.some((fact) => fact.type === "substitution"), true);
  assert.equal(applied.selection.reasons.some((entry) => entry.reasonKey === "command_rejected"), false);
  assert.equal(applied.session.away.unavailable.some((entry) => entry.playerId === dismissedId), true);
});

test("the man who makes way for the substitute keeper is an attacker", () => {
  const away = withReserveGoalkeeper(teamFixture("away"));
  const session = sessionFixture({
    phase: "second_half",
    minute: 55,
    pauseReason: "selected_club_red_card",
    away: away.team,
    pendingDecision: { type: "red_card_reorganization", minute: 55, side: "away", playerId: awayXi(1) },
  });

  const selection = selectAiInGameDecision(policyInput(session, "away", [], undefined, away.players));
  const sacrificedId = selection.command?.substitutions[0]?.outgoingPlayerId;
  const sacrificedRole = away.team.lineup.find((slot) => slot.playerId === sacrificedId)?.role;

  assert.equal(sacrificedRole, "striker");
});

/**
 * Holds the last resort to the same football fact the batch path uses.
 *
 * With no substitute keeper the gloves still have to go somewhere, and the man
 * who gets them is the best pair of hands on the pitch - not the last slot in
 * the alphabet, which is what this used to compute.
 */
test("with no substitute keeper the gloves go to the best hands left on the pitch", () => {
  const handiestId = awayXi(4);
  const players = {
    ...playerLookup(),
    [handiestId]: withGoalkeepingHands(playerLookup()[handiestId] as Player, 18),
  };
  const session = sessionFixture({
    phase: "second_half",
    minute: 55,
    pauseReason: "selected_club_red_card",
    pendingDecision: { type: "red_card_reorganization", minute: 55, side: "away", playerId: awayXi(1) },
  });

  const selection = selectAiInGameDecision(policyInput(session, "away", [], undefined, players));
  const inGoal = selection.command?.nextTeam.lineup.find((slot) => slot.role === "goalkeeper");

  assert.equal(selection.command?.substitutions.length, 0);
  assert.equal(inGoal?.playerId, handiestId);
});

test("ordinary manual pause outside a decision boundary produces no cosmetic change", () => {
  const session = sessionFixture({ phase: "second_half", minute: 55, pauseReason: "manual" });
  const selection = selectAiInGameDecision(policyInput(session, "away"));

  assert.equal(selection.command, undefined);
  assert.deepEqual(selection.reasons.map((entry) => entry.reasonKey), ["no_material_change"]);
});

test("routine late-match workload can trigger one credible fresh-leg substitution", () => {
  const session = sessionFixture({ phase: "second_half", minute: 70, pauseReason: "manual" });
  const tiredPlayerId = awayXi(11);
  const selection = selectAiInGameDecision(policyInput(
    session,
    "away",
    [signal(tiredPlayerId, 6.4, 94.4)],
  ));

  assert.equal(selection.command?.substitutions.length, 1);
  assert.equal(selection.command?.substitutions[0]?.outgoingPlayerId, tiredPlayerId);
  assert.equal(selection.reasons[0]?.reasonKey, "low_condition");
  const applied = applyAiInGameDecision(policyInput(session, "away", [signal(tiredPlayerId, 6.4, 94.4)]));
  assert.equal(applied.facts.some((fact) => fact.type === "substitution"), true);
  assert.equal(applied.selection.reasons.some((entry) => entry.reasonKey === "command_rejected"), false);
});

test("low condition can open a measured three-point opportunity to the reserve", () => {
  const session = sessionFixture({ phase: "second_half", minute: 70, pauseReason: "manual" });
  const tiredPlayerId = awayXi(11);
  const reservePlayerId = awayBench(1);
  const players = playerLookup();
  players[tiredPlayerId] = playerFixture(tiredPlayerId, "striker", 12);
  players[reservePlayerId] = playerFixture(reservePlayerId, "striker", 9);

  const selection = selectAiInGameDecision(policyInput(
    session,
    "away",
    [signal(tiredPlayerId, 6.4, 94.4)],
    undefined,
    players,
  ));

  assert.equal(selection.command?.substitutions[0]?.outgoingPlayerId, tiredPlayerId);
  assert.equal(selection.command?.substitutions[0]?.incomingPlayerId, reservePlayerId);
  assert.equal(selection.reasons[0]?.reasonKey, "low_condition");
});

test("routine policy tries the next tired player when the first has no legal replacement", () => {
  // Only the substitute striker is still available, so the tired right back
  // genuinely cannot be covered and the policy must fall through to the tired
  // striker rather than stop at the first candidate it considered.
  const session = sessionFixture({
    phase: "second_half",
    minute: 70,
    pauseReason: "manual",
    away: onlyStrikerOnBench(teamFixture("away")),
  });
  const selection = selectAiInGameDecision(policyInput(
    session,
    "away",
    [
      signal(awayXi(2), 6.4, 94),
      signal(awayXi(11), 6.4, 94.4),
    ],
  ));

  assert.equal(selection.command?.substitutions[0]?.outgoingPlayerId, awayXi(11));
  assert.equal(selection.reasons[0]?.reasonKey, "low_condition");
});

/**
 * Fixes the one selection scale a routine substitution is judged on (Step 09).
 *
 * The permitted regressions are ability points, and until the AI selector and
 * this policy shared one scale they were compared against scores where a single
 * suitability step was worth `10`. No adapted footballer could clear a
 * regression of `2`, so a squad's real cover never came on and the thresholds
 * that read like football policy decided nothing at all.
 */
test("a right wing-back is legal cover for a tired right back", () => {
  const session = sessionFixture({ phase: "second_half", minute: 70, pauseReason: "manual" });
  const selection = selectAiInGameDecision(policyInput(
    session,
    "away",
    [signal(awayXi(2), 6.4, 94)],
  ));

  assert.equal(selection.command?.substitutions[0]?.outgoingPlayerId, awayXi(2));
  assert.equal(selection.command?.substitutions[0]?.incomingPlayerId, awayBench(5));
  assert.equal(selection.reasons[0]?.suitability, "adapted");
});

test("routine decision boundary does not replace a player before meaningful workload", () => {
  const session = sessionFixture({ phase: "second_half", minute: 60, pauseReason: "manual" });
  const selection = selectAiInGameDecision(policyInput(
    session,
    "away",
    [signal(awayXi(2), 6.4, 96)],
  ));

  assert.equal(selection.command, undefined);
  assert.deepEqual(selection.reasons.map((entry) => entry.reasonKey), ["no_material_change"]);
});

test("forced injury without a legal replacement leaves ten players without bypassing competition rules", () => {
  const baseHome = teamFixture("home");
  const exhaustedHome = { ...baseHome, substitutionsUsed: RULES.maximumSubstitutions };
  const session = sessionFixture({
    phase: "second_half",
    minute: 78,
    pauseReason: "forced_injury",
    score: { home: 0, away: 1 },
    home: exhaustedHome,
    pendingDecision: {
      type: "forced_injury",
      minute: 78,
      side: "home",
      playerId: homeXi(4),
      severity: "serious",
    },
  });
  const selection = selectAiInGameDecision(policyInput(session, "home"));

  assert.equal(selection.command?.substitutions.length, 0);
  assert.equal(selection.command?.nextTeam.lineup.length, 10);
  assert.equal(selection.command?.nextTeam.unavailable.some((entry) => entry.playerId === homeXi(4)), true);
  assert.equal(selection.reasons[0]?.reasonKey, "no_legal_substitute");
  assert.equal(selection.reasons[0]?.replacementFailureKey, "substitution_limit");
  assert.deepEqual(validateLiveMatchCommand(session, selection.command!, RULES), { accepted: true });
});

test("progressive AI uses the canonical command path and resumes an internally paused minute", () => {
  const domainSession = sessionFixture({
    phase: "second_half",
    minute: 60,
    pauseReason: "manual",
    score: { home: 1, away: 0 },
  });
  const state = progressiveStateAtMinute(60, { home: 1, away: 0 });
  const applied = applyProgressiveAiInGameDecisions({
    state,
    session: domainSession,
    side: "away",
    rules: RULES,
    players: playerLookup(),
    playerSignals: [signal(awayXi(11), 5.5, 82)],
    buildMatchTeamContext: matchTeamContextFromLiveTeam,
  });

  assert.equal(applied.state.runState, "running");
  assert.equal(applied.state.pauseReason, undefined);
  assert.equal(applied.state.appliedSubstitutions.length, 1);
  assert.equal(applied.state.events.at(-1)?.type, "substitution");
  assert.equal(applied.team.substitutionsUsed, 1);
  assert.equal(applied.decisions.length, 2);
});

test("progressive AI resolves a forced injury before a routine boundary in the same minute", () => {
  const injuredPlayerId = awayXi(3);
  const tiredPlayerId = awayXi(11);
  const domainSession = sessionFixture({
    phase: "second_half",
    minute: 60,
    pauseReason: "manual",
    score: { home: 1, away: 0 },
  });
  const baseState = progressiveStateAtMinute(60, { home: 1, away: 0 });
  const state: ProgressiveMatchSessionState = {
    ...baseState,
    events: [{
      type: "injury",
      minute: 60,
      side: "away",
      playerId: injuredPlayerId,
      severity: "moderate",
    }],
  };
  const applied = applyProgressiveAiInGameDecisions({
    state,
    session: domainSession,
    side: "away",
    rules: RULES,
    players: playerLookup(),
    playerSignals: [
      signal(injuredPlayerId, 6.4, 95.4),
      signal(tiredPlayerId, 6.4, 95.4),
    ],
    buildMatchTeamContext: matchTeamContextFromLiveTeam,
  });

  assert.equal(applied.decisions.length, 1);
  assert.equal(applied.decisions.some((decision) =>
    decision.selection.reasons.some((entry) => entry.reasonKey === "command_rejected")
  ), false);
  assert.equal(applied.team.lineup.some((slot) => slot.playerId === injuredPlayerId), false);
  assert.equal(applied.team.unavailable.some((entry) => entry.playerId === injuredPlayerId), true);
  assert.equal(applied.team.substitutionsUsed, 1);
});

test("progressive AI uses a legal adapted replacement for a forced exit before considering routine work", () => {
  const injuredPlayerId = awayXi(2);
  const tiredPlayerId = awayXi(11);
  const domainSession = sessionFixture({
    phase: "second_half",
    minute: 60,
    pauseReason: "manual",
    score: { home: 1, away: 0 },
  });
  const baseState = progressiveStateAtMinute(60, { home: 1, away: 0 });
  const state: ProgressiveMatchSessionState = {
    ...baseState,
    events: [{
      type: "injury",
      minute: 60,
      side: "away",
      playerId: injuredPlayerId,
      severity: "moderate",
    }],
  };
  const applied = applyProgressiveAiInGameDecisions({
    state,
    session: domainSession,
    side: "away",
    rules: RULES,
    players: playerLookup(),
    playerSignals: [
      signal(injuredPlayerId, 6.4, 95.4),
      signal(tiredPlayerId, 6.4, 95.4),
    ],
    buildMatchTeamContext: matchTeamContextFromLiveTeam,
  });

  assert.equal(applied.decisions.length, 1);
  assert.equal(applied.decisions.some((decision) =>
    decision.selection.reasons.some((entry) => entry.reasonKey === "command_rejected")
  ), false);
  assert.equal(applied.team.lineup.some((slot) => slot.playerId === injuredPlayerId), false);
  assert.equal(applied.team.unavailable.some((entry) => entry.playerId === injuredPlayerId), true);
  assert.equal(applied.team.substitutionsUsed, 1);
});

test("progressive AI resolves a dismissal and forced injury without mixing in a routine change", () => {
  const dismissedPlayerId = awayXi(5);
  const injuredPlayerId = awayXi(3);
  const tiredPlayerId = awayXi(4);
  const domainSession = sessionFixture({
    phase: "second_half",
    minute: 60,
    pauseReason: "manual",
    score: { home: 1, away: 0 },
  });
  const baseState = progressiveStateAtMinute(60, { home: 1, away: 0 });
  const state: ProgressiveMatchSessionState = {
    ...baseState,
    events: [
      { type: "second_yellow_card", minute: 60, side: "away", playerId: dismissedPlayerId },
      { type: "injury", minute: 60, side: "away", playerId: injuredPlayerId, severity: "moderate" },
    ],
  };
  const applied = applyProgressiveAiInGameDecisions({
    state,
    session: domainSession,
    side: "away",
    rules: RULES,
    players: playerLookup(),
    playerSignals: [signal(tiredPlayerId, 6.4, 94)],
    buildMatchTeamContext: matchTeamContextFromLiveTeam,
  });

  assert.equal(applied.decisions.length, 2);
  assert.equal(applied.decisions.some((decision) =>
    decision.selection.reasons.some((entry) => entry.reasonKey === "command_rejected")
  ), false);
  assert.equal(applied.team.lineup.some((slot) => slot.playerId === dismissedPlayerId), false);
  assert.equal(applied.team.lineup.some((slot) => slot.playerId === injuredPlayerId), false);
  assert.equal(applied.team.unavailable.some((entry) =>
    entry.playerId === dismissedPlayerId && entry.reason === "dismissed"
  ), true);
  assert.equal(applied.team.unavailable.some((entry) =>
    entry.playerId === injuredPlayerId && entry.reason === "injured"
  ), true);
  assert.equal(applied.team.substitutionsUsed, 1);
});

test("progressive AI does no projection or command work on an ordinary minute", () => {
  const domainSession = sessionFixture({ phase: "second_half", minute: 61, pauseReason: "manual" });
  const state = progressiveStateAtMinute(61, { home: 0, away: 0 });
  let contextBuildCount = 0;
  const applied = applyProgressiveAiInGameDecisions({
    state,
    session: domainSession,
    side: "away",
    rules: RULES,
    players: playerLookup(),
    playerSignals: [],
    buildMatchTeamContext: (team) => {
      contextBuildCount += 1;
      return matchTeamContextFromLiveTeam(team);
    },
  });

  assert.equal(applied.state, state);
  assert.equal(applied.decisions.length, 0);
  assert.equal(contextBuildCount, 0);
});

test("the automated progressive runner applies the same AI to both declared sides", () => {
  const completed = runAutomatedProgressiveMatch({
    context: matchContextFixture(),
    rules: RULES,
    players: playerLookup(),
    home: teamFixture("home"),
    away: teamFixture("away"),
    aiControlledSides: ["home", "away"],
    buildMatchTeamContext: (team) => matchTeamContextFromLiveTeam(team),
  });

  assert.equal(completed.state.phase, "full_time");
  assert.equal(completed.state.simulation.minute, 90);
  assert.equal(completed.decisions.some(({ side }) => side === "home"), true);
  assert.equal(completed.decisions.some(({ side }) => side === "away"), true);
  assert.equal(completed.state.appliedSubstitutions.some(({ side }) => side === "home"), true);
  assert.equal(completed.state.appliedSubstitutions.some(({ side }) => side === "away"), true);
  assert.equal(
    completed.state.events.filter(({ type }) => type === "substitution").length,
    completed.state.appliedSubstitutions.length,
  );
});

test("the automated progressive runner never commands an undeclared manager side", () => {
  const completed = runAutomatedProgressiveMatch({
    context: matchContextFixture(),
    rules: RULES,
    players: playerLookup(),
    home: teamFixture("home"),
    away: teamFixture("away"),
    aiControlledSides: ["away"],
    buildMatchTeamContext: (team) => matchTeamContextFromLiveTeam(team),
  });

  assert.equal(completed.decisions.some(({ side }) => side === "home"), false);
  assert.equal(completed.state.appliedSubstitutions.some(({ side }) => side === "home"), false);
  assert.equal(completed.state.appliedSubstitutions.some(({ side }) => side === "away"), true);
});

const RULES: CompetitionMatchRules = {
  maximumSubstitutions: 5,
  substitutionWindowLimit: null,
  allowsPlayerReentry: false,
  yellowCardAccumulationThreshold: 5,
  straightRedSuspensionMatches: 2,
  secondYellowSuspensionMatches: 1,
  yellowAccumulationSuspensionMatches: 1,
};

const LINEUP_ROLES: readonly CanonicalPlayerRole[] = [
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

const ATTACKING_ROLES: readonly CanonicalPlayerRole[] = [
  "goalkeeper",
  "right_full_back",
  "center_back",
  "center_back",
  "left_full_back",
  "central_midfielder",
  "central_midfielder",
  "central_midfielder",
  "right_winger",
  "left_winger",
  "striker",
];

function policyInput(
  session: LiveMatchSession,
  side: MatchEventSide,
  signals: SelectAiInGameDecisionInput["playerSignals"] = [],
  formationOptions?: SelectAiInGameDecisionInput["formationOptions"],
  players: Record<PlayerId, Player> = playerLookup(),
): SelectAiInGameDecisionInput {
  return {
    session,
    side,
    rules: RULES,
    players,
    playerSignals: signals,
    ...(formationOptions === undefined ? {} : { formationOptions }),
  };
}

/** Gives one footballer real hands without touching the rest of him. */
function withGoalkeepingHands(player: Player, value: number): Player {
  const ability = abilityValue(value);

  return {
    ...player,
    abilities: {
      ...player.abilities,
      goalkeeping: { ...player.abilities.goalkeeping, reflexes: ability, handling: ability },
    },
  };
}

/** Puts a real reserve goalkeeper in the last bench place, as a named bench has. */
function withReserveGoalkeeper(team: LiveMatchTeamState): {
  readonly team: LiveMatchTeamState;
  readonly players: Record<PlayerId, Player>;
  readonly reserveGoalkeeperId: PlayerId;
} {
  const reserveGoalkeeperId = playerId(`player:${team.side}-reserve-gk`);
  const bench = team.bench.map((benchPlayer, index) => index === team.bench.length - 1
    ? { ...benchPlayer, playerId: reserveGoalkeeperId }
    : benchPlayer);

  return {
    team: { ...team, bench },
    players: { ...playerLookup(), [reserveGoalkeeperId]: playerFixture(reserveGoalkeeperId, "goalkeeper", 11) },
    reserveGoalkeeperId,
  };
}

function sessionFixture(input: {
  readonly phase: LiveMatchSession["phase"];
  readonly minute: number;
  readonly pauseReason: LiveMatchSession["pauseReason"];
  readonly score?: LiveMatchSession["score"];
  readonly home?: LiveMatchTeamState;
  readonly away?: LiveMatchTeamState;
  readonly pendingDecision?: LiveMatchPendingDecision;
}): LiveMatchSession {
  const score = input.score ?? { home: 0, away: 0 };
  return createLiveMatchSession({
    fixtureId: fixtureId("fixture:ai-in-game"),
    controlledSide: "home",
    phase: input.phase,
    currentMinute: input.minute,
    runState: "paused",
    ...(input.pauseReason === undefined ? {} : { pauseReason: input.pauseReason }),
    score,
    statistics: createLiveMatchStatistics({
      home: sideStatistics(score.home),
      away: sideStatistics(score.away),
    }),
    home: input.home ?? teamFixture("home"),
    away: input.away ?? teamFixture("away"),
    events: [],
    substitutions: [],
    ...(input.pendingDecision === undefined ? {} : { pendingDecision: input.pendingDecision }),
  }, RULES);
}

function teamFixture(side: MatchEventSide): LiveMatchTeamState {
  return {
    side,
    formation: "4-4-2",
    lineup: LINEUP_ROLES.map((role, index) => ({
      slotId: `${side}:xi:${index + 1}`,
      playerId: side === "home" ? homeXi(index + 1) : awayXi(index + 1),
      role,
      nx: index === 0 ? 0.5 : 0.1 + (index % 5) * 0.2,
      ny: index === 0 ? 0.92 : 0.75 - Math.floor((index - 1) / 4) * 0.25,
    })),
    bench: Array.from({ length: 8 }, (_, index) => ({
      slotId: `${side}:bench:${index + 1}`,
      playerId: side === "home" ? homeBench(index + 1) : awayBench(index + 1),
      status: "available" as const,
    })),
    unavailable: [],
    substitutionsUsed: 0,
    tactic: createTacticSetup({ mentality: "balanced", pressing: 0.5, directness: 0.5, width: 0.5, risk: 0.5 }),
  };
}

/** Leaves one substitute striker as the only footballer this team can bring on. */
function onlyStrikerOnBench(team: LiveMatchTeamState): LiveMatchTeamState {
  return {
    ...team,
    bench: team.bench.map((benchPlayer, index) => ({
      ...benchPlayer,
      status: index === 0 ? "available" as const : "substituted_out" as const,
    })),
  };
}

function progressiveStateAtMinute(
  minute: number,
  score: LiveMatchSession["score"],
): ProgressiveMatchSessionState {
  const initial = resumeProgressiveMatchSession(createProgressiveMatchSession(
    matchContextFixture(),
    {
      home: { bench: teamFixture("home").bench, unavailable: [] },
      away: { bench: teamFixture("away").bench, unavailable: [] },
    },
    { controlledSide: "home" },
  ));
  return {
    ...initial,
    simulation: { ...initial.simulation, minute, score },
    phase: minute <= 45 ? "first_half" : "second_half",
    runState: "running",
  };
}

function matchContextFixture(): MatchContext {
  return {
    fixtureId: fixtureId("fixture:ai-progressive"),
    seed: "phase-77-ai-progressive",
    home: matchTeamContextFromLiveTeam(teamFixture("home")),
    away: matchTeamContextFromLiveTeam(teamFixture("away")),
    engineConfig: matchEngineConfigFixture(),
    matchTacticsCalibration: matchTacticsCalibrationFixture(),
  };
}

function matchTeamContextFromLiveTeam(team: LiveMatchTeamState): MatchTeamContext {
  return withNeutralIncidentProfiles({
    clubId: clubId(`club:${team.side}`),
    lineup: team.lineup.map((slot) => createLineupSlot({
      slotId: slot.slotId,
      playerId: slot.playerId,
      canonicalRole: slot.role,
    })),
    strength: { attack: 10, midfield: 10, defense: 10, goalkeeper: 10, overall: 10 },
    shape: tacticalShapeProfileFixture(),
    tacticalDistribution: {
      directness: team.tactic.directness,
      pressing: team.tactic.pressing,
      width: team.tactic.width,
      risk: team.tactic.risk,
      mentality: "balanced",
    },
  });
}

function matchEngineConfigFixture(): MatchEngineConfig {
  return {
    minuteCount: 90,
    rates: { baseOpportunityRatePerMinute: 0.1, maxOpportunityRatePerMinute: 0.3 },
    conversionBands: [{
      bandKey: "all",
      minQualityInclusive: 0,
      maxQualityExclusive: 1.01,
      goalProbability: 0.2,
    }],
    homeAdvantageFactor: 1.05,
    strengthGapMultiplier: 1,
    discipline: matchDisciplineConfigFixture(),
    tacticalDistributionCaps: {
      directness: { minInclusive: 0, maxInclusive: 1 },
      pressing: { minInclusive: 0, maxInclusive: 1 },
      width: { minInclusive: 0, maxInclusive: 1 },
      risk: { minInclusive: 0, maxInclusive: 1 },
    },
  };
}

function playerLookup(): Record<PlayerId, Player> {
  const entries: Array<readonly [PlayerId, Player]> = [];
  for (const side of ["home", "away"] as const) {
    LINEUP_ROLES.forEach((role, index) => {
      const id = side === "home" ? homeXi(index + 1) : awayXi(index + 1);
      entries.push([id, playerFixture(id, role, index === 10 ? 9 : 10)]);
    });
    for (let index = 1; index <= 8; index += 1) {
      const id = side === "home" ? homeBench(index) : awayBench(index);
      const role = index === 1
        ? "striker"
        : LINEUP_ROLES[Math.min(index, LINEUP_ROLES.length - 1)] ?? "central_midfielder";
      entries.push([id, playerFixture(id, role, index === 1 ? 12 : 10)]);
    }
  }
  return Object.fromEntries(entries) as Record<PlayerId, Player>;
}

function playerFixture(id: PlayerId, canonicalRole: CanonicalPlayerRole, value: number): Player {
  const { position, role } = identityFor(canonicalRole);
  return {
    id,
    firstName: "Test",
    lastName: String(id),
    birthDate: 10_000 as Player["birthDate"],
    naturalPositions: [position],
    primaryRole: role,
    naturalRoles: [role],
    adaptedRoles: [],
    weakRoles: [],
    roleFamiliarity: { [role]: "natural" },
    abilities: abilitiesFixture(value),
    potential: abilitiesFixture(value),
  };
}

function identityFor(role: CanonicalPlayerRole): { readonly position: PlayerPosition; readonly role: PlayerRole } {
  switch (role) {
    case "goalkeeper": return { position: "gk", role: "goalkeeper" };
    case "right_full_back": return { position: "rb", role: "full_back" };
    case "left_full_back": return { position: "lb", role: "full_back" };
    case "center_back": return { position: "cb", role: "center_back" };
    case "defensive_midfielder": return { position: "dm", role: "defensive_midfielder" };
    case "central_midfielder": return { position: "cm", role: "central_midfielder" };
    case "right_midfielder": return { position: "rwb", role: "wide_midfielder" };
    case "left_midfielder": return { position: "lwb", role: "wide_midfielder" };
    case "attacking_midfielder": return { position: "am", role: "attacking_midfielder" };
    case "right_winger": return { position: "rw", role: "winger" };
    case "left_winger": return { position: "lw", role: "winger" };
    case "striker": return { position: "st", role: "striker" };
  }
}

function abilitiesFixture(value: number): Player["abilities"] {
  const ability = abilityValue(value);
  return {
    technical: { finishing: ability, passing: ability, longPassing: ability, crossing: ability, dribbling: ability, technique: ability, tackling: ability, penalties: ability, freeKicks: ability },
    physical: { pace: ability, strength: ability, stamina: ability, agility: ability, heading: ability },
    mental: { positioning: ability, vision: ability, anticipation: ability, composure: ability, determination: ability, leadership: ability },
    goalkeeping: { reflexes: ability, handling: ability, rushingOut: ability, goalkeeperPositioning: ability, footwork: ability },
  };
}

function sideStatistics(goals: number) {
  return {
    possessionShare: 0,
    shots: goals,
    shotsOnTarget: goals,
    expectedGoals: goals,
    corners: 0,
    fouls: 0,
    yellowCards: 0,
    redCards: 0,
    saves: 0,
    goals,
  };
}

function signal(id: PlayerId, rating: number, condition: number) {
  return { playerId: id, rating, condition };
}

function homeXi(index: number): PlayerId {
  return playerId(`player:home-xi-${index}`);
}

function awayXi(index: number): PlayerId {
  return playerId(`player:away-xi-${index}`);
}

function homeBench(index: number): PlayerId {
  return playerId(`player:home-bench-${index}`);
}

function awayBench(index: number): PlayerId {
  return playerId(`player:away-bench-${index}`);
}
