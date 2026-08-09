import {
  accruePlayerFixtureParticipations,
  createEmptyPlayerParticipationLedger,
  createCareerState,
  isCanonicalPlayerRole,
  playerParticipationRowKey,
  type AppliedMatchSubstitution,
  type CanonicalPlayerRole,
  type CareerState,
  type FixtureId,
  type GameDate,
  type PlayerFixtureParticipationContribution,
  type PlayerParticipationLedger,
  type PlayerId,
  type SeasonId,
} from "@game/domain";

import type { MatchSide, MatchTeamContext, PlayerMatchRatingRow } from "../match-engine/index.ts";
import { monthKeyForCareerDate } from "./advance-career-month.ts";

/** Exact recent-use facts consumed by the AI squad selector. */
export interface RecentPlayerUse {
  readonly recentMinutes: number;
  readonly recentStarts: number;
}

/** Input for projecting one fixture's recent use from the canonical ledger. */
export interface RecentPlayerUseForFixtureInput {
  readonly ledger: PlayerParticipationLedger | undefined;
  /** Ordered current-competition facts not consolidated into the ledger yet. */
  readonly pendingContributions?: readonly PlayerFixtureParticipationContribution[];
  readonly seasonId: SeasonId;
  readonly fixtureDate: GameDate;
  readonly playerIds: readonly PlayerId[];
}

/**
 * Projects month-to-date load without inventing a second rolling counter.
 *
 * The durable ledger owns monthly resolution, so both played careers and batch
 * seasons ask this function the same question and receive stable player-ID
 * traversal in the explicit input order.
 */
export function recentPlayerUseForFixture(
  input: RecentPlayerUseForFixtureInput,
): Readonly<Partial<Record<PlayerId, RecentPlayerUse>>> {
  const monthKey = monthKeyForCareerDate(input.fixtureDate);
  const recentUse: Partial<Record<PlayerId, RecentPlayerUse>> = {};
  const requestedPlayers = new Set(input.playerIds);
  const pendingByPlayer = new Map<PlayerId, RecentPlayerUse>();
  for (const contribution of input.pendingContributions ?? []) {
    if (
      !requestedPlayers.has(contribution.playerId)
      || contribution.seasonId !== input.seasonId
      || contribution.monthKey !== monthKey
    ) continue;
    const previous = pendingByPlayer.get(contribution.playerId) ?? { recentMinutes: 0, recentStarts: 0 };
    pendingByPlayer.set(contribution.playerId, {
      recentMinutes: previous.recentMinutes + contribution.minutes,
      recentStarts: previous.recentStarts + (contribution.started ? 1 : 0),
    });
  }

  for (const playerId of input.playerIds) {
    const row = input.ledger?.rows[playerParticipationRowKey(input.seasonId, monthKey, playerId)];
    const pending = pendingByPlayer.get(playerId);
    const recentMinutes = (row?.minutes ?? 0) + (pending?.recentMinutes ?? 0);
    const recentStarts = (row?.starts ?? 0) + (pending?.recentStarts ?? 0);
    if (recentMinutes === 0 && recentStarts === 0) continue;
    recentUse[playerId] = { recentMinutes, recentStarts };
  }

  return recentUse;
}

/** One match side plus the bench facts needed to build participation rows. */
export interface FixtureParticipationSideContext {
  /** Side label used by match events and substitutions. */
  readonly side: MatchSide;
  /** Final match context for the side after any half-time substitutions. */
  readonly finalContext: MatchTeamContext;
  /** Initial match context for the side before any half-time substitutions. */
  readonly initialContext: MatchTeamContext;
  /** Bench player IDs available for this side, used to record unused bench facts. */
  readonly benchPlayerIds?: readonly PlayerId[];
}

/** Input for deriving fixture participation from committed structured facts. */
export interface BuildFixtureParticipationContributionsInput {
  /** Fixture that produced the participation facts. */
  readonly fixtureId: FixtureId;
  /** Season that owns the fixture. */
  readonly seasonId: SeasonId;
  /** Fixture date used to choose the development month. */
  readonly fixtureDate: GameDate;
  /** Final simulated minute, usually 90 for regulation league matches. */
  readonly finalMinute: number;
  /** Both match sides with initial/final lineups. */
  readonly sides: readonly FixtureParticipationSideContext[];
  /** Accepted substitution facts emitted by staged match progression. */
  readonly appliedSubstitutions?: readonly AppliedMatchSubstitution[];
  /** Dismissal or time-loss injury exits that ended a player's minutes. */
  readonly playerExits?: readonly {
    readonly side: MatchSide;
    readonly playerId: PlayerId;
    readonly minute: number;
  }[];
  /** Event-derived ratings from the final staged match snapshot. */
  readonly playerRatings?: readonly PlayerMatchRatingRow[];
}

