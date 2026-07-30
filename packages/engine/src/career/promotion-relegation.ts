import {
  createCompetition,
  type ClubCategory,
  type ClubId,
  type CompetitionId,
  type DomesticCompetitionWorld,
  type LeagueTableRow,
} from "@game/domain";

/** One club movement selected from an immutable completed table. */
export interface DomesticCompetitionMovement {
  readonly clubId: ClubId;
  readonly fromCompetitionId: CompetitionId;
  readonly toCompetitionId: CompetitionId;
  readonly finalPosition: number;
  readonly outcome: "promoted" | "relegated";
}

/** Successful application of the fixed fictional three-tier topology. */
export interface DomesticPromotionRelegationApplied {
  readonly status: "applied";
  readonly competitionWorld: DomesticCompetitionWorld;
  readonly movements: readonly DomesticCompetitionMovement[];
  readonly categoryByClubId: Readonly<Record<ClubId, ClubCategory>>;
}

/** Stable invalid inputs rejected without publishing a partial membership. */
export interface DomesticPromotionRelegationInvalid {
  readonly status: "invalid";
  readonly reason:
    | "unsupported_competition_topology"
    | "competition_table_missing"
    | "competition_table_membership_mismatch";
  readonly competitionId?: CompetitionId;
}

/** Pure fixed-topology movement result. */
export type DomesticPromotionRelegationResult =
  | DomesticPromotionRelegationApplied
  | DomesticPromotionRelegationInvalid;

/**
 * Applies `fictional-three-tier-v1` movement from the same pre-movement tables.
 *
 * First/Second exchange three clubs and Second/Third exchange two. Third has a
 * closed lower boundary, so its bottom clubs never receive a relegation fact.
 */
export function applyDomesticPromotionRelegation(input: {
  readonly competitionWorld: DomesticCompetitionWorld;
  readonly finalTables: Readonly<Record<CompetitionId, readonly LeagueTableRow[]>>;
}): DomesticPromotionRelegationResult {
  const [firstId, secondId, thirdId] = input.competitionWorld.competitionIds;
  if (
    input.competitionWorld.competitionIds.length !== 3
    || firstId === undefined
    || secondId === undefined
    || thirdId === undefined
  ) {
    return { status: "invalid", reason: "unsupported_competition_topology" };
  }

  for (const competitionId of input.competitionWorld.competitionIds) {
    const competition = input.competitionWorld.competitions[competitionId];
    const table = input.finalTables[competitionId];
    if (competition === undefined || table === undefined) {
      return { status: "invalid", reason: "competition_table_missing", competitionId };
    }
    if (
      table.length !== competition.clubIds.length
      || new Set(table.map((row) => row.clubId)).size !== table.length
      || table.some((row) => !competition.clubIds.includes(row.clubId))
    ) {
      return {
        status: "invalid",
        reason: "competition_table_membership_mismatch",
        competitionId,
      };
    }
  }

  const firstTable = input.finalTables[firstId]!;
  const secondTable = input.finalTables[secondId]!;
  const thirdTable = input.finalTables[thirdId]!;
  const firstRelegated = firstTable.slice(-3);
  const secondPromoted = secondTable.slice(0, 3);
  const secondRelegated = secondTable.slice(-2);
  const thirdPromoted = thirdTable.slice(0, 2);
  const outgoing = new Set([
    ...firstRelegated,
    ...secondPromoted,
    ...secondRelegated,
    ...thirdPromoted,
  ].map((row) => row.clubId));
  const firstCompetition = input.competitionWorld.competitions[firstId]!;
  const secondCompetition = input.competitionWorld.competitions[secondId]!;
  const thirdCompetition = input.competitionWorld.competitions[thirdId]!;
  const membershipByCompetitionId: Readonly<Record<CompetitionId, readonly ClubId[]>> = {
    [firstId]: [
      ...firstCompetition.clubIds.filter((clubId) => !outgoing.has(clubId)),
      ...secondPromoted.map((row) => row.clubId),
    ],
    [secondId]: [
      ...secondCompetition.clubIds.filter((clubId) => !outgoing.has(clubId)),
      ...firstRelegated.map((row) => row.clubId),
      ...thirdPromoted.map((row) => row.clubId),
    ],
    [thirdId]: [
      ...thirdCompetition.clubIds.filter((clubId) => !outgoing.has(clubId)),
      ...secondRelegated.map((row) => row.clubId),
    ],
  };
  const competitions = Object.fromEntries(
    input.competitionWorld.competitionIds.map((competitionId) => {
      const competition = input.competitionWorld.competitions[competitionId]!;
      return [
        competitionId,
        createCompetition({
          ...competition,
          clubIds: membershipByCompetitionId[competitionId]!,
        }),
      ];
    }),
  ) as DomesticCompetitionWorld["competitions"];
  const movements: DomesticCompetitionMovement[] = [
    ...movementRows(secondPromoted, secondId, firstId, "promoted"),
    ...movementRows(firstRelegated, firstId, secondId, "relegated"),
    ...movementRows(thirdPromoted, thirdId, secondId, "promoted"),
    ...movementRows(secondRelegated, secondId, thirdId, "relegated"),
  ];
  const categoryByClubId = Object.fromEntries([
    ...membershipByCompetitionId[firstId]!.map((clubId) => [clubId, "first_division"] as const),
    ...membershipByCompetitionId[secondId]!.map((clubId) => [clubId, "second_division"] as const),
    ...membershipByCompetitionId[thirdId]!.map((clubId) => [clubId, "third_division"] as const),
  ]) as Readonly<Record<ClubId, ClubCategory>>;

  return {
    status: "applied",
    competitionWorld: {
      ...input.competitionWorld,
      competitions,
    },
    movements,
    categoryByClubId,
  };
}

function movementRows(
  rows: readonly LeagueTableRow[],
  fromCompetitionId: CompetitionId,
  toCompetitionId: CompetitionId,
  outcome: DomesticCompetitionMovement["outcome"],
): readonly DomesticCompetitionMovement[] {
  return rows.map((row) => ({
    clubId: row.clubId,
    fromCompetitionId,
    toCompetitionId,
    finalPosition: row.position,
    outcome,
  }));
}
