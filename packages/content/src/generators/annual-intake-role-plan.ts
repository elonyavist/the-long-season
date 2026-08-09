import {
  PLAYER_ROLES,
  naturalPositionsForPlayerRole,
  playerRoleSquadDepartment,
  type ClubId,
  type PlayerPosition,
  type PlayerRole,
  type PlayerSquadDepartment,
} from "@game/domain";
import { deriveRng } from "@game/shared";

import { primaryRoleForPosition } from "./player-role-identity.ts";

/** A candidate slot whose exact role is still for content composition to choose. */
export type AnnualIntakeRoleSlotKind = PlayerSquadDepartment | "outfield";

/** One club's real population and the candidate slots it needs composed. */
export interface AnnualIntakeRolePlanClub {
  readonly clubId: ClubId;
  readonly slotKinds: readonly AnnualIntakeRoleSlotKind[];
  readonly currentRoles: readonly PlayerRole[];
}

/** Input for one competition-scoped role composition. */
export interface PlanCompetitionAnnualIntakeRolesInput {
  readonly seed: string;
  readonly seasonKey: string;
  readonly competitionKey: string;
  readonly clubs: readonly AnnualIntakeRolePlanClub[];
}

/** Minimal report facts derivable from one actual generated position population. */
export interface AnnualIntakeRoleCoverageFacts {
  readonly positiveRoles: readonly PlayerRole[];
  readonly maximumReachableRoleCount: number;
  readonly sidedRoleImbalanceCount: number;
}

/**
 * Summarizes role reachability from actual generated positions.
 *
 * The maximum respects department-limited academy vacancies: five attacking
 * slots can reach two roles, not five. Two-sided imbalance is evaluated only
 * when at least two players of that role exist, matching the checkpoint's
 * denominator rather than forcing a side into a one-player sample.
 */
export function annualIntakeRoleCoverageFacts(
  positions: readonly PlayerPosition[],
): AnnualIntakeRoleCoverageFacts {
  const roles = positions.map(primaryRoleForPosition);
  const positiveRoles = PLAYER_ROLES.filter((role) => roles.includes(role));
  const maximumReachableRoleCount = slotKindOrder()
    .filter((kind) => kind !== "outfield")
    .reduce((sum, department) => {
      const slotCount = roles.filter(
        (role) => playerRoleSquadDepartment(role) === department,
      ).length;
      const roleCount = PLAYER_ROLES.filter(
        (role) => playerRoleSquadDepartment(role) === department,
      ).length;
      return sum + Math.min(slotCount, roleCount);
    }, 0);
  const sidedRoleImbalanceCount = PLAYER_ROLES.filter((role) => {
    const naturalPositions = naturalPositionsForPlayerRole(role);
    if (naturalPositions.length !== 2) return false;
    const observed = positions.filter((position) =>
      naturalPositions.includes(position)
    );
    if (observed.length < 2) return false;
    const first = naturalPositions[0];
    const second = naturalPositions[1];
    if (first === undefined || second === undefined) {
      throw new Error(`Two-sided role lost a natural position: ${role}`);
    }
    return Math.abs(
      observed.filter((position) => position === first).length
        - observed.filter((position) => position === second).length,
    ) > 1;
  }).length;
  return { positiveRoles, maximumReachableRoleCount, sidedRoleImbalanceCount };
}

/**
 * Assigns a balanced role deck to one competition's ordered candidate slots.
 *
 * The competition owns how often each role appears; current club role counts
 * decide only which club receives the next token. That distinction preserves
 * league-wide role continuity without giving any club a formation, a preferred
 * shape, or a hidden permanent identity. Two-sided roles are resolved by one
 * alternating competition sequence so a run of independent coin flips cannot
 * erase a flank.
 */
