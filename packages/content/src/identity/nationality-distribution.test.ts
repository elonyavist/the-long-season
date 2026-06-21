import assert from "node:assert/strict";
import { test } from "vitest";

import type { NationalityCode } from "@game/domain";

import { selectDistributionProfile, selectNationality, type LeagueNationCode } from "./nationality-distribution.ts";

/** Tests deterministic nationality selection for generated fictional content. */

test("selectNationality is deterministic for the same seed and player key", () => {
  const first = selectNationality({
    seed: "demo-001",
    leagueNation: "italian",
    clubCategory: "third_division",
    clubReputation: 5,
    playerKey: "player:province-01-01",
  });
  const second = selectNationality({
    seed: "demo-001",
    leagueNation: "italian",
    clubCategory: "third_division",
    clubReputation: 5,
    playerKey: "player:province-01-01",
  });

  assert.deepEqual(second, first);
});

test("third-division clubs are mostly domestic", () => {
  const sample = sampleDistribution({
    seed: "identity-sample",
    leagueNation: "italian",
    clubCategory: "third_division",
    clubReputation: 5,
  });

  assert.equal(sample.domesticRate >= 0.7, true, `domesticRate=${sample.domesticRate}`);
  assert.equal(sample.foreignRate <= 0.3, true, `foreignRate=${sample.foreignRate}`);
});

test("second-division clubs are more mixed than third division", () => {
  const third = sampleDistribution({
    seed: "identity-sample",
    leagueNation: "italian",
    clubCategory: "third_division",
    clubReputation: 5,
  });
  const second = sampleDistribution({
    seed: "identity-sample",
    leagueNation: "italian",
    clubCategory: "second_division",
    clubReputation: 6,
  });

  assert.equal(second.foreignRate > third.foreignRate, true);
  assert.equal(second.domesticRate >= 0.5, true, `domesticRate=${second.domesticRate}`);
});

test("strong first-division clubs can be majority international", () => {
  const sample = sampleDistribution({
    seed: "identity-sample",
    leagueNation: "italian",
    clubCategory: "first_division",
    clubReputation: 9,
  });

  assert.equal(sample.foreignRate >= 0.55, true, `foreignRate=${sample.foreignRate}`);
  assert.equal(sample.domesticRate <= 0.45, true, `domesticRate=${sample.domesticRate}`);
});

test("distribution profile selection follows category and top-club reputation", () => {
  assert.equal(selectDistributionProfile("third_division", 10).key, "third_division");
  assert.equal(selectDistributionProfile("second_division", 10).key, "second_division");
  assert.equal(selectDistributionProfile("first_division", 7).key, "first_division_average");
  assert.equal(selectDistributionProfile("first_division", 8).key, "first_division_top");
});

test("foreign selections may carry league nationality as second nationality", () => {
  const selections = Array.from({ length: 200 }, (_, index) =>
    selectNationality({
      seed: "second-nationality",
      leagueNation: "italian",
      clubCategory: "first_division",
      clubReputation: 9,
      playerKey: `player:${index}`,
    }),
  );

  assert.equal(
    selections.some((selection) => selection.nationality !== "italian" && selection.secondNationality === "italian"),
    true,
  );
});

test("selection model can produce the expanded football nationality set", () => {
  const observed = new Set(
    Array.from({ length: 6_000 }, (_, index) =>
      selectNationality({
        seed: "expanded-nationalities",
        leagueNation: "italian",
        clubCategory: "first_division",
        clubReputation: 9,
        playerKey: `player:${index}`,
      }).nationality
    ),
  );

  const expectedNationalities: readonly NationalityCode[] = [
    "colombian",
    "mexican",
    "ivorian",
    "welsh",
    "scottish",
    "russian",
    "south_korean",
    "albanian",
    "serbian",
    "turkish",
  ];

  for (const nationality of expectedNationalities) {
    assert.equal(observed.has(nationality), true, `missing ${nationality}`);
  }
});

interface SampleInput {
  readonly seed: string;
  readonly leagueNation: LeagueNationCode;
  readonly clubCategory: "first_division" | "second_division" | "third_division";
  readonly clubReputation: number;
}

function sampleDistribution(input: SampleInput): {
  readonly domesticRate: number;
  readonly foreignRate: number;
} {
  const sampleSize = 220;
  let domesticCount = 0;

  for (let index = 0; index < sampleSize; index += 1) {
    const selection = selectNationality({
      ...input,
      playerKey: `player:${index}`,
    });

    if (selection.nationality === input.leagueNation) {
      domesticCount += 1;
    }
  }

  const domesticRate = domesticCount / sampleSize;

  return {
    domesticRate,
    foreignRate: 1 - domesticRate,
  };
}
