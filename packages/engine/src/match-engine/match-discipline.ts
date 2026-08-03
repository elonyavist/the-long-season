import type {
  FoulMatchEvent,
  MatchEventSide,
  PenaltyAwardedMatchEvent,
  PenaltyOutcome,
  PenaltyOutcomeMatchEvent,
  PlayerId,
  RedCardMatchEvent,
  SecondYellowCardMatchEvent,
  YellowCardMatchEvent,
} from "@game/domain";
import { deriveRng } from "@game/shared";

import type { MatchPlayerIncidentProfile, MatchTeamContext } from "./match-context.ts";
import type { MatchSimulationState, MatchSimulationTelemetry } from "./match-simulation-state.ts";

/** Structured discipline facts produced for one defending side in one minute. */
export interface MatchDisciplineResolution {
  readonly events: readonly MatchDisciplineEvent[];
  readonly dismissedPlayerId?: PlayerId;
  readonly penalty?: MatchPenaltyResolution;
}

/** Incident events emitted by the disciplinary policy. */
export type MatchDisciplineEvent =
  | FoulMatchEvent
  | YellowCardMatchEvent
  | SecondYellowCardMatchEvent
  | RedCardMatchEvent
  | PenaltyAwardedMatchEvent
  | PenaltyOutcomeMatchEvent;

/** Penalty outcome details consumed by the ordinary score/stat pipeline. */
export interface MatchPenaltyResolution {
  readonly side: MatchEventSide;
  readonly takerPlayerId: PlayerId;
  readonly goalkeeperPlayerId: PlayerId;
  readonly outcome: PenaltyOutcome;
}

/** Resolves at most one causal foul for one defending side and minute. */
export function resolveMatchMinuteDiscipline(
  simulation: MatchSimulationState,
  telemetry: MatchSimulationTelemetry,
  minute: number,
  defendingSide: MatchEventSide,
): MatchDisciplineResolution {
  const attackingSide = oppositeSide(defendingSide);
  const defendingTeam = teamFor(simulation, defendingSide);
  const attackingTeam = teamFor(simulation, attackingSide);
  const eligibleDefenders = defendingTeam.lineup.filter((slot) => slot.canonicalRole !== "goalkeeper");
  const eligibleAttackers = attackingTeam.lineup.filter((slot) => slot.canonicalRole !== "goalkeeper");
  if (eligibleDefenders.length === 0 || eligibleAttackers.length === 0) return { events: [] };

  const rng = deriveRng(
    simulation.context.seed,
    "match-discipline",
    simulation.context.fixtureId,
    minute,
    defendingSide,
  );
  const committedBy = eligibleDefenders[rng.nextInt(0, eligibleDefenders.length)];
  const sufferedBy = eligibleAttackers[rng.nextInt(0, eligibleAttackers.length)];
  if (committedBy === undefined || sufferedBy === undefined) return { events: [] };

  const profile = incidentProfileFor(defendingTeam, committedBy.playerId);
  const condition = telemetry.playerCondition[committedBy.playerId] ?? profile.startingFitness;
  const pressing = normalizedTactic(simulation, defendingTeam.tacticalDistribution.pressing, "pressing");
  const risk = normalizedTactic(simulation, defendingTeam.tacticalDistribution.risk, "risk");
  const technicalRisk = inverseAbility(profile.tackling) * 0.026 + inverseAbility(profile.composure) * 0.018;
  const fatigueRisk = clamp((78 - condition) / 100, 0, 0.18) * 0.08;
  const foulProbability = clamp(0.065 + technicalRisk + pressing * 0.035 + risk * 0.018 + fatigueRisk, 0.03, 0.18);
  if (rng.nextFloat() >= foulProbability) return { events: [] };

  const zoneDanger = roundThreeDecimals(clamp(rng.nextFloat() * 0.78 + risk * 0.16, 0, 1));
  const foul: FoulMatchEvent = {
    type: "foul",
    minute,
    side: defendingSide,
    committedByPlayerId: committedBy.playerId,
    sufferedByPlayerId: sufferedBy.playerId,
    zoneDanger,
  };
  const events: MatchDisciplineEvent[] = [foul];
  const severity = clamp(
    0.38 * zoneDanger
      + inverseAbility(profile.tackling) * 0.24
      + inverseAbility(profile.composure) * 0.18
      + inverseAbility(profile.determination) * 0.06
      + pressing * 0.08
      + risk * 0.06,
    0,
    1,
  );
  const cardRoll = rng.nextFloat();
  const previousYellows = telemetry.yellowCardsByPlayer[committedBy.playerId] ?? 0;
  const canDismiss = defendingTeam.lineup.length > MINIMUM_PLAYABLE_LINEUP_SIZE;

  if (canDismiss && severity >= 0.77 && cardRoll < 0.16) {
    events.push({ type: "red_card", minute, side: defendingSide, playerId: committedBy.playerId });
  } else if (cardRoll < bookingProbability(severity, previousYellows)) {
    if (previousYellows >= 1 && canDismiss) {
      events.push({ type: "second_yellow_card", minute, side: defendingSide, playerId: committedBy.playerId });
    } else {
      events.push({ type: "yellow_card", minute, side: defendingSide, playerId: committedBy.playerId });
    }
  }

  const dismissal = events.find((event) => event.type === "red_card" || event.type === "second_yellow_card");
  const penalty = zoneDanger >= 0.84 && rng.nextFloat() < PENALTY_AWARD_PROBABILITY_AFTER_DANGEROUS_FOUL
    ? resolvePenalty(simulation, minute, attackingSide, committedBy.playerId, sufferedBy.playerId)
    : undefined;
  if (penalty !== undefined) events.push(...penalty.events);

  return {
    events,
    ...(dismissal === undefined ? {} : { dismissedPlayerId: dismissal.playerId }),
    ...(penalty === undefined ? {} : { penalty: penalty.resolution }),
  };
}

