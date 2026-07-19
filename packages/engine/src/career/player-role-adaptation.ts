import {
  PLAYER_ROLES,
  createCareerState,
  relatedPlayerRoleExposureCeiling,
  withPlayerRoleFamiliarity,
  type CareerState,
  type CanonicalPlayerRole,
  type Player,
  type PlayerDevelopmentMonthKey,
  type PlayerId,
  type PlayerParticipationLedger,
  type PlayerParticipationRow,
  type PlayerRole,
  type PlayerRoleFamiliarityLevel,
  type SeasonId,
} from "@game/domain";

const WEAK_TO_ADAPTED_MINUTES = 540;
const WEAK_TO_ADAPTED_MONTHS = 3;
const ADAPTED_TO_NATURAL_MINUTES = 1_350;
const ADAPTED_TO_NATURAL_MONTHS = 5;

/** Input for role familiarity progression from committed participation facts. */
export interface PlayerRoleAdaptationInput {
  /** Durable career state whose players and participation ledger are inspected. */
  readonly careerState: CareerState;
  /** Season whose open monthly rows can be consumed by this checkpoint. */
  readonly seasonId: SeasonId;
  /** Optional player subset used by focused reports and tests. */
  readonly playerIds?: readonly PlayerId[];
}

/** One role familiarity change caused by sustained played-role exposure. */
export interface PlayerRoleAdaptationChange {
  /** Player whose familiarity improved. */
  readonly playerId: PlayerId;
  /** Stable primary role that supplied the related-role graph edge. */
  readonly primaryRole: PlayerRole;
  /** Played related role that became more familiar. */
  readonly targetRole: PlayerRole;
  /** Familiarity before this checkpoint. */
  readonly previousFamiliarity: PlayerRoleFamiliarityLevel | undefined;
  /** Familiarity after this checkpoint. */
  readonly nextFamiliarity: PlayerRoleFamiliarityLevel;
  /** Minutes observed in the target role across eligible open rows. */
  readonly exposureMinutes: number;
  /** Distinct open months that supplied the target-role exposure. */
  readonly exposureMonthCount: number;
}

/** Result of applying related-role familiarity progression. */
export interface PlayerRoleAdaptationResult {
  /** Copied career state with any player familiarity updates applied. */
  readonly careerState: CareerState;
  /** Structured changes for diagnostics and tests. */
  readonly changes: readonly PlayerRoleAdaptationChange[];
}

/**
 * Applies slow, deterministic role familiarity progression from real minutes.
 *
 * The function reads only the durable participation ledger. It never changes a
 * player's primary role, archetype, abilities, potential, or match position.
 */
export function adaptPlayerRolesFromParticipation(input: PlayerRoleAdaptationInput): PlayerRoleAdaptationResult {
  const eligibleRows = openParticipationRows(input.careerState.playerParticipationLedger, input.seasonId);
  if (eligibleRows.length === 0) {
    return { careerState: input.careerState, changes: [] };
  }

  const playerFilter = input.playerIds === undefined ? undefined : new Set(input.playerIds);
  const players: Partial<Record<PlayerId, Player>> = { ...input.careerState.gameState.players };
  const changes: PlayerRoleAdaptationChange[] = [];

  for (const playerId of input.playerIds ?? input.careerState.gameState.playerIds) {
    if (playerFilter !== undefined && !playerFilter.has(playerId)) {
      continue;
    }

    const player = players[playerId];
    if (player === undefined || !isRoleIdentified(player)) {
      continue;
    }

    let updatedPlayer: Player = player;
    for (const targetRole of PLAYER_ROLES) {
      if (!isRoleIdentified(updatedPlayer)) {
        break;
      }

      const change = adaptationChangeForRole(updatedPlayer, targetRole, eligibleRows);
      if (change === undefined) {
        continue;
      }

      updatedPlayer = withPlayerRoleFamiliarity(updatedPlayer, targetRole, change.nextFamiliarity);
      changes.push(change);
    }

    players[playerId] = updatedPlayer;
  }

  if (changes.length === 0) {
    return { careerState: input.careerState, changes };
  }

  return {
    careerState: createCareerState({
      ...input.careerState,
      gameState: {
        ...input.careerState.gameState,
        players: players as CareerState["gameState"]["players"],
      },
    }),
    changes,
  };
}