/** Deterministic result of fixture participation derivation. */
export interface BuildFixtureParticipationContributionsResult {
  /** Contributions ready to accrue into the durable domain ledger. */
  readonly contributions: readonly PlayerFixtureParticipationContribution[];
}

/** Input for accruing committed fixture participation into a career state. */
export interface AccrueCommittedFixtureParticipationInput extends BuildFixtureParticipationContributionsInput {
  /** Career state that already owns the committed fixture result. */
  readonly careerState: CareerState;
}

/** Input for reducing already-derived fixture contributions into a career. */
export interface AccrueFixtureParticipationContributionsInput {
  /** Career state whose current-season ledger receives the contributions. */
  readonly careerState: CareerState;
  /** Canonical contributions emitted by the committed match owner. */
  readonly contributions: readonly PlayerFixtureParticipationContribution[];
}

/**
 * Builds exact starter, substitute, and unused-bench participation rows.
 *
 * This helper uses only committed structured facts: initial lineups,
 * accepted substitutions, final minute, and final ratings. It never infers
 * minutes from UI state.
 */
export function buildFixtureParticipationContributions(
  input: BuildFixtureParticipationContributionsInput,
): BuildFixtureParticipationContributionsResult {
  const ratingByPlayer = new Map((input.playerRatings ?? []).map((row) => [row.playerId, row.rating]));
  const substitutions = input.appliedSubstitutions ?? [];
  const playerExits = input.playerExits ?? [];
  const monthKey = monthKeyForFixtureDate(input.fixtureDate);
  const contributions = new Map<PlayerId, PlayerFixtureParticipationContribution>();

  for (const side of input.sides) {
    const sideSubstitutions = substitutions.filter((substitution) => substitution.side === side.side);
    const sideExits = playerExits.filter((exit) => exit.side === side.side);
    const incomingIds = new Set(sideSubstitutions.map((substitution) => substitution.incomingPlayerId));
    const starterIds = new Set(side.initialContext.lineup.map((slot) => slot.playerId));

    for (const slot of side.initialContext.lineup) {
      const minutes = playedMinutes({
        playerId: slot.playerId,
        enteredAt: 0,
        finalMinute: input.finalMinute,
        substitutions: sideSubstitutions,
        exits: sideExits,
      });

      contributions.set(slot.playerId, createContribution({
        input,
        playerId: slot.playerId,
        clubId: side.initialContext.clubId,
        monthKey,
        started: true,
        substituteAppearance: false,
        minutes,
        role: slot.canonicalRole,
        rating: ratingByPlayer.get(slot.playerId),
      }));
    }

    for (const substitution of sideSubstitutions) {
      const slot = side.initialContext.lineup.find((candidate) => candidate.slotId === substitution.slotId);
      const minutes = playedMinutes({
        playerId: substitution.incomingPlayerId,
        enteredAt: substitution.minute,
        finalMinute: input.finalMinute,
        substitutions: sideSubstitutions,
        exits: sideExits,
      });

      contributions.set(substitution.incomingPlayerId, createContribution({
        input,
        playerId: substitution.incomingPlayerId,
        clubId: side.initialContext.clubId,
        monthKey,
        started: false,
        substituteAppearance: true,
        minutes,
        role: slot?.canonicalRole ?? replacementCanonicalRole(side.finalContext, substitution.incomingPlayerId),
        rating: ratingByPlayer.get(substitution.incomingPlayerId),
      }));
    }

    for (const playerId of side.benchPlayerIds ?? []) {
      if (starterIds.has(playerId) || incomingIds.has(playerId) || contributions.has(playerId)) {
        continue;
      }

      contributions.set(playerId, createContribution({
        input,
        playerId,
        clubId: side.initialContext.clubId,
        monthKey,
        started: false,
        substituteAppearance: false,
        minutes: 0,
        role: "central_midfielder",
        rating: undefined,
      }));
    }
  }

  return { contributions: [...contributions.values()] };
}