function bookingProbability(severity: number, previousYellows: number): number {
  const firstBookingProbability = clamp(0.08 + severity * 0.42, 0.08, 0.54);
  // Booked players tackle more cautiously and referees require a clearer
  // second offence. This keeps dismissals meaningful without suppressing fouls.
  return previousYellows >= 1 ? firstBookingProbability * 0.2 : firstBookingProbability;
}

// `zoneDanger` identifies the small subset of fouls near the penalty area; this
// second gate prevents every dangerous foul from becoming a penalty.
const PENALTY_AWARD_PROBABILITY_AFTER_DANGEROUS_FOUL = 0.3;

function resolvePenalty(
  simulation: MatchSimulationState,
  minute: number,
  attackingSide: MatchEventSide,
  committedByPlayerId: PlayerId,
  fouledPlayerId: PlayerId,
): { readonly events: readonly [PenaltyAwardedMatchEvent, PenaltyOutcomeMatchEvent]; readonly resolution: MatchPenaltyResolution } | undefined {
  const attackingTeam = teamFor(simulation, attackingSide);
  const defendingTeam = teamFor(simulation, oppositeSide(attackingSide));
  const taker = [...attackingTeam.lineup]
    .filter((slot) => slot.canonicalRole !== "goalkeeper")
    .sort((left, right) => {
      const abilityDifference = incidentProfileFor(attackingTeam, right.playerId).penalties
        - incidentProfileFor(attackingTeam, left.playerId).penalties;
      return abilityDifference !== 0 ? abilityDifference : String(left.playerId).localeCompare(String(right.playerId));
    })[0];
  const goalkeeper = defendingTeam.lineup.find((slot) => slot.canonicalRole === "goalkeeper");
  if (taker === undefined || goalkeeper === undefined) return undefined;

  const takerProfile = incidentProfileFor(attackingTeam, taker.playerId);
  const goalkeeperProfile = incidentProfileFor(defendingTeam, goalkeeper.playerId);
  const rng = deriveRng(
    simulation.context.seed,
    "match-penalty",
    simulation.context.fixtureId,
    minute,
    attackingSide,
    taker.playerId,
    goalkeeper.playerId,
  );
  const scoreProbability = clamp(
    0.72 + (takerProfile.penalties - 10) * 0.018 - (goalkeeperProfile.goalkeeperReflexes - 10) * 0.008,
    0.55,
    0.9,
  );
  const scored = rng.nextFloat() < scoreProbability;
  const outcome: PenaltyOutcome = scored
    ? "scored"
    : rng.nextFloat() < clamp(0.55 + (goalkeeperProfile.goalkeeperHandling - 10) * 0.015, 0.4, 0.72)
      ? "saved"
      : "missed";
  const awarded: PenaltyAwardedMatchEvent = {
    type: "penalty_awarded",
    minute,
    side: attackingSide,
    fouledPlayerId,
    committedByPlayerId,
  };
  const penaltyOutcome: PenaltyOutcomeMatchEvent = {
    type: "penalty_outcome",
    minute,
    side: attackingSide,
    takerPlayerId: taker.playerId,
    goalkeeperPlayerId: goalkeeper.playerId,
    outcome,
  };
  return {
    events: [awarded, penaltyOutcome],
    resolution: { side: attackingSide, takerPlayerId: taker.playerId, goalkeeperPlayerId: goalkeeper.playerId, outcome },
  };
}

/** Returns real match attributes, with a neutral aggregate-context fallback. */
export function incidentProfileFor(team: MatchTeamContext, playerId: PlayerId): MatchPlayerIncidentProfile {
  return team.incidentProfiles?.find((profile) => profile.playerId === playerId) ?? {
    playerId,
    tackling: 10,
    composure: 10,
    determination: 10,
    stamina: 10,
    agility: 10,
    strength: 10,
    penalties: 10,
    goalkeeperReflexes: 10,
    goalkeeperHandling: 10,
    startingFitness: 100,
  };
}

function normalizedTactic(
  simulation: MatchSimulationState,
  value: number,
  key: "pressing" | "risk",
): number {
  const cap = simulation.context.engineConfig.tacticalDistributionCaps[key];
  const range = cap.maxInclusive - cap.minInclusive;
  return range === 0 ? 0.5 : clamp((value - cap.minInclusive) / range, 0, 1);
}

function teamFor(simulation: MatchSimulationState, side: MatchEventSide): MatchTeamContext {
  return side === "home" ? simulation.context.home : simulation.context.away;
}

function oppositeSide(side: MatchEventSide): MatchEventSide {
  return side === "home" ? "away" : "home";
}

function inverseAbility(value: number): number {
  return clamp((20 - value) / 19, 0, 1);
}

function roundThreeDecimals(value: number): number {
  return Math.round(value * 1_000) / 1_000;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

const MINIMUM_PLAYABLE_LINEUP_SIZE = 7;
