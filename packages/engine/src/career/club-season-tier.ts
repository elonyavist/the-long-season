import {
  CLUB_COMPETITIVE_TIER_POLICY_VERSION,
  clubCompetitiveTierFor,
  competitiveTierForRank,
  createClubCompetitiveTierState,
  getPlayerRoleProfile,
  playerSquadDepartment,
  roleCurrentAbility,
  type CareerState,
  type Club,
  type ClubCategory,
  type ClubCompetitiveTier,
  type ClubCompetitiveTierState,
  type ClubId,
  type Player,
  type PlayerId,
  type PlayerSquadDepartment,
  type SeasonId,
} from "@game/domain";

/** Fixed division size owned by the competitive-tier v1 policy. */
export const CLUB_COMPETITIVE_TIER_DIVISION_SIZE = 18;
const BASIS_POINTS_MAXIMUM = 10_000;
const MAX_USEFUL_BENCH_PLAYERS = 8;
const BENCH_PLAYER_WEIGHT = 0.5;
const ROSTER_SCORE_WEIGHT = 7;
const RESULT_SCORE_WEIGHT = 3;
const MAX_REPUTATION_CHANGE = 2;

type SquadDepartment = PlayerSquadDepartment;

const SQUAD_DEPARTMENT_ORDER: readonly SquadDepartment[] = [
  "goalkeeper",
  "defender",
  "midfielder",
  "attacker",
];

const BEST_XI_DEPARTMENT_QUOTAS: Readonly<Record<SquadDepartment, number>> = {
  goalkeeper: 1,
  defender: 4,
  midfielder: 4,
  attacker: 2,
};

const DIVISION_INDEX: Readonly<Record<ClubCategory, number>> = {
  first_division: 0,
  second_division: 1,
  third_division: 2,
};

const REPUTATION_BAND: Readonly<Record<ClubCategory, readonly [number, number]>> = {
  first_division: [14, 19],
  second_division: [9, 14],
  third_division: [4, 9],
};

const TIER_REPUTATION_ANCHOR: Readonly<Record<ClubCompetitiveTier, number>> = {
  survival: 0,
  mid_table: 3_333,
  playoff_contender: 6_667,
  title_contender: 10_000,
};

/** Completed sporting facts used exactly once at the following rollover. */
export interface ClubCompletedSeasonResult {
  /** Division occupied during the completed season. */
  readonly previousCategory: ClubCategory;
  /** Final 1-based position in the completed division. */
  readonly finalPosition: number;
  /** Number of clubs in that completed table. */
  readonly clubCount: number;
  /** Whether the club won its completed competition. */
  readonly champion: boolean;
  /** Cross-division movement applied before the next tier is ranked. */
  readonly movement?: "promoted" | "relegated";
}

/** One transparent row from the season-tier calculation. */
export interface ClubSeasonTierFact {
  readonly clubId: ClubId;
  readonly category: ClubCategory;
  readonly calculation: "recalculated" | "carried_forward";
  readonly bestXiStrength: number | null;
  readonly usefulBenchStrength: number | null;
  readonly rawRosterStrength: number | null;
  readonly normalizedRosterStrengthBasisPoints: number | null;
  readonly correctedResultBasisPoints: number | null;
  readonly rankingScore: number | null;
  readonly rank: number | null;
  readonly tier: ClubCompetitiveTier;
  readonly previousReputation: number;
  readonly reputationTarget: number;
  readonly nextReputation: number;
}

/** Atomic club portion applied with the next-season calendar rollover. */
export interface ClubSeasonTierUpdate {
  readonly clubs: CareerState["gameState"]["clubs"];
  readonly tierState: ClubCompetitiveTierState;
  readonly facts: readonly ClubSeasonTierFact[];
}

/** Current-ability summary of a balanced XI and its useful bench. */
export interface ClubRosterStrength {
  readonly bestXiStrength: number;
  readonly usefulBenchStrength: number;
  readonly rawRosterStrength: number;
}

/** Stable input or state error in the competitive-tier calculation. */
export type ClubSeasonTierErrorCode =
  | "club_roster_empty"
  | "club_player_missing"
  | "club_player_role_missing"
  | "completed_result_invalid";

/** Typed error used by the season boundary instead of silent neutralization. */
export class ClubSeasonTierError extends Error {
  public readonly code: ClubSeasonTierErrorCode;

  public constructor(code: ClubSeasonTierErrorCode, message: string) {
    super(message);
    this.name = "ClubSeasonTierError";
    this.code = code;
  }
}

/**
 * Derives next-season tiers and bounded reputation without mutating the career.
 *
 * A division is recalculated only when every member has authoritative
 * completed-season evidence. Report-only partial worlds carry the whole
 * division forward instead of mixing observed and invented results.
 */