/** Calculates one continuous appearance interval, including substitute chains. */
function playedMinutes(input: {
  readonly playerId: PlayerId;
  readonly enteredAt: number;
  readonly finalMinute: number;
  readonly substitutions: readonly AppliedMatchSubstitution[];
  readonly exits: readonly { readonly playerId: PlayerId; readonly minute: number }[];
}): number {
  const substitutionExit = input.substitutions.find(
    ({ outgoingPlayerId, minute }) => outgoingPlayerId === input.playerId && minute >= input.enteredAt,
  )?.minute;
  const incidentExit = input.exits.find(
    ({ playerId, minute }) => playerId === input.playerId && minute >= input.enteredAt,
  )?.minute;
  const exitMinute = Math.min(
    substitutionExit ?? input.finalMinute,
    incidentExit ?? input.finalMinute,
    input.finalMinute,
  );
  return Math.max(0, exitMinute - input.enteredAt);
}

/**
 * Accrues one committed fixture into the durable career participation ledger.
 */
export function accrueCommittedFixtureParticipation(
  input: AccrueCommittedFixtureParticipationInput,
): CareerState {
  const { contributions } = buildFixtureParticipationContributions(input);
  return accrueFixtureParticipationContributions({
    careerState: input.careerState,
    contributions,
  });
}

/**
 * Reduces canonical fixture contributions into the durable monthly ledger.
 *
 * Batch-season adapters use this after `simulateSeason` has already derived
 * contributions from the exact match contexts. Keeping the reduction here
 * preserves domain validation and fixture-idempotency for every caller.
 */
export function accrueFixtureParticipationContributions(
  input: AccrueFixtureParticipationContributionsInput,
): CareerState {
  const baseLedger = input.careerState.playerParticipationLedger
    ?? createEmptyPlayerParticipationLedger();
  const playerParticipationLedger = accruePlayerFixtureParticipations(
    baseLedger,
    input.contributions,
  );

  return createCareerState({
    ...input.careerState,
    playerParticipationLedger,
  });
}

function createContribution(input: {
  readonly input: BuildFixtureParticipationContributionsInput;
  readonly playerId: PlayerId;
  readonly clubId: MatchTeamContext["clubId"];
  readonly monthKey: string;
  readonly started: boolean;
  readonly substituteAppearance: boolean;
  readonly minutes: number;
  readonly role: CanonicalPlayerRole;
  readonly rating: number | undefined;
}): PlayerFixtureParticipationContribution {
  return {
    fixtureId: input.input.fixtureId,
    playerId: input.playerId,
    clubId: input.clubId,
    seasonId: input.input.seasonId,
    monthKey: input.monthKey,
    started: input.started,
    substituteAppearance: input.substituteAppearance,
    minutes: input.minutes,
    ...(input.rating === undefined ? {} : { rating: input.rating }),
    playedRoleMinutes: input.minutes === 0 ? {} : { [input.role]: input.minutes },
  };
}

function monthKeyForFixtureDate(date: GameDate): string {
  const { year, month } = civilDateFromEpochDay(Number(date));
  return `${year}-${String(month).padStart(2, "0")}`;
}

function civilDateFromEpochDay(epochDay: number): { readonly year: number; readonly month: number } {
  const shiftedDay = epochDay + 719_468;
  const era = Math.floor(shiftedDay / 146_097);
  const dayOfEra = shiftedDay - era * 146_097;
  const yearOfEra = Math.floor((dayOfEra - Math.floor(dayOfEra / 1_460) + Math.floor(dayOfEra / 36_524) - Math.floor(dayOfEra / 146_096)) / 365);
  const yearDay = dayOfEra - (365 * yearOfEra + Math.floor(yearOfEra / 4) - Math.floor(yearOfEra / 100));
  const monthPrime = Math.floor((5 * yearDay + 2) / 153);
  const month = monthPrime < 10 ? monthPrime + 3 : monthPrime - 9;
  const year = era * 400 + yearOfEra + (month <= 2 ? 1 : 0);

  return { year, month };
}

/**
 * Reads the canonical role of a substitute from the team that finished the match.
 *
 * A substitute has no slot in the starting lineup, so the role he actually
 * played is only knowable from the final context. When even that has lost him -
 * he came on and went straight back off - the participation record keeps a
 * neutral central role rather than inventing a specialised one.
 */
function replacementCanonicalRole(context: MatchTeamContext, incomingPlayerId: PlayerId): CanonicalPlayerRole {
  return context.lineup.find((slot) => slot.playerId === incomingPlayerId)?.canonicalRole ?? "central_midfielder";
}
