import {
  abilityValue,
  closePlayerParticipationMonth,
  createCareerState,
  foldPlayerAbilities,
  getPlayerRoleProfile,
  hardCapForRoleAbility,
  mapPlayerAbilities,
  rawDiagnosticAbilityAverage,
  readPlayerAbility,
  roleCurrentAbility,
  rolePotentialAbility,
  type CareerState,
  type Player,
  type PlayerAbilities,
  type PlayerAbilityKey,
  type PlayerId,
  type PlayerPosition,
  type PlayerRole,
  type PlayerDevelopmentMonthKey,
  type PlayerParticipationLedger,
  type PlayerParticipationRow,
  type RoleCurrentAbility,
  type RolePotentialAbility,
  type SeasonId,
} from "@game/domain";
import { deriveRng } from "@game/shared";

import { applyPlayerAgingPolicy } from "./player-aging-policy.ts";
import { monthlyDevelopmentPolicy, type BroadPositionGroup } from "./player-development-policy.ts";
import { adaptPlayerRolesFromParticipation } from "./player-role-adaptation.ts";

const DAYS_PER_YEAR = 365;
const MINIMUM_GROWTH_ROOM = 0.05;
const MAX_SINGLE_MONTH_GROWTH = 0.08;

/** Input for deterministic positive player development over one season boundary. */
export interface PlayerDevelopmentInput {
  /** Durable career state before development is applied. */
  readonly careerState: CareerState;
  /** Stable world seed used to derive per-player development streams. */
  readonly worldSeed: string;
  /** Season ID that is being developed. */
  readonly seasonId: SeasonId;
  /** Optional explicit player order to develop. Defaults to all active players. */
  readonly playerIds?: readonly PlayerId[];
}

/** One player development summary for later reports and tests. */
export interface PlayerDevelopmentChange {
  /** Player affected by this development pass. */
  readonly playerId: PlayerId;
  /** Age in whole years at the career state's current date. */
  readonly age: number;
  /** Broad position bucket used by the development model. */
  readonly positionGroup: BroadPositionGroup;
  /** Total positive ability growth across all attributes. */
  readonly totalGrowth: number;
  /** Total ability decline across all attributes. */
  readonly totalDecline: number;
  /** Number of individual abilities that improved. */
  readonly improvedAbilityCount: number;
  /** Number of individual abilities that declined. */
  readonly declinedAbilityCount: number;
  /** Current role-weighted ability before this seasonal pass. */
  readonly roleCurrentAbilityBefore: RoleCurrentAbility;
  /** Current role-weighted ability after this seasonal pass. */
  readonly roleCurrentAbilityAfter: RoleCurrentAbility;
  /** Potential evaluated through the same role profile as current ability. */
  readonly rolePotentialAbility: RolePotentialAbility;
}

/** Result of one pure player-development pass. */
export interface PlayerDevelopmentResult {
  /** Copied career state with developed player abilities. */
  readonly careerState: CareerState;
  /** Structured non-presentational development summary. */
  readonly changes: readonly PlayerDevelopmentChange[];
}

/** Explicit scalar summary used by development decisions and reports. */
export interface PlayerDevelopmentAbilitySummary {
  /** Current football quality for the supplied role, or legacy raw average. */
  readonly currentAbility: number;
  /** Potential football quality measured through the same contract. */
  readonly potentialAbility: number;
  /** Non-negative scalar room between potential and current quality. */
  readonly potentialRoom: number;
  /** Identifies the compatibility fallback used only by pre-role players. */
  readonly measure: "role" | "legacy_raw";
}

/**
 * Summarizes current and potential through one explicit development measure.
 *
 * New players always use their canonical role. The raw branch exists only so
 * historical saves without role identity remain inspectable until migration.
 */
export function summarizePlayerDevelopmentAbilities(
  player: Player,
  role: PlayerRole | undefined = player.primaryRole,
): PlayerDevelopmentAbilitySummary {
  if (role === undefined) {
    const currentAbility = Number(rawDiagnosticAbilityAverage(player.abilities));
    const potentialAbility = Number(rawDiagnosticAbilityAverage(player.potential));
    return {
      currentAbility,
      potentialAbility,
      potentialRoom: Math.max(0, potentialAbility - currentAbility),
      measure: "legacy_raw",
    };
  }

  const profile = getPlayerRoleProfile(role);
  const currentAbility = Number(roleCurrentAbility(player.abilities, profile));
  const potentialAbility = Number(rolePotentialAbility(player.potential, profile));
  return {
    currentAbility,
    potentialAbility,
    potentialRoom: Math.max(0, potentialAbility - currentAbility),
    measure: "role",
  };
}

/** Returns the unweighted total attribute change in canonical traversal order. */
export function totalPlayerAbilityDelta(before: PlayerAbilities, after: PlayerAbilities): number {
  return foldPlayerAbilities(
    after,
    0,
    (total, value, key) => total + Number(value) - Number(readPlayerAbility(before, key)),
  );
}