function adaptationChangeForRole(
  player: Player & Required<Pick<Player, "primaryRole" | "archetype" | "naturalRoles" | "adaptedRoles" | "weakRoles" | "roleFamiliarity">>,
  targetRole: PlayerRole,
  rows: readonly PlayerParticipationRow[],
): PlayerRoleAdaptationChange | undefined {
  if (targetRole === player.primaryRole) {
    return undefined;
  }

  const ceiling = relatedPlayerRoleExposureCeiling(player.primaryRole, targetRole);
  if (ceiling === undefined) {
    return undefined;
  }

  const exposure = exposureForRole(player.id, targetRole, rows);
  const previousFamiliarity = player.roleFamiliarity[targetRole];
  const nextFamiliarity = nextFamiliarityForExposure(previousFamiliarity, ceiling, exposure);
  if (nextFamiliarity === undefined) {
    return undefined;
  }

  return {
    playerId: player.id,
    primaryRole: player.primaryRole,
    targetRole,
    previousFamiliarity,
    nextFamiliarity,
    exposureMinutes: exposure.minutes,
    exposureMonthCount: exposure.months.size,
  };
}

function nextFamiliarityForExposure(
  current: PlayerRoleFamiliarityLevel | undefined,
  ceiling: PlayerRoleFamiliarityLevel,
  exposure: { readonly minutes: number; readonly months: ReadonlySet<PlayerDevelopmentMonthKey> },
): PlayerRoleFamiliarityLevel | undefined {
  if (current === "natural") {
    return undefined;
  }

  if (
    current === "adapted" &&
    ceiling === "natural" &&
    exposure.minutes >= ADAPTED_TO_NATURAL_MINUTES &&
    exposure.months.size >= ADAPTED_TO_NATURAL_MONTHS
  ) {
    return "natural";
  }

  if (
    current !== "adapted" &&
    exposure.minutes >= WEAK_TO_ADAPTED_MINUTES &&
    exposure.months.size >= WEAK_TO_ADAPTED_MONTHS
  ) {
    return "adapted";
  }

  return undefined;
}

function exposureForRole(
  playerId: PlayerId,
  targetRole: PlayerRole,
  rows: readonly PlayerParticipationRow[],
): { readonly minutes: number; readonly months: ReadonlySet<PlayerDevelopmentMonthKey> } {
  let minutes = 0;
  const months = new Set<PlayerDevelopmentMonthKey>();

  for (const row of rows) {
    if (row.playerId !== playerId) {
      continue;
    }

    for (const [playedRole, roleMinutes] of Object.entries(row.playedRoleMinutes)) {
      if (roleMinutes === undefined || playerRoleForCanonicalRole(playedRole as CanonicalPlayerRole) !== targetRole) {
        continue;
      }

      minutes += roleMinutes;
      months.add(row.monthKey);
    }
  }

  return { minutes, months };
}

function playerRoleForCanonicalRole(role: CanonicalPlayerRole): PlayerRole {
  switch (role) {
    case "goalkeeper":
      return "goalkeeper";
    case "right_full_back":
    case "left_full_back":
      return "full_back";
    case "center_back":
      return "center_back";
    case "defensive_midfielder":
      return "defensive_midfielder";
    case "central_midfielder":
      return "central_midfielder";
    case "right_midfielder":
    case "left_midfielder":
      return "wide_midfielder";
    case "attacking_midfielder":
      return "attacking_midfielder";
    case "right_winger":
    case "left_winger":
      return "winger";
    case "striker":
      return "striker";
  }
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

function isRoleIdentified(player: Player): player is Player & Required<Pick<Player, "primaryRole" | "archetype" | "naturalRoles" | "adaptedRoles" | "weakRoles" | "roleFamiliarity">> {
  return (
    player.primaryRole !== undefined &&
    player.archetype !== undefined &&
    player.naturalRoles !== undefined &&
    player.adaptedRoles !== undefined &&
    player.weakRoles !== undefined &&
    player.roleFamiliarity !== undefined
  );
}
