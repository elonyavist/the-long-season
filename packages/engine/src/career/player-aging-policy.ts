import {
  abilityValue,
  hardCapForRoleAbility,
  mapPlayerAbilities,
  readPlayerAbility,
  type Player,
  type PlayerAbilities,
  type PlayerAbilityKey,
  type PlayerRole,
} from "@game/domain";
import { deriveRng, type Rng } from "@game/shared";

import type { BroadPositionGroup } from "./player-development-policy.ts";

const PHYSICAL_FLOOR = 7;
const MAX_MONTHLY_DECLINE = 0.045;

/** Input used to age one active player at a monthly lifecycle checkpoint. */
export interface ApplyPlayerAgingPolicyInput {
  /** Player before the aging pass. */
  readonly player: Player;
  /** Whole-years age at the checkpoint date. */
  readonly age: number;
  /** Broad football group used for different aging curves. */
  readonly positionGroup: BroadPositionGroup;
  /** Development role used only for potential compression shape. */
  readonly developmentRole: PlayerRole;
  /** Stable world seed used for deterministic aging variance. */
  readonly worldSeed: string;
  /** Stable season id as a string; imported as string to keep this policy pure. */
  readonly seasonId: string;
  /** Stable month key being processed. */
  readonly monthKey: string;
}

/** One active-player aging result with enough facts for reports and tests. */
export interface ApplyPlayerAgingPolicyResult {
  /** Player after current ability decline/floor and potential compression. */
  readonly player: Player;
  /** Total current-ability decline applied across the month. */
  readonly totalDecline: number;
  /** Number of current abilities that declined. */
  readonly declinedAbilityCount: number;
  /** Total potential compression applied across the month. */
  readonly totalPotentialCompression: number;
}

/**
 * Applies active-player aging for one monthly checkpoint.
 *
 * The policy is intentionally small: current decline and reachable-potential
 * compression live together because both answer the same lifecycle question,
 * "what is still physically and technically reachable at this age?"
 */
export function applyPlayerAgingPolicy(input: ApplyPlayerAgingPolicyInput): ApplyPlayerAgingPolicyResult {
  const rng = deriveRng(input.worldSeed, "player-aging", input.seasonId, input.monthKey, input.player.id);
  let totalDecline = 0;
  let declinedAbilityCount = 0;

  const abilities = mapPlayerAbilities(input.player.abilities, (currentValue, abilityPath) => {
    const current = Number(currentValue);
    const floor = currentAbilityFloor(abilityPath);
    const decline = monthlyDeclineFor(input.positionGroup, input.age, abilityPath, rng);
    const next = clampAbility(Math.max(floor, current - decline));
    const delta = roundDelta(current - next);

    if (delta > 0) {
      totalDecline += delta;
      declinedAbilityCount += 1;
    }

    return abilityValue(next);
  });

  let totalPotentialCompression = 0;
  const potential = mapPlayerAbilities(input.player.potential, (potentialValue, abilityPath) => {
    const current = Number(readPlayerAbility(abilities, abilityPath));
    const previousPotential = Number(potentialValue);
    const ceiling = reachablePotentialCeiling({
      age: input.age,
      positionGroup: input.positionGroup,
      developmentRole: input.developmentRole,
      abilityPath,
      current,
    });
    const next = clampAbility(Math.max(current, Math.min(previousPotential, ceiling)));
    const delta = roundDelta(previousPotential - next);

    if (delta > 0) {
      totalPotentialCompression += delta;
    }

    return abilityValue(next);
  });

  return {
    player: {
      ...input.player,
      abilities,
      potential,
    },
    totalDecline: roundDelta(totalDecline),
    declinedAbilityCount,
    totalPotentialCompression: roundDelta(totalPotentialCompression),
  };
}

/** Returns the minimum active-player current ability for one attribute. */
export function currentAbilityFloor(abilityPath: PlayerAbilityKey): number {
  return abilityPath.startsWith("physical.") ? PHYSICAL_FLOOR : 1;
}

