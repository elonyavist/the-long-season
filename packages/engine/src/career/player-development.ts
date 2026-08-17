import {
  abilityValue,
  clubId,
  createCareerState,
  gameDate,
  foldPlayerAbilities,
  getPlayerRoleProfile,
  hardCapForRoleAbility,
  mapPlayerAbilities,
  rawDiagnosticAbilityAverage,
  readPlayerAbility,
  roleAttributeBucket,
  roleCurrentAbility,
  rolePotentialAbility,
  ROLE_ATTRIBUTE_BUCKETS,
  type RoleAttributeBucket,
  type CareerState,
  type ClubId,
  type Player,
  type PlayerAbilities,
  type PlayerAbilityKey,
  type PlayerDevelopmentEnvironmentConfig,
  type PlayerDevelopmentMonthKey,
  type PlayerId,
  type PlayerParticipationRow,
  type PlayerPosition,
  type PlayerRole,
  type RoleCurrentAbility,
  type RolePotentialAbility,
  type SeasonId,
} from "@game/domain";
import { deriveRng, fromISO } from "@game/shared";

import { completedPlayerAge } from "../player-state/completed-player-age.ts";

import { applyPlayerAgingPolicy } from "./player-aging-policy.ts";
import { deriveClubDevelopmentEnvironment } from "./club-development-environment.ts";
import {
  broadPositionGroup,
  monthlyDevelopmentPolicy,
  type BroadPositionGroup,
} from "./player-development-policy.ts";
import {
  adaptPlayerRolesFromParticipation,
  type PlayerRoleAdaptationChange,
} from "./player-role-adaptation.ts";

const MINIMUM_GROWTH_ROOM = 0.05;
// Three complete academy fixtures yield 270 monthly minutes, so opportunity
// (0.75) and the core youth age band (0.85) turn this input into at most 0.172
// for a fully relevant high-room attribute before environment and variance.
// It is an upper input, never a flat award, and true potential remains final.
const MAX_SINGLE_MONTH_GROWTH = 0.27;
const MINIMUM_MONTH_VARIANCE = 0.65;
const MONTH_VARIANCE_SPAN = 0.7;
const NEUTRAL_ENVIRONMENT_BASIS_POINTS = 10_000;
const MAXIMUM_BATCH_MONTHS = 3;
const DEVELOPMENT_MONTH_KEY = /^(\d{4})-(0[1-9]|1[0-2])$/;

/** Stable failures raised before an invalid batch can change player facts. */
export type PlayerDevelopmentErrorCode =
  | "duplicate_participation_row"
  | "invalid_participation_month"
  | "missing_participation_club_minutes"
  | "participation_club_minutes_mismatch"
  | "participation_row_not_in_ledger"
  | "participation_season_mismatch"
  | "player_not_active"
  | "too_many_participation_months";

/** Typed development failure used by orchestration and deterministic tests. */
export class PlayerDevelopmentError extends Error {
  public readonly code: PlayerDevelopmentErrorCode;

  /** Creates one machine-readable player-development failure. */
  public constructor(code: PlayerDevelopmentErrorCode, message: string) {
    super(message);
    this.name = "PlayerDevelopmentError";
    this.code = code;
  }
}

/** Input for one ordered batch of canonical monthly participation rows. */
export interface DevelopPlayersFromParticipationRowsInput {
  /** Durable career state whose player and club facts own the batch. */
  readonly careerState: CareerState;
  /** Stable world seed used by deterministic monthly development streams. */
  readonly worldSeed: string;
  /** Season that owns every supplied participation row. */
  readonly seasonId: SeasonId;
  /** Exact canonical monthly rows selected by the calendar orchestrator. */
  readonly participationRows: readonly PlayerParticipationRow[];
  /** Version-linked seven-state environment policy selected by an Adapter. */
  readonly developmentEnvironmentConfig: PlayerDevelopmentEnvironmentConfig;
  /**
   * Observation-only L6.43B seam requesting a per-month bucket split.
   *
   * Development is identical whether or not this is supplied; the flag only
   * decides whether an extra read of the already-computed player is recorded.
   */
  readonly observePlayerIds?: readonly PlayerId[];
}