/**
 * Applies deterministic monthly player growth for open participation-ledger rows.
 *
 * Growth is available only from real unclosed monthly minutes. Aging is applied
 * at the same monthly checkpoints so current ability and reachable potential
 * evolve together instead of jumping once per season.
 */
export function developPlayersForSeason(input: PlayerDevelopmentInput): PlayerDevelopmentResult {
  const players: Partial<Record<PlayerId, Player>> = { ...input.careerState.gameState.players };
  const changes: PlayerDevelopmentChange[] = [];
  const participationRows = openParticipationRowsByPlayer(input);
  let playerParticipationLedger = input.careerState.playerParticipationLedger;

  for (const playerId of input.playerIds ?? input.careerState.gameState.playerIds) {
    const player = input.careerState.gameState.players[playerId];
    if (player === undefined) {
      continue;
    }

    const age = playerAgeYears(player, input.careerState.gameState.calendar.currentDate);
    const positionGroup = broadPositionGroup(player.naturalPositions[0]);
    const developmentRole = player.primaryRole ?? developmentRoleForPosition(player.naturalPositions[0]);
    const developed = developOnePlayer({
      player,
      age,
      positionGroup,
      developmentRole,
      worldSeed: input.worldSeed,
      seasonId: input.seasonId,
      participationRows: participationRows.get(playerId) ?? [],
    });
    const roleProfile = getPlayerRoleProfile(developmentRole);

    players[playerId] = developed.player;
    changes.push({
      playerId,
      age,
      positionGroup,
      totalGrowth: roundDelta(developed.totalGrowth),
      totalDecline: roundDelta(developed.totalDecline),
      improvedAbilityCount: developed.improvedAbilityCount,
      declinedAbilityCount: developed.declinedAbilityCount,
      roleCurrentAbilityBefore: roleCurrentAbility(player.abilities, roleProfile),
      roleCurrentAbilityAfter: roleCurrentAbility(developed.player.abilities, roleProfile),
      rolePotentialAbility: rolePotentialAbility(player.potential, roleProfile),
    });
  }

  const adapted = adaptPlayerRolesFromParticipation({
    careerState: createCareerState({
      ...input.careerState,
      ...(playerParticipationLedger === undefined ? {} : { playerParticipationLedger }),
      gameState: {
        ...input.careerState.gameState,
        players: players as CareerState["gameState"]["players"],
      },
    }),
    seasonId: input.seasonId,
    ...(input.playerIds === undefined ? {} : { playerIds: input.playerIds }),
  });

  for (const monthKey of openParticipationMonthKeys(input)) {
    if (playerParticipationLedger !== undefined) {
      playerParticipationLedger = closePlayerParticipationMonth(playerParticipationLedger, input.seasonId, monthKey);
    }
  }

  return {
    careerState: createCareerState({
      ...adapted.careerState,
      ...(playerParticipationLedger === undefined ? {} : { playerParticipationLedger }),
    }),
    changes,
  };
}

interface DevelopOnePlayerInput {
  readonly player: Player;
  readonly age: number;
  readonly positionGroup: BroadPositionGroup;
  readonly developmentRole: PlayerRole;
  readonly worldSeed: string;
  readonly seasonId: SeasonId;
  readonly participationRows: readonly PlayerParticipationRow[];
}

function developOnePlayer(input: DevelopOnePlayerInput): {
  readonly player: Player;
  readonly totalGrowth: number;
  readonly totalDecline: number;
  readonly improvedAbilityCount: number;
  readonly declinedAbilityCount: number;
} {
  const realizationModifier = playerRealizationModifier(input);
  let totalGrowth = 0;
  let totalDecline = 0;
  let improvedAbilityCount = 0;
  let declinedAbilityCount = 0;
  let abilities = input.player.abilities;
  let potential = input.player.potential;

  for (const participationRow of input.participationRows) {
    const policy = monthlyDevelopmentPolicy({
      age: input.age,
      positionGroup: input.positionGroup,
      participation: participationRow,
    });
    if (policy.growthMultiplier > 0) {
      const growthRng = deriveRng(input.worldSeed, "player-development-growth", input.seasonId, participationRow.monthKey, input.player.id);
      abilities = mapPlayerAbilities(abilities, (currentValue, abilityPath) => {
        const current = Number(currentValue);
        const potentialValue = Number(readPlayerAbility(potential, abilityPath));
        const hardCap = hardCapForRoleAbility(input.developmentRole, abilityPath);
        const effectivePotential = hardCap === undefined ? potentialValue : Math.min(potentialValue, hardCap);
        const room = effectivePotential - current;
        if (room <= MINIMUM_GROWTH_ROOM) {
          return currentValue;
        }

        const relevance = roleRelevance(input.developmentRole, abilityPath);
        const monthVariance = 0.65 + growthRng.nextFloat() * 0.7;
        const roomMultiplier = Math.min(1, room / 5);
        const dynamicDelta = MAX_SINGLE_MONTH_GROWTH * policy.growthMultiplier * relevance * roomMultiplier * realizationModifier * monthVariance;
        const delta = Math.min(room, roundDelta(dynamicDelta));
        if (delta <= 0) {
          return currentValue;
        }

        totalGrowth += delta;
        improvedAbilityCount += 1;
        return abilityValue(roundAbility(current + delta));
      });
    }

    const aged = applyPlayerAgingPolicy({
      player: {
        ...input.player,
        abilities,
        potential,
      },
      age: input.age,
      positionGroup: input.positionGroup,
      developmentRole: input.developmentRole,
      worldSeed: input.worldSeed,
      seasonId: input.seasonId,
      monthKey: participationRow.monthKey,
    });
    abilities = aged.player.abilities;
    potential = aged.player.potential;
    totalDecline += aged.totalDecline;
    declinedAbilityCount += aged.declinedAbilityCount;
  }

  return {
    player: {
      ...input.player,
      abilities,
      potential,
    },
    totalGrowth,
    totalDecline,
    improvedAbilityCount,
    declinedAbilityCount,
  };
}

