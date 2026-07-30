import { describe, expect, it } from "vitest";

import {
  clubId,
  competitionId,
  createCompetition,
  type CompetitionId,
  type DomesticCompetitionWorld,
  type LeagueTableRow,
} from "@game/domain";

import { applyDomesticPromotionRelegation } from "./promotion-relegation.ts";

describe("applyDomesticPromotionRelegation", () => {
  it("applies both adjacent exchanges from immutable pre-movement tables", () => {
    const world = worldFixture();
    const finalTables = Object.fromEntries(
      world.competitionIds.map((id) => [id, tableFixture(world.competitions[id]!.clubIds)]),
    ) as Readonly<Record<CompetitionId, readonly LeagueTableRow[]>>;

    const result = applyDomesticPromotionRelegation({
      competitionWorld: world,
      finalTables,
    });

    expect(result.status).toBe("applied");
    if (result.status !== "applied") return;
    expect(result.movements).toHaveLength(10);
    expect(result.competitionWorld.competitions[competitionId("competition:first")]?.clubIds).toEqual([
      ...clubRange("first", 1, 15),
      ...clubRange("second", 1, 3),
    ]);
    expect(result.competitionWorld.competitions[competitionId("competition:second")]?.clubIds).toEqual([
      ...clubRange("second", 4, 16),
      ...clubRange("first", 16, 18),
      ...clubRange("third", 1, 2),
    ]);
    expect(result.competitionWorld.competitions[competitionId("competition:third")]?.clubIds).toEqual([
      ...clubRange("third", 3, 18),
      ...clubRange("second", 17, 18),
    ]);
    expect(result.movements.some((movement) =>
      movement.clubId === "club:third-18"
    )).toBe(false);
    expect(result.categoryByClubId[clubId("club:third-01")]).toBe("second_division");
    expect(result.categoryByClubId[clubId("club:first-18")]).toBe("second_division");
  });

  it("rejects a table that does not represent its canonical membership", () => {
    const world = worldFixture();
    const finalTables = Object.fromEntries(
      world.competitionIds.map((id) => [id, tableFixture(world.competitions[id]!.clubIds)]),
    ) as Record<CompetitionId, readonly LeagueTableRow[]>;
    finalTables[world.competitionIds[1]!] = finalTables[world.competitionIds[1]!]!.slice(1);

    expect(applyDomesticPromotionRelegation({
      competitionWorld: world,
      finalTables,
    })).toMatchObject({
      status: "invalid",
      reason: "competition_table_membership_mismatch",
      competitionId: "competition:second",
    });
  });

  it("stays deterministic across repeated calls and two consecutive boundaries", () => {
    const initialWorld = worldFixture();
    const firstInput = {
      competitionWorld: initialWorld,
      finalTables: finalTablesFor(initialWorld),
    };

    const first = applyDomesticPromotionRelegation(firstInput);
    const repeated = applyDomesticPromotionRelegation(firstInput);

    expect(first).toEqual(repeated);
    expect(boundaryHash(first)).toBe(boundaryHash(repeated));
    if (first.status !== "applied") throw new Error("Expected first movement boundary");

    const secondInput = {
      competitionWorld: first.competitionWorld,
      finalTables: finalTablesFor(first.competitionWorld),
    };
    const second = applyDomesticPromotionRelegation(secondInput);
    const repeatedSecond = applyDomesticPromotionRelegation(secondInput);

    expect(second).toEqual(repeatedSecond);
    expect(boundaryHash(second)).toBe(boundaryHash(repeatedSecond));
    if (second.status !== "applied") throw new Error("Expected second movement boundary");
    expect(second.competitionWorld.competitionIds.map(
      (id) => second.competitionWorld.competitions[id]?.clubIds.length,
    )).toEqual([18, 18, 18]);
    expect(new Set(second.competitionWorld.competitionIds.flatMap(
      (id) => second.competitionWorld.competitions[id]?.clubIds ?? [],
    )).size).toBe(54);
  });
});

function worldFixture(): DomesticCompetitionWorld {
  const ids = [
    competitionId("competition:first"),
    competitionId("competition:second"),
    competitionId("competition:third"),
  ];
  return {
    competitionIds: ids,
    competitions: Object.fromEntries(ids.map((id, index) => [
      id,
      createCompetition({
        id,
        name: String(id),
        clubIds: clubRange(["first", "second", "third"][index]!, 1, 18),
        matchRules: {
          maximumSubstitutions: 5,
          substitutionWindowLimit: null,
          allowsPlayerReentry: false,
          yellowCardAccumulationThreshold: 5,
          straightRedSuspensionMatches: 3,
          secondYellowSuspensionMatches: 1,
          yellowAccumulationSuspensionMatches: 1,
        },
      }),
    ])) as DomesticCompetitionWorld["competitions"],
    seasonHistory: [],
  };
}

function clubRange(prefix: string, start: number, end: number) {
  return Array.from({ length: end - start + 1 }, (_, index) =>
    clubId(`club:${prefix}-${String(start + index).padStart(2, "0")}`)
  );
}

function tableFixture(clubIds: readonly ReturnType<typeof clubId>[]): readonly LeagueTableRow[] {
  return clubIds.map((id, index) => ({
    position: index + 1,
    clubId: id,
    played: 34,
    wins: 0,
    draws: 0,
    losses: 0,
    goalsFor: 0,
    goalsAgainst: 0,
    goalDifference: 0,
    points: 0,
  }));
}

/** Builds one complete immutable table map for the supplied memberships. */
function finalTablesFor(
  world: DomesticCompetitionWorld,
): Readonly<Record<CompetitionId, readonly LeagueTableRow[]>> {
  return Object.fromEntries(
    world.competitionIds.map((id) => [
      id,
      tableFixture(world.competitions[id]!.clubIds),
    ]),
  ) as Readonly<Record<CompetitionId, readonly LeagueTableRow[]>>;
}

/** Hashes the ordered boundary projection so repeated-run drift is explicit. */
function boundaryHash(value: unknown): string {
  const serialized = JSON.stringify(value);
  let hash = 2_166_136_261;
  for (let index = 0; index < serialized.length; index += 1) {
    hash ^= serialized.charCodeAt(index);
    hash = Math.imul(hash, 16_777_619);
  }
  return (hash >>> 0).toString(16).padStart(8, "0");
}