export function deriveClubSeasonTierUpdate(input: {
  readonly careerState: CareerState;
  readonly nextSeasonId: SeasonId;
  readonly completedResultByClubId: Readonly<Partial<Record<ClubId, ClubCompletedSeasonResult>>>;
}): ClubSeasonTierUpdate {
  const facts: ClubSeasonTierFact[] = [];
  const tierByClubId = {} as Record<ClubId, ClubCompetitiveTier>;
  const reputationByClubId = {} as Record<ClubId, number>;
  const categories: readonly ClubCategory[] = [
    "first_division",
    "second_division",
    "third_division",
  ];

  for (const category of categories) {
    const divisionClubs = input.careerState.gameState.clubIds
      .map((clubId) => input.careerState.gameState.clubs[clubId])
      .filter((club): club is Club => club?.category === category);
    if (divisionClubs.length === 0) continue;

    const hasCompleteResults = divisionClubs.every(
      (club) => input.completedResultByClubId[club.id] !== undefined,
    );

    if (!hasCompleteResults) {
      for (const club of divisionClubs) {
        const tier = clubCompetitiveTierFor(
          input.careerState.clubCompetitiveTierState,
          club.id,
        );
        tierByClubId[club.id] = tier;
        reputationByClubId[club.id] = club.reputation;
        facts.push({
          clubId: club.id,
          category,
          calculation: "carried_forward",
          bestXiStrength: null,
          usefulBenchStrength: null,
          rawRosterStrength: null,
          normalizedRosterStrengthBasisPoints: null,
          correctedResultBasisPoints: null,
          rankingScore: null,
          rank: null,
          tier,
          previousReputation: club.reputation,
          reputationTarget: club.reputation,
          nextReputation: club.reputation,
        });
      }
      continue;
    }

    const rosterRows = divisionClubs.map((club) => ({
      club,
      strength: deriveClubRosterStrength(
        club,
        input.careerState.gameState.players,
      ),
    }));

    const minimumRoster = Math.min(...rosterRows.map((row) => row.strength.rawRosterStrength));
    const maximumRoster = Math.max(...rosterRows.map((row) => row.strength.rawRosterStrength));
    const pyramidCoordinates = rosterRows.map((row) =>
      completedResultPyramidCoordinate(input.completedResultByClubId[row.club.id]!)
    );
    const minimumResult = Math.min(...pyramidCoordinates);
    const maximumResult = Math.max(...pyramidCoordinates);
    const ranked = rosterRows
      .map((row) => {
        const completedResult = input.completedResultByClubId[row.club.id]!;
        const normalizedRosterStrengthBasisPoints = normalizeBasisPoints(
          row.strength.rawRosterStrength,
          minimumRoster,
          maximumRoster,
        );
        const correctedResultBasisPoints = inverseNormalizeBasisPoints(
          completedResultPyramidCoordinate(completedResult),
          minimumResult,
          maximumResult,
        );
        return {
          ...row,
          completedResult,
          normalizedRosterStrengthBasisPoints,
          correctedResultBasisPoints,
          rankingScore:
            ROSTER_SCORE_WEIGHT * normalizedRosterStrengthBasisPoints
            + RESULT_SCORE_WEIGHT * correctedResultBasisPoints,
        };
      })
      .sort((left, right) =>
        right.rankingScore - left.rankingScore
        || left.club.id.localeCompare(right.club.id)
      );

    ranked.forEach((row, index) => {
      const rank = index + 1;
      const tier = competitiveTierForRank(rank);
      const reputationTarget = deriveClubReputationTarget(
        category,
        tier,
        row.correctedResultBasisPoints,
      );
      const nextReputation = moveReputationTowardTarget(
        row.club.reputation,
        reputationTarget,
      );
      tierByClubId[row.club.id] = tier;
      reputationByClubId[row.club.id] = nextReputation;
      facts.push({
        clubId: row.club.id,
        category,
        calculation: "recalculated",
        ...row.strength,
        normalizedRosterStrengthBasisPoints: row.normalizedRosterStrengthBasisPoints,
        correctedResultBasisPoints: row.correctedResultBasisPoints,
        rankingScore: row.rankingScore,
        rank,
        tier,
        previousReputation: row.club.reputation,
        reputationTarget,
        nextReputation,
      });
    });
  }

  const clubs = Object.fromEntries(input.careerState.gameState.clubIds.map((clubId) => {
    const club = input.careerState.gameState.clubs[clubId]!;
    return [clubId, { ...club, reputation: reputationByClubId[clubId] ?? club.reputation }];
  })) as CareerState["gameState"]["clubs"];
  const tierState = createClubCompetitiveTierState(
    {
      policyVersion: CLUB_COMPETITIVE_TIER_POLICY_VERSION,
      seasonId: input.nextSeasonId,
      tierByClubId,
    },
    input.careerState.gameState.clubIds,
    input.nextSeasonId,
  );

  return { clubs, tierState, facts };
}