/** Input for deriving canonical environment evidence without developing players. */
export interface DerivePlayerDevelopmentEnvironmentEvidenceInput {
  /** Current career facts owning every attributed club. */
  readonly careerState: CareerState;
  /** Participation rows retained in caller order. */
  readonly participationRows: readonly PlayerParticipationRow[];
  /** Version-linked seven-state environment policy selected by an Adapter. */
  readonly developmentEnvironmentConfig: PlayerDevelopmentEnvironmentConfig;
}

/** Exact environment fact paired with one supplied participation row. */
export interface PlayerDevelopmentEnvironmentEvidence {
  readonly rowKey: string;
  readonly playerId: PlayerId;
  readonly monthKey: PlayerDevelopmentMonthKey;
  /** Minutes that contributed club-environment evidence. */
  readonly sourceMinutes: number;
  /** Weighted production multiplier; neutral for a zero-minute row. */
  readonly positiveGrowthEnvironmentBasisPoints: number;
}

/** One player's aggregate change across one development batch. */
export interface PlayerDevelopmentChange {
  /** Player affected by this batch. */
  readonly playerId: PlayerId;
  /** Whole-years age at the final monthly checkpoint in this batch. */
  readonly age: number;
  /** Broad position bucket used by the development model. */
  readonly positionGroup: BroadPositionGroup;
  /** Total positive ability growth across every processed month. */
  readonly totalGrowth: number;
  /** Total ability decline across every processed month. */
  readonly totalDecline: number;
  /** Number of monthly attribute improvements across this batch. */
  readonly improvedAbilityCount: number;
  /** Number of monthly attribute declines across this batch. */
  readonly declinedAbilityCount: number;
  /** Current role-weighted ability before the first processed month. */
  readonly roleCurrentAbilityBefore: RoleCurrentAbility;
  /** Current role-weighted ability after the final processed month. */
  readonly roleCurrentAbilityAfter: RoleCurrentAbility;
  /** Reachable potential after the final monthly aging pass. */
  readonly rolePotentialAbility: RolePotentialAbility;
}

/** One player's factual change at one exact monthly checkpoint. */
export interface PlayerMonthlyDevelopmentChange extends PlayerDevelopmentChange {
  /** Canonical month whose evidence produced this change. */
  readonly monthKey: PlayerDevelopmentMonthKey;
  /** Minutes from the canonical participation row. */
  readonly minutes: number;
  /** Weighted club-environment multiplier applied only to positive growth. */
  readonly positiveGrowthEnvironmentBasisPoints: number;
  /** Reload-stable player/season/month variance used for this row. */
  readonly developmentVariance: number;
}

/**
 * Relevance-bucket ability aggregate for one observed player-month.
 *
 * Totals and count rather than means: the mean is derivable, so storing it
 * would duplicate one fact. Growth is applied per attribute in proportion to
 * role relevance while ability is measured as a weighted average over the same
 * weights, so the aggregate role margin cannot show which bucket stopped
 * moving. Only an observed diagnostic needs that split.
 */
export interface PlayerDevelopmentBucketMargin {
  /** Canonical relevance bucket for the player's development role. */
  readonly bucket: RoleAttributeBucket;
  /** Attributes falling in this bucket for that role. */
  readonly attributeCount: number;
  /** Sum of current ability across the bucket after this month. */
  readonly currentTotal: number;
  /** Sum of effective potential across the bucket, role hard caps applied. */
  readonly potentialTotal: number;
}