export function planCompetitionAnnualIntakePositions(
  input: PlanCompetitionAnnualIntakeRolesInput,
): ReadonlyMap<ClubId, readonly PlayerPosition[]> {
  validateInput(input);
  const positionsByClubId = new Map<ClubId, Array<PlayerPosition | undefined>>();
  const currentCountsByClubId = new Map<ClubId, Map<PlayerRole, number>>();
  const plannedCountsByClubId = new Map<ClubId, Map<PlayerRole, number>>();

  for (const club of input.clubs) {
    positionsByClubId.set(club.clubId, Array.from({ length: club.slotKinds.length }));
    currentCountsByClubId.set(club.clubId, roleCounts(club.currentRoles));
    plannedCountsByClubId.set(club.clubId, roleCounts([]));
  }

  for (const slotKind of slotKindOrder()) {
    const slots = input.clubs.flatMap((club, clubIndex) =>
      club.slotKinds.flatMap((candidate, slotIndex) =>
        candidate === slotKind
          ? [{ clubId: club.clubId, clubIndex, slotIndex }]
          : []
      )
    );
    if (slots.length === 0) continue;

    const roles = eligibleRoles(slotKind);
    const deck = balancedRoleDeck(input, slotKind, roles, slots.length);
    const assignedSlots: typeof slots = [];
    const occurrencesByRole = roleCounts([]);

    for (const role of deck) {
      const available = slots.filter((slot) =>
        !assignedSlots.some((assigned) =>
          assigned.clubIndex === slot.clubIndex && assigned.slotIndex === slot.slotIndex
        )
      );
      const chosen = available.toSorted((left, right) =>
        compareSlotDemand(
          input,
          role,
          left,
          right,
          currentCountsByClubId,
          plannedCountsByClubId,
        )
      )[0];
      if (chosen === undefined) {
        throw new Error(`Annual intake role deck overfilled ${input.competitionKey}:${slotKind}`);
      }
      assignedSlots.push(chosen);
      const occurrenceIndex = occurrencesByRole.get(role) ?? 0;
      occurrencesByRole.set(role, occurrenceIndex + 1);
      const clubPositions = positionsByClubId.get(chosen.clubId);
      if (clubPositions === undefined) {
        throw new Error(`Annual intake role plan omitted club ${chosen.clubId}`);
      }
      clubPositions[chosen.slotIndex] = positionForRoleOccurrence(
        input,
        role,
        occurrenceIndex,
      );
      const planned = plannedCountsByClubId.get(chosen.clubId);
      if (planned === undefined) {
        throw new Error(`Annual intake role counts omitted club ${chosen.clubId}`);
      }
      planned.set(role, (planned.get(role) ?? 0) + 1);
    }
  }

  return new Map(input.clubs.map((club) => {
    const positions = positionsByClubId.get(club.clubId);
    if (
      positions === undefined
      || positions.length !== club.slotKinds.length
      || positions.some((position) => position === undefined)
    ) {
      throw new Error(`Annual intake role assignment is incomplete for ${club.clubId}`);
    }
    return [club.clubId, positions as readonly PlayerPosition[]] as const;
  }));
}

function validateInput(input: PlanCompetitionAnnualIntakeRolesInput): void {
  if (input.competitionKey.length === 0 || input.seasonKey.length === 0) {
    throw new Error("Annual intake role plan requires competition and season keys");
  }
  const seen = new Set<ClubId>();
  for (const club of input.clubs) {
    if (seen.has(club.clubId)) {
      throw new Error(`Annual intake role plan contains duplicate club ${club.clubId}`);
    }
    seen.add(club.clubId);
  }
}

function slotKindOrder(): readonly AnnualIntakeRoleSlotKind[] {
  return ["goalkeeper", "defender", "midfielder", "attacker", "outfield"];
}

function eligibleRoles(kind: AnnualIntakeRoleSlotKind): readonly PlayerRole[] {
  return PLAYER_ROLES.filter((role) =>
    kind === "outfield"
      ? role !== "goalkeeper"
      : playerRoleSquadDepartment(role) === kind
  );
}