/** Derives a balanced best-XI plus useful-bench roster signal. */
export function deriveClubRosterStrength(
  club: Club,
  players: CareerState["gameState"]["players"],
): ClubRosterStrength {
  const candidates = club.playerIds.map((playerId) => candidateForPlayer(club.id, playerId, players))
    .sort(compareRosterCandidates);
  if (candidates.length === 0) {
    throw new ClubSeasonTierError("club_roster_empty", `club has no senior players: ${club.id}`);
  }

  const selectedIds = new Set<PlayerId>();
  const bestXi: RosterCandidate[] = [];
  for (const department of SQUAD_DEPARTMENT_ORDER) {
    candidates
      .filter((candidate) => candidate.department === department)
      .slice(0, BEST_XI_DEPARTMENT_QUOTAS[department])
      .forEach((candidate) => {
        selectedIds.add(candidate.player.id);
        bestXi.push(candidate);
      });
  }
  for (const candidate of candidates) {
    if (bestXi.length >= 11) break;
    if (!selectedIds.has(candidate.player.id)) {
      selectedIds.add(candidate.player.id);
      bestXi.push(candidate);
    }
  }

  const remaining = candidates.filter((candidate) => !selectedIds.has(candidate.player.id));
  const reserveGoalkeeper = remaining.find((candidate) => candidate.department === "goalkeeper");
  const usefulBench = [
    ...(reserveGoalkeeper === undefined ? [] : [reserveGoalkeeper]),
    ...remaining.filter((candidate) => candidate.player.id !== reserveGoalkeeper?.player.id),
  ].slice(0, MAX_USEFUL_BENCH_PLAYERS);
  const bestXiStrength = mean(bestXi.map((candidate) => candidate.currentAbility));
  const usefulBenchStrength = usefulBench.length === 0
    ? bestXiStrength
    : mean(usefulBench.map((candidate) => candidate.currentAbility));
  const weightedTotal = bestXi.reduce((sum, candidate) => sum + candidate.currentAbility, 0)
    + usefulBench.reduce(
      (sum, candidate) => sum + candidate.currentAbility * BENCH_PLAYER_WEIGHT,
      0,
    );
  const totalWeight = bestXi.length + usefulBench.length * BENCH_PLAYER_WEIGHT;

  return {
    bestXiStrength,
    usefulBenchStrength,
    rawRosterStrength: weightedTotal / totalWeight,
  };
}

/** Returns the structural cross-division coordinate for one completed result. */
export function completedResultPyramidCoordinate(result: ClubCompletedSeasonResult): number {
  if (
    !Number.isSafeInteger(result.finalPosition)
    || result.clubCount !== CLUB_COMPETITIVE_TIER_DIVISION_SIZE
    || result.finalPosition < 1
    || result.finalPosition > result.clubCount
    || result.champion !== (result.finalPosition === 1)
  ) {
    throw new ClubSeasonTierError(
      "completed_result_invalid",
      `invalid completed result: ${result.previousCategory} ${result.finalPosition}/${result.clubCount}`,
    );
  }
  return DIVISION_INDEX[result.previousCategory] * CLUB_COMPETITIVE_TIER_DIVISION_SIZE
    + result.finalPosition - 1;
}

/** Maps frozen tier and corrected result into the existing category band. */
export function deriveClubReputationTarget(
  category: ClubCategory,
  tier: ClubCompetitiveTier,
  correctedResultBasisPoints: number,
): number {
  const [minimum, maximum] = REPUTATION_BAND[category];
  const targetSignal = 0.7 * TIER_REPUTATION_ANCHOR[tier]
    + 0.3 * correctedResultBasisPoints;
  return minimum + Math.round((targetSignal / BASIS_POINTS_MAXIMUM) * (maximum - minimum));
}

/** Moves current reputation toward its target by no more than two points. */
export function moveReputationTowardTarget(current: number, target: number): number {
  const difference = target - current;
  return current + Math.sign(difference) * Math.min(Math.abs(difference), MAX_REPUTATION_CHANGE);
}

interface RosterCandidate {
  readonly player: Player;
  readonly department: SquadDepartment;
  readonly currentAbility: number;
}

function candidateForPlayer(
  clubId: ClubId,
  playerId: PlayerId,
  players: CareerState["gameState"]["players"],
): RosterCandidate {
  const player = players[playerId];
  if (player === undefined) {
    throw new ClubSeasonTierError(
      "club_player_missing",
      `club ${clubId} references missing player ${playerId}`,
    );
  }
  if (player.primaryRole === undefined) {
    throw new ClubSeasonTierError(
      "club_player_role_missing",
      `player has no canonical primary role: ${player.id}`,
    );
  }
  return {
    player,
    department: playerSquadDepartment(player),
    currentAbility: Number(
      roleCurrentAbility(player.abilities, getPlayerRoleProfile(player.primaryRole)),
    ),
  };
}

function compareRosterCandidates(left: RosterCandidate, right: RosterCandidate): number {
  return right.currentAbility - left.currentAbility
    || left.player.id.localeCompare(right.player.id);
}

function normalizeBasisPoints(value: number, minimum: number, maximum: number): number {
  return maximum === minimum
    ? BASIS_POINTS_MAXIMUM / 2
    : Math.round(((value - minimum) / (maximum - minimum)) * BASIS_POINTS_MAXIMUM);
}

function inverseNormalizeBasisPoints(value: number, minimum: number, maximum: number): number {
  return maximum === minimum
    ? BASIS_POINTS_MAXIMUM / 2
    : Math.round(((maximum - value) / (maximum - minimum)) * BASIS_POINTS_MAXIMUM);
}

function mean(values: readonly number[]): number {
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}