/** One observed player-month carrying the canonical change plus bucket split. */
export interface PlayerMonthlyDevelopmentObservation {
  /** The canonical monthly change, unchanged and not recomputed. */
  readonly change: PlayerMonthlyDevelopmentChange;
  /** Role whose profile defined the buckets and hard caps. */
  readonly developmentRole: PlayerRole;
  /** Bucket split taken at this exact monthly checkpoint. */
  readonly bucketMargins: readonly PlayerDevelopmentBucketMargin[];
  /**
   * Rating evidence the canonical policy reads and the change does not carry.
   *
   * A consumer recomposes `MonthlyDevelopmentParticipationFacts` from these two
   * numbers plus the minutes already on `change`, and calls the canonical
   * policy rather than restating any multiplier. Minutes are deliberately not
   * repeated here: a derived value stored twice is a value that can disagree
   * with itself.
   */
  readonly ratingTotal: PlayerParticipationRow["ratingTotal"];
  /** Sample count paired with `ratingTotal`; zero means no rated minutes. */
  readonly ratingSamples: PlayerParticipationRow["ratingSamples"];
}

/** Result of one pure ordered player-development batch. */
export interface PlayerDevelopmentResult {
  /** Copied career state with developed abilities and role familiarity. */
  readonly careerState: CareerState;
  /** One aggregate row per player represented by the supplied month rows. */
  readonly changes: readonly PlayerDevelopmentChange[];
  /** Exact per-player/month changes used by calendar summaries and diagnostics. */
  readonly monthlyChanges: readonly PlayerMonthlyDevelopmentChange[];
  /** Familiarity changes reached from cumulative same-season exposure. */
  readonly roleAdaptationChanges: readonly PlayerRoleAdaptationChange[];
  /**
   * Bucket-split observations for the requested players only.
   *
   * Present only when `observePlayerIds` was supplied. The split is taken at
   * the exact monthly checkpoint because the batch career state reflects up to
   * three applied months and could not attribute a value to one of them.
   */
  readonly monthlyObservations?: readonly PlayerMonthlyDevelopmentObservation[];
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
 * Applies monthly evidence in canonical order while copying the player map once.
 *
 * Calendar orchestration owns batch selection and closed-month checkpoints.
 * This function deliberately does neither, so applying three rows together is
 * equivalent to applying the same rows one at a time.
 */
export function developPlayersFromParticipationRows(
  input: DevelopPlayersFromParticipationRowsInput,
): PlayerDevelopmentResult {
  const orderedRows = validateAndOrderParticipationRows(input);
  const observedPlayerIds = input.observePlayerIds === undefined
    ? undefined
    : new Set(input.observePlayerIds);
  if (orderedRows.length === 0) {
    return {
      careerState: input.careerState,
      changes: [],
      monthlyChanges: [],
      roleAdaptationChanges: [],
      ...(observedPlayerIds === undefined ? {} : { monthlyObservations: [] }),
    };
  }
  const monthlyObservations: PlayerMonthlyDevelopmentObservation[] = [];

  const players: Partial<Record<PlayerId, Player>> = {
    ...input.careerState.gameState.players,
  };
  const initialPlayerById = new Map<PlayerId, Player>();
  const processedPlayerIds: PlayerId[] = [];
  const seenPlayerIds = new Set<PlayerId>();
  const environmentEvidence = derivePlayerDevelopmentEnvironmentEvidence({
    careerState: input.careerState,
    participationRows: orderedRows,
    developmentEnvironmentConfig: input.developmentEnvironmentConfig,
  });
  const monthlyChanges: PlayerMonthlyDevelopmentChange[] = [];

  for (let rowIndex = 0; rowIndex < orderedRows.length; rowIndex += 1) {
    const participationRow = orderedRows[rowIndex]!;
    const environment = environmentEvidence[rowIndex];
    if (environment?.rowKey !== participationRow.rowKey) {
      throw new PlayerDevelopmentError(
        "participation_row_not_in_ledger",
        `environment evidence lost participation row order: ${participationRow.rowKey}`,
      );
    }
    const player = players[participationRow.playerId];
    if (player === undefined) {
      throw new PlayerDevelopmentError(
        "player_not_active",
        `participation row references a missing player: ${participationRow.playerId}`,
      );
    }
    if (!seenPlayerIds.has(player.id)) {
      seenPlayerIds.add(player.id);
      processedPlayerIds.push(player.id);
      initialPlayerById.set(player.id, player);
    }

    const age = playerAgeAtMonthCheckpoint(player, participationRow.monthKey);
    const positionGroup = broadPositionGroup(player.naturalPositions[0]);
    const developmentRole =
      player.primaryRole ?? developmentRoleForPosition(player.naturalPositions[0]);
    const positiveGrowthEnvironmentBasisPoints =
      environment.positiveGrowthEnvironmentBasisPoints;
    const developed = developOnePlayerMonth({
      player,
      age,
      positionGroup,
      developmentRole,
      worldSeed: input.worldSeed,
      seasonId: input.seasonId,
      participationRow,
      positiveGrowthEnvironmentBasisPoints,
    });
    const roleProfile = getPlayerRoleProfile(developmentRole);

    players[player.id] = developed.player;
    const monthlyChange: PlayerMonthlyDevelopmentChange = {
      playerId: player.id,
      monthKey: participationRow.monthKey,
      age,
      positionGroup,
      minutes: participationRow.minutes,
      positiveGrowthEnvironmentBasisPoints,
      developmentVariance: developed.developmentVariance,
      totalGrowth: roundDelta(developed.totalGrowth),
      totalDecline: roundDelta(developed.totalDecline),
      improvedAbilityCount: developed.improvedAbilityCount,
      declinedAbilityCount: developed.declinedAbilityCount,
      roleCurrentAbilityBefore: roleCurrentAbility(player.abilities, roleProfile),
      roleCurrentAbilityAfter: roleCurrentAbility(developed.player.abilities, roleProfile),
      rolePotentialAbility: rolePotentialAbility(developed.player.potential, roleProfile),
    };
    monthlyChanges.push(monthlyChange);
    if (observedPlayerIds?.has(player.id) === true) {
      monthlyObservations.push({
        change: monthlyChange,
        developmentRole,
        bucketMargins: bucketMarginsForPlayer(developed.player, developmentRole),
        ratingTotal: participationRow.ratingTotal,
        ratingSamples: participationRow.ratingSamples,
      });
    }
  }

  const stateAfterAbilities = createCareerState({
    ...input.careerState,
    gameState: {
      ...input.careerState.gameState,
      players: players as CareerState["gameState"]["players"],
    },
  });
  const throughMonthKey = orderedRows.at(-1)!.monthKey;
  const adapted = adaptPlayerRolesFromParticipation({
    careerState: stateAfterAbilities,
    seasonId: input.seasonId,
    throughMonthKey,
    playerIds: processedPlayerIds,
  });

  return {
    careerState: adapted.careerState,
    changes: aggregatePlayerChanges({
      initialPlayerById,
      finalCareerState: adapted.careerState,
      processedPlayerIds,
      monthlyChanges,
    }),
    monthlyChanges,
    roleAdaptationChanges: adapted.changes,
    ...(observedPlayerIds === undefined ? {} : { monthlyObservations }),
  };
}

/**
 * Splits one developed player's abilities by canonical relevance bucket.
 *
 * Effective potential applies the role hard cap exactly as the growth loop
 * does, so a bucket margin of zero means the same thing in both places.
 */
function bucketMarginsForPlayer(
  player: Player,
  developmentRole: PlayerRole,
): readonly PlayerDevelopmentBucketMargin[] {
  const totals = new Map<RoleAttributeBucket, { count: number; current: number; potential: number }>();
  for (const bucket of ROLE_ATTRIBUTE_BUCKETS) {
    totals.set(bucket, { count: 0, current: 0, potential: 0 });
  }

  foldPlayerAbilities(player.abilities, 0, (_unused, value, abilityPath) => {
    const bucket = roleAttributeBucket(developmentRole, abilityPath);
    const entry = totals.get(bucket)!;
    const potentialValue = Number(readPlayerAbility(player.potential, abilityPath));
    const hardCap = hardCapForRoleAbility(developmentRole, abilityPath);
    entry.count += 1;
    entry.current += Number(value);
    entry.potential += hardCap === undefined
      ? potentialValue
      : Math.min(potentialValue, hardCap);
    return 0;
  });

  return ROLE_ATTRIBUTE_BUCKETS.map((bucket) => {
    const entry = totals.get(bucket)!;
    return {
      bucket,
      attributeCount: entry.count,
      currentTotal: roundDelta(entry.current),
      potentialTotal: roundDelta(entry.potential),
    };
  });
}

interface DevelopOnePlayerMonthInput {
  readonly player: Player;
  readonly age: number;
  readonly positionGroup: BroadPositionGroup;
  readonly developmentRole: PlayerRole;
  readonly worldSeed: string;
  readonly seasonId: SeasonId;
  readonly participationRow: PlayerParticipationRow;
  readonly positiveGrowthEnvironmentBasisPoints: number;
}

function developOnePlayerMonth(input: DevelopOnePlayerMonthInput): {
  readonly player: Player;
  readonly totalGrowth: number;
  readonly totalDecline: number;
  readonly improvedAbilityCount: number;
  readonly declinedAbilityCount: number;
  readonly developmentVariance: number;
} {
  const policy = monthlyDevelopmentPolicy({
    age: input.age,
    positionGroup: input.positionGroup,
    participation: input.participationRow,
    positiveGrowthEnvironmentBasisPoints:
      input.positiveGrowthEnvironmentBasisPoints,
  });
  const developmentVariance = monthlyDevelopmentVariance({
    worldSeed: input.worldSeed,
    seasonId: input.seasonId,
    monthKey: input.participationRow.monthKey,
    playerId: input.player.id,
  });
  let totalGrowth = 0;
  let improvedAbilityCount = 0;
  let abilities = input.player.abilities;

  if (policy.growthMultiplier > 0) {
    abilities = mapPlayerAbilities(abilities, (currentValue, abilityPath) => {
      const current = Number(currentValue);
      const potentialValue = Number(
        readPlayerAbility(input.player.potential, abilityPath),
      );
      const hardCap = hardCapForRoleAbility(input.developmentRole, abilityPath);
      const effectivePotential =
        hardCap === undefined ? potentialValue : Math.min(potentialValue, hardCap);
      const room = effectivePotential - current;
      if (room <= MINIMUM_GROWTH_ROOM) {
        return currentValue;
      }

      const relevance = roleRelevance(input.developmentRole, abilityPath);
      // `room` already owns the ceiling through Math.min below. Multiplying the
      // monthly rate by that same room would charge the distance to potential
      // twice and make the last credible step asymptotic before the dated age
      // policy closes the growth window.
      const dynamicDelta =
        MAX_SINGLE_MONTH_GROWTH
        * policy.growthMultiplier
        * relevance
        * developmentVariance;
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
    },
    age: input.age,
    positionGroup: input.positionGroup,
    developmentRole: input.developmentRole,
    worldSeed: input.worldSeed,
    seasonId: input.seasonId,
    monthKey: input.participationRow.monthKey,
  });

  return {
    player: aged.player,
    totalGrowth,
    totalDecline: aged.totalDecline,
    improvedAbilityCount,
    declinedAbilityCount: aged.declinedAbilityCount,
    developmentVariance,
  };
}

/** Returns the single reload-stable luck scalar for one player-month. */
export function monthlyDevelopmentVariance(input: {
  readonly worldSeed: string;
  readonly seasonId: SeasonId;
  readonly monthKey: PlayerDevelopmentMonthKey;
  readonly playerId: PlayerId;
}): number {
  const rng = deriveRng(
    input.worldSeed,
    "player-development-month-variance",
    input.seasonId,
    input.monthKey,
    input.playerId,
  );
  return MINIMUM_MONTH_VARIANCE + rng.nextFloat() * MONTH_VARIANCE_SPAN;
}

function validateAndOrderParticipationRows(
  input: DevelopPlayersFromParticipationRowsInput,
): readonly PlayerParticipationRow[] {
  const ledger = input.careerState.playerParticipationLedger;
  const seenRowKeys = new Set<string>();
  const copiedRows = [...input.participationRows];

  for (const row of copiedRows) {
    if (row.seasonId !== input.seasonId) {
      throw new PlayerDevelopmentError(
        "participation_season_mismatch",
        `participation row ${row.rowKey} belongs to ${row.seasonId}, expected ${input.seasonId}`,
      );
    }
    if (!DEVELOPMENT_MONTH_KEY.test(row.monthKey)) {
      throw new PlayerDevelopmentError(
        "invalid_participation_month",
        `participation row has a non-canonical month: ${row.monthKey}`,
      );
    }
    if (seenRowKeys.has(row.rowKey)) {
      throw new PlayerDevelopmentError(
        "duplicate_participation_row",
        `participation row was supplied twice: ${row.rowKey}`,
      );
    }
    if (ledger?.rows[row.rowKey] === undefined) {
      throw new PlayerDevelopmentError(
        "participation_row_not_in_ledger",
        `participation row is not present in the career ledger: ${row.rowKey}`,
      );
    }
    seenRowKeys.add(row.rowKey);
  }

  const monthCount = new Set(copiedRows.map((row) => row.monthKey)).size;
  if (monthCount > MAXIMUM_BATCH_MONTHS) {
    throw new PlayerDevelopmentError(
      "too_many_participation_months",
      `one development batch accepts at most ${MAXIMUM_BATCH_MONTHS} months, received ${monthCount}`,
    );
  }

  return copiedRows.sort((left, right) =>
    left.monthKey.localeCompare(right.monthKey)
      || left.rowKey.localeCompare(right.rowKey),
  );
}

/**
 * Derives minute-weighted club-environment evidence without RNG or mutation.
 *
 * The result retains the caller's exact row order. Production development and
 * diagnostics both use this owner, so a multi-club month cannot be interpreted
 * differently by a report. Zero-minute rows remain explicit with zero source
 * minutes and the neutral production multiplier.
 */
export function derivePlayerDevelopmentEnvironmentEvidence(
  input: DerivePlayerDevelopmentEnvironmentEvidenceInput,
): readonly PlayerDevelopmentEnvironmentEvidence[] {
  const environmentBasisPointsByClubId = new Map<ClubId, number>();

  return input.participationRows.map((participationRow) => {
    if (participationRow.minutes === 0) {
      return {
        rowKey: participationRow.rowKey,
        playerId: participationRow.playerId,
        monthKey: participationRow.monthKey,
        sourceMinutes: 0,
        positiveGrowthEnvironmentBasisPoints:
          NEUTRAL_ENVIRONMENT_BASIS_POINTS,
      };
    }

    let sourceMinutes = 0;
    let weightedBasisPoints = 0;
    for (const [rawClubId, minutes] of Object.entries(
      participationRow.clubMinutes,
    )) {
      if (minutes === undefined || minutes === 0) {
        continue;
      }

      const attributedClubId = clubId(rawClubId);
      let basisPoints = environmentBasisPointsByClubId.get(attributedClubId);
      if (basisPoints === undefined) {
        basisPoints = deriveClubDevelopmentEnvironment({
          careerState: input.careerState,
          clubId: attributedClubId,
          config: input.developmentEnvironmentConfig,
        }).positiveGrowthMultiplierBasisPoints;
        environmentBasisPointsByClubId.set(attributedClubId, basisPoints);
      }

      sourceMinutes += minutes;
      weightedBasisPoints += minutes * basisPoints;
    }

    if (sourceMinutes === 0) {
      throw new PlayerDevelopmentError(
        "missing_participation_club_minutes",
        `positive participation has no club-minute evidence: ${participationRow.rowKey}`,
      );
    }
    if (sourceMinutes !== participationRow.minutes) {
      throw new PlayerDevelopmentError(
        "participation_club_minutes_mismatch",
        `club minutes do not equal participation minutes for ${participationRow.rowKey}: ${sourceMinutes}/${participationRow.minutes}`,
      );
    }

    return {
      rowKey: participationRow.rowKey,
      playerId: participationRow.playerId,
      monthKey: participationRow.monthKey,
      sourceMinutes,
      positiveGrowthEnvironmentBasisPoints:
        weightedBasisPoints / sourceMinutes,
    };
  });
}

function aggregatePlayerChanges(input: {
  readonly initialPlayerById: ReadonlyMap<PlayerId, Player>;
  readonly finalCareerState: CareerState;
  readonly processedPlayerIds: readonly PlayerId[];
  readonly monthlyChanges: readonly PlayerMonthlyDevelopmentChange[];
}): readonly PlayerDevelopmentChange[] {
  return input.processedPlayerIds.map((playerId) => {
    const initialPlayer = input.initialPlayerById.get(playerId)!;
    const finalPlayer = input.finalCareerState.gameState.players[playerId]!;
    const playerMonths = input.monthlyChanges.filter(
      (change) => change.playerId === playerId,
    );
    const lastMonth = playerMonths.at(-1)!;
    const developmentRole =
      initialPlayer.primaryRole
      ?? developmentRoleForPosition(initialPlayer.naturalPositions[0]);
    const roleProfile = getPlayerRoleProfile(developmentRole);

    return {
      playerId,
      age: lastMonth.age,
      positionGroup: lastMonth.positionGroup,
      totalGrowth: roundDelta(
        playerMonths.reduce((sum, change) => sum + change.totalGrowth, 0),
      ),
      totalDecline: roundDelta(
        playerMonths.reduce((sum, change) => sum + change.totalDecline, 0),
      ),
      improvedAbilityCount: playerMonths.reduce(
        (sum, change) => sum + change.improvedAbilityCount,
        0,
      ),
      declinedAbilityCount: playerMonths.reduce(
        (sum, change) => sum + change.declinedAbilityCount,
        0,
      ),
      roleCurrentAbilityBefore: roleCurrentAbility(
        initialPlayer.abilities,
        roleProfile,
      ),
      roleCurrentAbilityAfter: roleCurrentAbility(
        finalPlayer.abilities,
        roleProfile,
      ),
      rolePotentialAbility: rolePotentialAbility(
        finalPlayer.potential,
        roleProfile,
      ),
    };
  });
}

/**
 * Completed age a birth date has reached at one development month's checkpoint.
 *
 * The single answer to "how old was he that month", exposed so a diagnostic can
 * age a player across months he never played without owning a second reading of
 * the development calendar. The month-end boundary stays private deliberately:
 * a consumer given the raw date could place the checkpoint elsewhere, and two
 * calendars that disagree by one day would silently move a player across an age
 * band and out of his growth window.
 */
export function completedPlayerAgeAtDevelopmentMonth(
  birthDate: Player["birthDate"],
  monthKey: PlayerDevelopmentMonthKey,
): number {
  return completedPlayerAge(birthDate, gameDate(monthEndEpochDay(monthKey)));
}

function playerAgeAtMonthCheckpoint(
  player: Player,
  monthKey: PlayerDevelopmentMonthKey,
): number {
  return completedPlayerAgeAtDevelopmentMonth(player.birthDate, monthKey);
}

function monthEndEpochDay(monthKey: PlayerDevelopmentMonthKey): number {
  const match = DEVELOPMENT_MONTH_KEY.exec(monthKey);
  if (match === null) {
    throw new PlayerDevelopmentError(
      "invalid_participation_month",
      `development month must use YYYY-MM: ${monthKey}`,
    );
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const nextYear = month === 12 ? year + 1 : year;
  const nextMonth = month === 12 ? 1 : month + 1;
  return fromISO(
    `${String(nextYear).padStart(4, "0")}-${String(nextMonth).padStart(2, "0")}-01`,
  ) - 1;
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
    case "rm":
    case "lm":
      return "wide_midfielder";
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
