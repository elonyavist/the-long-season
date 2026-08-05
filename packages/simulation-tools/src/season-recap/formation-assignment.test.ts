import { describe, expect, it } from "vitest";
import { FORMATION_KEYS, type ClubId } from "@game/domain";

import {
  assignFormationsByClub,
  formationForClub,
} from "./formation-assignment.ts";

function clubIds(count: number): readonly ClubId[] {
  return Array.from(
    { length: count },
    (_value, index) => `club:${String(index).padStart(4, "0")}` as ClubId,
  );
}

describe("assignFormationsByClub", () => {
  it("gives the same club the same shape for the same world seed", () => {
    const ids = clubIds(20);

    expect(assignFormationsByClub({ worldSeed: "world-a", clubIds: ids }))
      .toStrictEqual(assignFormationsByClub({ worldSeed: "world-a", clubIds: ids }));
  });

  it("assigns only shapes the curated catalog contains", () => {
    const assigned = assignFormationsByClub({ worldSeed: "world-a", clubIds: clubIds(60) });

    for (const formation of Object.values(assigned)) {
      expect(FORMATION_KEYS).toContain(formation);
    }
  });

  it("does not depend on the order clubs are supplied in", () => {
    const ids = clubIds(20);
    const reversed = [...ids].reverse();

    expect(assignFormationsByClub({ worldSeed: "world-a", clubIds: reversed }))
      .toStrictEqual(assignFormationsByClub({ worldSeed: "world-a", clubIds: ids }));
  });

  it("does not depend on which other clubs are in the run", () => {
    // A club's shape must be a function of its own identity, or a relegation
    // that changes the league's membership would silently reshape everybody.
    const alone = assignFormationsByClub({
      worldSeed: "world-a",
      clubIds: ["club:0007" as ClubId],
    });

    expect(assignFormationsByClub({ worldSeed: "world-a", clubIds: clubIds(20) })["club:0007" as ClubId])
      .toBe(alone["club:0007" as ClubId]);
  });

  it("gives a different world a different league", () => {
    const ids = clubIds(20);
    const first = assignFormationsByClub({ worldSeed: "world-a", clubIds: ids });
    const second = assignFormationsByClub({ worldSeed: "world-b", clubIds: ids });
    const moved = ids.filter((clubId) => first[clubId] !== second[clubId]);

    expect(moved.length).toBeGreaterThan(ids.length / 2);
  });

  it("reaches the whole curated catalog rather than a handful of shapes", () => {
    // The band this feeds is `distinct_formations >= 5`. A hash that collapsed
    // onto a few keys would pass that band while still measuring almost
    // nothing, so the real requirement is that every curated shape is
    // reachable at a realistic number of clubs.
    const assigned = assignFormationsByClub({ worldSeed: "world-a", clubIds: clubIds(600) });
    const used = new Set(Object.values(assigned));

    expect(used.size).toBe(FORMATION_KEYS.length);
  });

  it("spreads clubs across shapes instead of crowding one", () => {
    const assigned = assignFormationsByClub({ worldSeed: "world-a", clubIds: clubIds(600) });
    const counts = new Map<string, number>();
    for (const formation of Object.values(assigned)) {
      counts.set(formation, (counts.get(formation) ?? 0) + 1);
    }
    const expected = 600 / FORMATION_KEYS.length;

    // Three times the uniform share is loose on purpose: this asserts the
    // absence of a degenerate hash, not a statistical property nobody needs.
    expect(Math.max(...counts.values())).toBeLessThan(expected * 3);
  });

  it("yields a league of at least five shapes at real club counts", () => {
    // Reachability for the `distinct_formations` band, on the population the
    // inspection actually runs: twenty clubs, five worlds.
    for (let world = 1; world <= 5; world += 1) {
      const assigned = assignFormationsByClub({
        worldSeed: `phase81-world-${world}`,
        clubIds: clubIds(20),
      });

      expect(new Set(Object.values(assigned)).size).toBeGreaterThanOrEqual(5);
    }
  });
});

describe("formationForClub", () => {
  it("answers for one club exactly as the map does", () => {
    const assigned = assignFormationsByClub({ worldSeed: "world-a", clubIds: clubIds(5) });

    for (const [clubId, formation] of Object.entries(assigned)) {
      expect(formationForClub("world-a", clubId as ClubId)).toBe(formation);
    }
  });
});