function playerRealizationModifier(input: DevelopOnePlayerInput): number {
  const rng = deriveRng(input.worldSeed, "player-development-realization", input.player.id);
  const roomAverage = summarizePlayerDevelopmentAbilities(input.player, input.developmentRole).potentialRoom;
  const roll = rng.nextFloat();

  if (roomAverage >= 7) {
    return 0.45 + roll * 0.7;
  }

  if (roomAverage >= 5) {
    return 0.35 + roll * 0.75;
  }

  if (roomAverage >= 3) {
    return 0.25 + roll * 0.65;
  }

  if (roomAverage >= 1.5) {
    return 0.15 + roll * 0.5;
  }

  return 0.05 + roll * 0.25;
}

function playerAgeYears(player: Player, currentDate: CareerState["gameState"]["calendar"]["currentDate"]): number {
  return Math.floor((currentDate - player.birthDate) / DAYS_PER_YEAR);
}

function broadPositionGroup(position: PlayerPosition | undefined): BroadPositionGroup {
  switch (position) {
    case "gk":
      return "goalkeeper";
    case "rb":
    case "cb":
    case "lb":
    case "rwb":
    case "lwb":
      return "defender";
    case "dm":
    case "cm":
    case "am":
      return "midfielder";
    case "rw":
    case "lw":
    case "st":
    default:
      return "attacker";
  }
}

function developmentRoleForPosition(position: PlayerPosition | undefined): PlayerRole {
  switch (position) {
    case "gk":
      return "goalkeeper";
    case "cb":
      return "center_back";
    case "rb":
    case "lb":
      return "full_back";
    case "rwb":
    case "lwb":
      return "wing_back";
    case "dm":
      return "defensive_midfielder";
    case "cm":
      return "central_midfielder";
    case "am":
      return "attacking_midfielder";
    case "rw":
    case "lw":
      return "winger";
    case "st":
    default:
      return "striker";
  }
}

function roleRelevance(role: PlayerRole, abilityPath: PlayerAbilityKey): number {
  return getPlayerRoleProfile(role).weights[abilityPath] ?? 0;
}

function roundAbility(value: number): number {
  return Math.max(1, Math.min(20, Math.round(value * 100) / 100));
}

function roundDelta(value: number): number {
  return Math.round(value * 100) / 100;
}

function openParticipationRowsByPlayer(input: PlayerDevelopmentInput): ReadonlyMap<PlayerId, readonly PlayerParticipationRow[]> {
  const rowsByPlayer = new Map<PlayerId, PlayerParticipationRow[]>();

  for (const row of openParticipationRows(input.careerState.playerParticipationLedger, input.seasonId)) {
    if (input.playerIds !== undefined && !input.playerIds.includes(row.playerId)) {
      continue;
    }

    const rows = rowsByPlayer.get(row.playerId) ?? [];
    rows.push(row);
    rowsByPlayer.set(row.playerId, rows);
  }

  return rowsByPlayer;
}

function openParticipationMonthKeys(input: PlayerDevelopmentInput): readonly PlayerDevelopmentMonthKey[] {
  const seen = new Set<PlayerDevelopmentMonthKey>();
  const monthKeys: PlayerDevelopmentMonthKey[] = [];

  for (const row of openParticipationRows(input.careerState.playerParticipationLedger, input.seasonId)) {
    if (input.playerIds !== undefined && !input.playerIds.includes(row.playerId)) {
      continue;
    }

    if (!seen.has(row.monthKey)) {
      seen.add(row.monthKey);
      monthKeys.push(row.monthKey);
    }
  }

  return monthKeys;
}

function openParticipationRows(
  ledger: PlayerParticipationLedger | undefined,
  seasonId: SeasonId,
): readonly PlayerParticipationRow[] {
  if (ledger === undefined) {
    return [];
  }

  const closed = new Set(ledger.closedMonthKeys);
  return ledger.rowKeys
    .map((rowKey) => ledger.rows[rowKey])
    .filter((row): row is PlayerParticipationRow => row !== undefined && row.seasonId === seasonId && !closed.has(`${row.seasonId}|${row.monthKey}`));
}
