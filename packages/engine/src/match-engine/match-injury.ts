import type { FoulMatchEvent, InjuryMatchEvent, MatchEventSide, MatchInjurySeverity } from "@game/domain";
import { deriveRng } from "@game/shared";

import { incidentProfileFor } from "./match-discipline.ts";
import type { MatchSimulationState, MatchSimulationTelemetry } from "./match-simulation-state.ts";

/** Resolves at most one new injury for one team during a completed minute. */
export function resolveMatchMinuteInjury(
  simulation: MatchSimulationState,
  telemetry: MatchSimulationTelemetry,
  minute: number,
  side: MatchEventSide,
  fouls: readonly FoulMatchEvent[],
): InjuryMatchEvent | undefined {
  const team = side === "home" ? simulation.context.home : simulation.context.away;
  if (team.lineup.length <= MINIMUM_PLAYABLE_LINEUP_SIZE) return undefined;
  const candidates = team.lineup.filter((slot) => {
    const injury = telemetry.injuriesByPlayer[slot.playerId];
    return injury === undefined || (injury.continued && (injury.severity === "knock" || injury.severity === "minor"));
  });
  if (candidates.length === 0) return undefined;

  const rng = deriveRng(simulation.context.seed, "match-injury", simulation.context.fixtureId, minute, side);
  const targetedPlayerId = fouls.find((foul) => foul.sufferedByPlayerId !== undefined)?.sufferedByPlayerId;
  const selected = targetedPlayerId === undefined
    ? candidates[rng.nextInt(0, candidates.length)]
    : candidates.find((slot) => slot.playerId === targetedPlayerId) ?? candidates[rng.nextInt(0, candidates.length)];
  if (selected === undefined) return undefined;

  const profile = incidentProfileFor(team, selected.playerId);
  const condition = telemetry.playerCondition[selected.playerId] ?? profile.startingFitness;
  const existingInjury = telemetry.injuriesByPlayer[selected.playerId];
  const contactDanger = fouls
    .filter((foul) => foul.sufferedByPlayerId === selected.playerId)
    .reduce((highest, foul) => Math.max(highest, foul.zoneDanger), 0);
  const resilience = (profile.stamina * 0.38 + profile.agility * 0.34 + profile.strength * 0.28) / 20;
  const workload = clamp((100 - condition) / 100, 0, 1);
  const probability = clamp(
    0.00065
      + (1 - resilience) * 0.0013
      + workload * 0.0022
      + contactDanger * 0.009
      + (existingInjury?.continued === true ? 0.014 : 0),
    0.0004,
    0.028,
  );
  if (rng.nextFloat() >= probability) return undefined;

  const severity = severityForRoll(rng.nextFloat(), contactDanger, workload, existingInjury?.continued === true);
  return { type: "injury", minute, side, playerId: selected.playerId, severity };
}

/** Maps deterministic risk context to the four domain injury severities. */
export function severityForRoll(
  roll: number,
  contactDanger: number,
  workload: number,
  aggravation: boolean,
): MatchInjurySeverity {
  const adjusted = clamp(roll - contactDanger * 0.18 - workload * 0.12 - (aggravation ? 0.22 : 0), 0, 1);
  if (adjusted < 0.055) return "serious";
  if (adjusted < 0.2) return "moderate";
  if (adjusted < 0.52) return "minor";
  return "knock";
}

/** Reports whether an injury removes the player before the next minute. */
export function injuryForcesExit(severity: MatchInjurySeverity): boolean {
  return severity === "moderate" || severity === "serious";
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

const MINIMUM_PLAYABLE_LINEUP_SIZE = 7;
