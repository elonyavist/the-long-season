import type { PlayerId } from "@game/domain";

import type { MatchTeamContext } from "./match-context.ts";
import type { MatchSimulationState, MatchSimulationTelemetry } from "./match-simulation-state.ts";

/** Progresses match-relative condition for players currently on the pitch. */
export function progressOnPitchCondition(
  simulation: MatchSimulationState,
  telemetry: MatchSimulationTelemetry,
): MatchSimulationTelemetry["playerCondition"] {
  const next: Partial<Record<PlayerId, number>> = { ...telemetry.playerCondition };
  applyTeamWorkload(simulation, simulation.context.home, next);
  applyTeamWorkload(simulation, simulation.context.away, next);
  return next;
}

function applyTeamWorkload(
  simulation: MatchSimulationState,
  team: MatchTeamContext,
  condition: Partial<Record<PlayerId, number>>,
): void {
  const pressing = normalizeTactic(simulation, team.tacticalDistribution.pressing, "pressing");
  const risk = normalizeTactic(simulation, team.tacticalDistribution.risk, "risk");
  const teamCost = BASE_MINUTE_COST + pressing * 0.025 + risk * 0.01;

  for (const slot of team.lineup) {
    const roleMultiplier = isGoalkeeperRole(slot.roleKey) ? 0.45 : 1;
    const current = condition[slot.playerId] ?? 100;
    const injury = simulation.stats.telemetry?.injuriesByPlayer[slot.playerId];
    const injuryCost = injury?.continued === true ? (injury.severity === "minor" ? 0.08 : 0.035) : 0;
    condition[slot.playerId] = roundTwoDecimals(
      Math.max(MIN_MATCH_CONDITION, current - teamCost * roleMultiplier - injuryCost),
    );
  }
}

function normalizeTactic(
  simulation: MatchSimulationState,
  value: number,
  key: "pressing" | "risk",
): number {
  const cap = simulation.context.engineConfig.tacticalDistributionCaps[key];
  const range = cap.maxInclusive - cap.minInclusive;
  return range === 0 ? 0.5 : (value - cap.minInclusive) / range;
}

function isGoalkeeperRole(roleKey: string): boolean {
  const normalized = roleKey.toLowerCase();
  return normalized === "gk" || normalized === "por" || normalized === "goalkeeper";
}

function roundTwoDecimals(value: number): number {
  return Math.round(value * 100) / 100;
}

const BASE_MINUTE_COST = 0.065;
const MIN_MATCH_CONDITION = 1;