function balancedRoleDeck(
  input: PlanCompetitionAnnualIntakeRolesInput,
  slotKind: AnnualIntakeRoleSlotKind,
  roles: readonly PlayerRole[],
  length: number,
): readonly PlayerRole[] {
  if (roles.length === 0) {
    throw new Error(`Annual intake role slot has no eligible roles: ${slotKind}`);
  }
  const offset = deriveRng(
    input.seed,
    "annual-intake-role-deck",
    input.seasonKey,
    input.competitionKey,
    slotKind,
  ).nextInt(0, roles.length);
  return Array.from({ length }, (_, index) => {
    const role = roles[(offset + index) % roles.length];
    if (role === undefined) {
      throw new Error(`Annual intake role deck has no role at ${index}`);
    }
    return role;
  });
}

function compareSlotDemand(
  input: PlanCompetitionAnnualIntakeRolesInput,
  role: PlayerRole,
  left: { readonly clubId: ClubId; readonly clubIndex: number; readonly slotIndex: number },
  right: { readonly clubId: ClubId; readonly clubIndex: number; readonly slotIndex: number },
  current: ReadonlyMap<ClubId, ReadonlyMap<PlayerRole, number>>,
  planned: ReadonlyMap<ClubId, ReadonlyMap<PlayerRole, number>>,
): number {
  const leftCount = roleCount(current, left.clubId, role) + roleCount(planned, left.clubId, role);
  const rightCount = roleCount(current, right.clubId, role) + roleCount(planned, right.clubId, role);
  if (leftCount !== rightCount) return leftCount - rightCount;
  const leftRank = allocationRank(input, role, left);
  const rightRank = allocationRank(input, role, right);
  if (leftRank !== rightRank) return leftRank - rightRank;
  if (left.clubIndex !== right.clubIndex) return left.clubIndex - right.clubIndex;
  return left.slotIndex - right.slotIndex;
}

function allocationRank(
  input: PlanCompetitionAnnualIntakeRolesInput,
  role: PlayerRole,
  slot: { readonly clubId: ClubId; readonly slotIndex: number },
): number {
  return deriveRng(
    input.seed,
    "annual-intake-role-allocation",
    input.seasonKey,
    input.competitionKey,
    role,
    slot.clubId,
    slot.slotIndex,
  ).nextInt(0, 2_147_483_647);
}

function positionForRoleOccurrence(
  input: PlanCompetitionAnnualIntakeRolesInput,
  role: PlayerRole,
  occurrenceIndex: number,
): PlayerPosition {
  const positions = naturalPositionsForPlayerRole(role);
  if (positions.length === 1) {
    const position = positions[0];
    if (position === undefined) throw new Error(`Role has no natural position: ${role}`);
    return position;
  }
  if (positions.length !== 2) {
    throw new Error(`Role has unsupported natural-position count: ${role}:${positions.length}`);
  }
  const offset = deriveRng(
    input.seed,
    "annual-intake-role-side",
    input.seasonKey,
    input.competitionKey,
    role,
  ).nextInt(0, 2);
  const position = positions[(offset + occurrenceIndex) % 2];
  if (position === undefined) throw new Error(`Role side is missing: ${role}:${occurrenceIndex}`);
  return position;
}

function roleCounts(roles: readonly PlayerRole[]): Map<PlayerRole, number> {
  const counts = new Map<PlayerRole, number>(PLAYER_ROLES.map((role) => [role, 0]));
  for (const role of roles) counts.set(role, (counts.get(role) ?? 0) + 1);
  return counts;
}

function roleCount(
  counts: ReadonlyMap<ClubId, ReadonlyMap<PlayerRole, number>>,
  clubId: ClubId,
  role: PlayerRole,
): number {
  const clubCounts = counts.get(clubId);
  if (clubCounts === undefined) throw new Error(`Annual intake role counts omitted club ${clubId}`);
  return clubCounts.get(role) ?? 0;
}
