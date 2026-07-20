import {
  EMPTY_PLAYER_AVAILABILITY,
  gameDate,
  type CareerPlayerAvailabilityState,
  type CompetitionMatchRules,
  type Fixture,
  type MatchInjurySeverity,
  type MatchPlayerConsequence,
  type MatchReport,
  type MatchSuspensionReason,
  type PlayerId,
} from "@game/domain";
import { addDays, deriveRng } from "@game/shared";

/** Input for committing durable availability facts after one completed fixture. */
export interface ApplyMatchAvailabilityConsequencesInput {
  readonly availability?: CareerPlayerAvailabilityState;
  readonly fixture: Fixture;
  readonly report: MatchReport;
  readonly rules: CompetitionMatchRules;
  readonly worldSeed: string;
  /** Players registered to the two clubs taking part in this fixture. */
  readonly participatingPlayerIds: readonly PlayerId[];
}

type AvailabilityKey = `${string}|${string}`;

/** Availability state plus the new manager-facing facts produced by a match. */
export interface ApplyMatchAvailabilityConsequencesResult {
  readonly availability: CareerPlayerAvailabilityState;
  readonly consequences: readonly MatchPlayerConsequence[];
}

/**
 * Applies one completed fixture to injury, suspension, and yellow-card state.
 *
 * Existing bans are consumed before new bans are added, so a dismissal can
 * never count the match in which it happened as the first suspended fixture.
 */
export function applyMatchAvailabilityConsequences(
  input: ApplyMatchAvailabilityConsequencesInput,
): ApplyMatchAvailabilityConsequencesResult {
  const previous = input.availability ?? EMPTY_PLAYER_AVAILABILITY;
  const participatingClubPlayerIds = new Set(input.participatingPlayerIds);
  const dismissedBySecondYellow = new Set<PlayerId>();
  const dismissedByStraightRed = new Set<PlayerId>();
  const injurySeverityByPlayer = new Map<PlayerId, MatchInjurySeverity>();
  const yellowCountByPlayer = new Map<PlayerId, number>();

  for (const event of input.report.events) {
    if (event.type === "yellow_card") {
      yellowCountByPlayer.set(event.playerId, (yellowCountByPlayer.get(event.playerId) ?? 0) + 1);
    } else if (event.type === "second_yellow_card") {
      dismissedBySecondYellow.add(event.playerId);
    } else if (event.type === "red_card") {
      dismissedByStraightRed.add(event.playerId);
    } else if (event.type === "injury") {
      const previousSeverity = injurySeverityByPlayer.get(event.playerId);
      if (previousSeverity === undefined || severityRank(event.severity) > severityRank(previousSeverity)) {
        injurySeverityByPlayer.set(event.playerId, event.severity);
      }
    }
  }

  const suspensions = previous.suspensions
    .map((suspension) => suspension.competitionId === input.fixture.competitionId
      && participatingClubPlayerIds.has(suspension.playerId)
      ? { ...suspension, remainingMatches: suspension.remainingMatches - 1 }
      : suspension)
    .filter((suspension) => suspension.remainingMatches > 0);
  const injuries = previous.injuries.filter((injury) => injury.unavailableUntil > input.fixture.date);
  const yellowCards = new Map<AvailabilityKey, CareerPlayerAvailabilityState["yellowCards"][number]>(
    previous.yellowCards.map((entry) => [`${entry.competitionId}|${entry.playerId}` as AvailabilityKey, entry]),
  );
  const consequences: MatchPlayerConsequence[] = [];

  for (const [playerId, severity] of [...injurySeverityByPlayer].sort(comparePlayerEntry)) {
    const durationDays = injuryDurationDays(input.worldSeed, input.fixture, playerId, severity);
    const consequence: MatchPlayerConsequence = {
      type: "injury",
      fixtureId: input.fixture.id,
      playerId,
      severity,
      occurredOn: input.fixture.date,
      unavailableUntil: gameDate(addDays(input.fixture.date, durationDays)),
    };
    const existingIndex = injuries.findIndex((injury) => injury.playerId === playerId);
    if (existingIndex >= 0) injuries.splice(existingIndex, 1);
    if (durationDays > 0) injuries.push(consequence);
    consequences.push(consequence);
  }

  for (const playerId of [...dismissedByStraightRed].sort(comparePlayerId)) {
    addSuspension(
      suspensions,
      consequences,
      input.fixture,
      playerId,
      "straight_red",
      input.rules.straightRedSuspensionMatches,
    );
  }
  for (const playerId of [...dismissedBySecondYellow].sort(comparePlayerId)) {
    if (dismissedByStraightRed.has(playerId)) continue;
    addSuspension(
      suspensions,
      consequences,
      input.fixture,
      playerId,
      "second_yellow",
      input.rules.secondYellowSuspensionMatches,
    );
  }

  for (const [playerId, matchYellowCount] of [...yellowCountByPlayer].sort(comparePlayerEntry)) {
    if (dismissedByStraightRed.has(playerId) || dismissedBySecondYellow.has(playerId)) continue;
    const key = `${input.fixture.competitionId}|${playerId}` as AvailabilityKey;
    const total = (yellowCards.get(key)?.count ?? 0) + matchYellowCount;
    if (total >= input.rules.yellowCardAccumulationThreshold) {
      yellowCards.set(key, {
        competitionId: input.fixture.competitionId,
        playerId,
        count: total % input.rules.yellowCardAccumulationThreshold,
      });
      addSuspension(
        suspensions,
        consequences,
        input.fixture,
        playerId,
        "yellow_accumulation",
        input.rules.yellowAccumulationSuspensionMatches,
      );
    } else {
      yellowCards.set(key, { competitionId: input.fixture.competitionId, playerId, count: total });
    }
  }

  return {
    availability: {
      injuries: [...injuries].sort((left, right) => comparePlayerId(left.playerId, right.playerId)),
      suspensions: [...suspensions].sort((left, right) => comparePlayerId(left.playerId, right.playerId)),
      yellowCards: [...yellowCards.values()]
        .filter((entry) => entry.count > 0)
        .sort((left, right) => comparePlayerId(left.playerId, right.playerId)),
    },
    consequences,
  };
}