/** Returns the deterministic monthly current-ability decline before flooring. */
export function monthlyDeclineFor(
  positionGroup: BroadPositionGroup,
  age: number,
  abilityPath: PlayerAbilityKey,
  rng: Rng = deriveRng("aging-policy-static", positionGroup, String(age), abilityPath),
): number {
  const multiplier = agingMultiplier(positionGroup, age, abilityPath);
  if (multiplier <= 0) {
    return 0;
  }

  const variance = 0.75 + rng.nextFloat() * 0.5;
  return roundDelta(MAX_MONTHLY_DECLINE * multiplier * variance);
}

function agingMultiplier(positionGroup: BroadPositionGroup, age: number, abilityPath: PlayerAbilityKey): number {
  if (positionGroup === "goalkeeper") {
    return goalkeeperAgingMultiplier(age, abilityPath);
  }

  if (age < 32) {
    return 0;
  }

  if (abilityPath.startsWith("physical.")) {
    if (age >= 36) return 1.4;
    if (age >= 34) return 1;
    return 0.55;
  }

  if (age < lateOutfieldSkillDeclineAge(positionGroup)) {
    return 0;
  }

  if (abilityPath.startsWith("technical.")) {
    return age >= 36 ? 0.32 : 0.18;
  }

  if (abilityPath.startsWith("mental.")) {
    return age >= 37 ? 0.16 : 0.08;
  }

  return 0;
}

function goalkeeperAgingMultiplier(age: number, abilityPath: PlayerAbilityKey): number {
  if (age < 35) {
    return 0;
  }

  if (abilityPath === "goalkeeping.rushingOut" || abilityPath === "goalkeeping.footwork") {
    return age >= 38 ? 1.05 : 0.45;
  }

  if (age >= 38 && abilityPath === "goalkeeping.reflexes") {
    return 0.7;
  }

  if (age >= 39 && (abilityPath === "goalkeeping.handling" || abilityPath === "goalkeeping.goalkeeperPositioning")) {
    return 0.25;
  }

  return 0;
}

function lateOutfieldSkillDeclineAge(positionGroup: BroadPositionGroup): number {
  switch (positionGroup) {
    case "attacker":
      return 34;
    case "defender":
      return 35;
    case "midfielder":
      return 36;
    case "goalkeeper":
      return 39;
  }
}

function reachablePotentialCeiling(input: {
  readonly age: number;
  readonly positionGroup: BroadPositionGroup;
  readonly developmentRole: PlayerRole;
  readonly abilityPath: PlayerAbilityKey;
  readonly current: number;
}): number {
  const room = remainingReachableRoom(input);
  const hardCap = hardCapForRoleAbility(input.developmentRole, input.abilityPath);
  return Math.min(hardCap ?? 20, input.current + room);
}

function remainingReachableRoom(input: {
  readonly age: number;
  readonly positionGroup: BroadPositionGroup;
  readonly developmentRole: PlayerRole;
  readonly abilityPath: PlayerAbilityKey;
}): number {
  if (input.positionGroup === "goalkeeper") {
    return goalkeeperRemainingRoom(input.age, input.abilityPath);
  }

  if (input.age <= 21) return input.abilityPath.startsWith("physical.") ? 5 : 6;
  if (input.age <= 24) return input.abilityPath.startsWith("physical.") ? 2.5 : 3.5;
  if (input.age <= 27) return input.abilityPath.startsWith("physical.") ? 0.5 : 1.5;
  if (input.age <= 31) return input.abilityPath.startsWith("mental.") ? 1 : 0.5;
  if (input.abilityPath.startsWith("physical.")) return 0;
  if (input.age <= 34 && input.abilityPath.startsWith("mental.")) return 0.6;
  if (input.age <= 34 && input.abilityPath.startsWith("technical.")) return 0.25;
  return 0;
}

function goalkeeperRemainingRoom(age: number, abilityPath: PlayerAbilityKey): number {
  if (age <= 24) return abilityPath.startsWith("goalkeeping.") ? 5 : 2;
  if (age <= 29) return abilityPath.startsWith("goalkeeping.") ? 3 : 1;
  if (age <= 34) return abilityPath.startsWith("goalkeeping.") ? 1.25 : 0.25;
  if (age <= 37 && abilityPath === "goalkeeping.goalkeeperPositioning") return 0.5;
  return 0;
}

function clampAbility(value: number): number {
  return Math.max(1, Math.min(20, Math.round(value * 100) / 100));
}

function roundDelta(value: number): number {
  return Math.round(value * 100) / 100;
}
