import {
  accruePlayerFixtureParticipation,
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
        monthKey,
        started: true,
        substituteAppearance: false,
        minutes,
        role: canonicalRoleForRoleKey(slot.roleKey),
        rating: ratingByPlayer.get(slot.playerId),
      }));
    }

    for (const substitution of sideSubstitutions) {
      const slot = side.initialContext.lineup.find((candidate) => candidate.slotId === substitution.slotId);
      const minutes = Math.max(0, input.finalMinute - substitution.minute);

      contributions.set(substitution.incomingPlayerId, createContribution({
        input,
        playerId: substitution.incomingPlayerId,
        monthKey,
        started: false,
        substituteAppearance: true,
        minutes,
        role: canonicalRoleForRoleKey(slot?.roleKey ?? replacementRoleKey(side.finalContext, substitution.incomingPlayerId)),
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
  const baseLedger = input.careerState.playerParticipationLedger ?? createEmptyPlayerParticipationLedger();
  const { contributions } = buildFixtureParticipationContributions(input);
  const playerParticipationLedger = contributions.reduce(
    (ledger, contribution) => accruePlayerFixtureParticipation(ledger, contribution),
    baseLedger,
  );

  return createCareerState({
    ...input.careerState,
    playerParticipationLedger,
  });
}

function createContribution(input: {
  readonly input: BuildFixtureParticipationContributionsInput;
  readonly playerId: PlayerId;
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

function replacementRoleKey(context: MatchTeamContext, incomingPlayerId: PlayerId): string {
  return context.lineup.find((slot) => slot.playerId === incomingPlayerId)?.roleKey ?? "central_midfielder";
}

function canonicalRoleForRoleKey(roleKey: string): CanonicalPlayerRole {
  if (isCanonicalPlayerRole(roleKey)) {
    return roleKey;
  }

  switch (roleKey) {
    case "gk":
    case "goalkeeper":
      return "goalkeeper";
    case "defender":
      return "center_back";
    case "attacker":
      return "striker";
    case "midfielder":
    case "balanced":
    case "starter":
    default:
      return "central_midfielder";
  }
}