/** Returns the deterministic absence length for one match injury. */
export function injuryDurationDays(
  worldSeed: string,
  fixture: Fixture,
  playerId: PlayerId,
  severity: MatchInjurySeverity,
): number {
  const [minimum, maximum] = INJURY_DURATION_RANGES[severity];
  if (minimum === maximum) return minimum;
  return deriveRng(worldSeed, "career-injury-duration", fixture.id, playerId, severity)
    .nextInt(minimum, maximum + 1);
}

function addSuspension(
  suspensions: Array<CareerPlayerAvailabilityState["suspensions"][number]>,
  consequences: MatchPlayerConsequence[],
  fixture: Fixture,
  playerId: PlayerId,
  reason: MatchSuspensionReason,
  matches: number,
): void {
  const consequence: MatchPlayerConsequence = {
    type: "suspension",
    fixtureId: fixture.id,
    competitionId: fixture.competitionId,
    playerId,
    reason,
    matches,
  };
  const existingIndex = suspensions.findIndex((suspension) =>
    suspension.playerId === playerId && suspension.competitionId === fixture.competitionId);
  const existing = existingIndex < 0 ? undefined : suspensions[existingIndex];
  const replacement = {
    ...consequence,
    remainingMatches: Math.max(existing?.remainingMatches ?? 0, matches),
  };
  if (existingIndex < 0) suspensions.push(replacement);
  else suspensions.splice(existingIndex, 1, replacement);
  consequences.push(consequence);
}

function severityRank(severity: MatchInjurySeverity): number {
  return { knock: 0, minor: 1, moderate: 2, serious: 3 }[severity];
}

function comparePlayerId(left: PlayerId, right: PlayerId): number {
  return String(left).localeCompare(String(right));
}

function comparePlayerEntry<T>(left: readonly [PlayerId, T], right: readonly [PlayerId, T]): number {
  return comparePlayerId(left[0], right[0]);
}

const INJURY_DURATION_RANGES: Readonly<Record<MatchInjurySeverity, readonly [number, number]>> = {
  knock: [0, 0],
  minor: [3, 10],
  moderate: [14, 42],
  serious: [60, 180],
};
