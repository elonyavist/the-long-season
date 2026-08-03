import {
  accruePlayerFixtureParticipations,
  createEmptyPlayerParticipationLedger,
  createCareerState,
  isCanonicalPlayerRole,
  type AppliedMatchSubstitution,
  type CanonicalPlayerRole,
  type CareerState,
  type FixtureId,
  type GameDate,
  type PlayerFixtureParticipationContribution,
  type PlayerId,
  type SeasonId,
} from "@game/domain";

import type { MatchSide, MatchTeamContext, PlayerMatchRatingRow } from "../match-engine/index.ts";

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
  const monthKey = monthKeyForFixtureDate(input.fixtureDate);
  const contributions = new Map<PlayerId, PlayerFixtureParticipationContribution>();

  for (const side of input.sides) {
    const sideSubstitutions = substitutions.filter((substitution) => substitution.side === side.side);
    const incomingIds = new Set(sideSubstitutions.map((substitution) => substitution.incomingPlayerId));
    const starterIds = new Set(side.initialContext.lineup.map((slot) => slot.playerId));

    for (const slot of side.initialContext.lineup) {
      const substitution = sideSubstitutions.find((candidate) => candidate.outgoingPlayerId === slot.playerId);
      const minutes = substitution?.minute ?? input.finalMinute;

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
      const minutes = Math.max(0, input.finalMinute - substitution.minute);

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
