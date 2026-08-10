import assert from "node:assert/strict";
import { test } from "vitest";

import {
  abilityValue,
  isPotentialAtLeastCurrent,
  getPlayerRoleProfile,
  PLAYER_ABILITY_KEYS,
  readPlayerAbility,
  rolePotentialAbility,
  type ClubCategory,
  type PlayerAbilities,
  type PlayerStarRating,
} from "@game/domain";

import { playerRatingScale } from "../balance/player-economy-calibration.ts";
import {
  allocateCappedReachablePotential,
  allocatePotentialToContextualTarget,
  allocateReachablePotential,
  materializeContextualProspectPotentialTarget,
  maximumReachableRolePotentialAbility,
  selectContextualProspectCeilingCandidate,
} from "./player-potential-allocation.ts";
import type { BandedContextualProspectClass } from "./player-potential-rarity.ts";

/** Tests for age-aware reachable potential allocation from current ability. */

test("age-26 outfield physical and wide technical potential cannot make impossible jumps", () => {
  const current = filledAbilities(8, {
    physical: { pace: 10 },
    technical: { crossing: 4.3 },
  });
  const potential = allocateReachablePotential({
    seed: "age-26-boundary",
    playerKey: "player:age-26-winger",
    abilities: current,
    ageYears: 26,
    role: "winger",
    division: "third_division",
    clubTier: "title_contender",
    potentialClass: "elite",
  });

  assert.equal(Number(potential.physical.pace) <= 10.6, true);
  assert.equal(Number(potential.technical.crossing) <= 5.5, true);
});

test("young elite players can have meaningful but focused reachable upside", () => {
  const current = filledAbilities(9, {
    physical: { pace: 14 },
    technical: { crossing: 12, dribbling: 11 },
  });
  const potential = allocateReachablePotential({
    seed: "age-18-winger-upside",
    playerKey: "player:age-18-winger",
    abilities: current,
    ageYears: 18,
    role: "winger",
    division: "third_division",
    clubTier: "playoff_contender",
    potentialClass: "elite",
  });
  const highGrowthCount = PLAYER_ABILITY_KEYS.filter(
    (key) => Number(readPlayerAbility(potential, key)) - Number(readPlayerAbility(current, key)) >= 2,
  ).length;

  assert.equal(Number(potential.physical.pace) > 14, true);
  assert.equal(highGrowthCount >= 3, true);
  assert.equal(highGrowthCount < 18, true);
});

test("potential remains ordered, capped, and valid for every ability", () => {
  const current = filledAbilities(13);
  const potential = allocateReachablePotential({
    seed: "valid-potential",
    playerKey: "player:valid",
    abilities: current,
    ageYears: 22,
    role: "central_midfielder",
    division: "second_division",
    clubTier: "mid_table",
    potentialClass: "interesting",
  });

  assert.equal(isPotentialAtLeastCurrent(current, potential), true);
  for (const key of PLAYER_ABILITY_KEYS) {
    const value = Number(readPlayerAbility(potential, key));
    assert.equal(value >= Number(readPlayerAbility(current, key)) && value <= 20, true, key);
  }
});

test("role caps still constrain potential for incoherent attributes", () => {
  const potential = allocateReachablePotential({
    seed: "potential-role-cap",
    playerKey: "player:center-back",
    abilities: filledAbilities(9, {
      technical: { finishing: 9.8 },
      goalkeeping: {
        reflexes: 4,
        handling: 4,
        rushingOut: 4,
        goalkeeperPositioning: 4,
        footwork: 4,
      },
    }),
    ageYears: 18,
    role: "center_back",
    division: "first_division",
    clubTier: "title_contender",
    potentialClass: "elite",
  });

  assert.equal(Number(potential.technical.finishing) <= 10, true);
  assert.equal(Number(potential.goalkeeping.reflexes) <= 4, true);
});

test("goalkeeper potential keeps a later curve than outfield physical growth", () => {
  const goalkeeper = allocateReachablePotential({
    seed: "goalkeeper-curve",
    playerKey: "player:gk",
    abilities: filledAbilities(10),
    ageYears: 29,
    role: "goalkeeper",
    division: "second_division",
    clubTier: "playoff_contender",
    potentialClass: "interesting",
  });
  const winger = allocateReachablePotential({
    seed: "goalkeeper-curve",
    playerKey: "player:winger",
    abilities: filledAbilities(10),
    ageYears: 29,
    role: "winger",
    division: "second_division",
    clubTier: "playoff_contender",
    potentialClass: "interesting",
  });

  assert.equal(Number(goalkeeper.goalkeeping.reflexes) > 10, true);
  assert.equal(Number(winger.physical.pace) <= 10.2, true);
});

test("an explicit world intake assignment reaches its requested role-potential floor", () => {
  const current = filledAbilities(8);
  const potential = allocateReachablePotential({
    seed: "world-potential-six",
    playerKey: "player:world-potential-six",
    abilities: current,
    ageYears: 17,
    role: "central_midfielder",
    division: "second_division",
    clubTier: "playoff_contender",
    potentialClass: "elite",
    minimumRolePotentialAbility: 17,
  });

  assert.equal(
    Number(rolePotentialAbility(potential, getPlayerRoleProfile("central_midfielder"))) >= 17,
    true,
  );
  assert.equal(isPotentialAtLeastCurrent(current, potential), true);
});

test("the ceiling-first selector implements every accepted division prospect ceiling band", () => {
  const cases: readonly {
    readonly division: ClubCategory;
    readonly prospectClass: BandedContextualProspectClass;
    readonly expectedMinimum: PlayerStarRating;
    readonly expectedMaximum: PlayerStarRating;
  }[] = [
    prospectCase("third_division", "interesting", 2.5, 3.5),
    prospectCase("third_division", "serious", 3.5, 4),
    prospectCase("third_division", "rare", 5, 6),
    prospectCase("second_division", "interesting", 3, 3.5),
    prospectCase("second_division", "serious", 3.5, 4.5),
    prospectCase("second_division", "rare", 5, 6),
    prospectCase("first_division", "interesting", 4, 4.5),
    prospectCase("first_division", "serious", 4, 5),
    prospectCase("first_division", "rare", 5.5, 6),
  ];

  for (const candidate of cases) {
    const observedRatings = new Set<PlayerStarRating>();
    for (let sampleIndex = 0; sampleIndex < 32; sampleIndex += 1) {
      const input = {
        seed: `accepted-contextual-ceiling-matrix:${sampleIndex}`,
        playerKey: `player:${candidate.division}:${candidate.prospectClass}`,
        division: candidate.division,
        prospectClass: candidate.prospectClass,
        ratingScale: playerRatingScale,
        ceilingConstraint: { kind: "policy" } as const,
      };
      const first = selectContextualProspectCeilingCandidate(input);
      const replay = selectContextualProspectCeilingCandidate(input);
      const rating = first.ceilingRating;
      const label = `${candidate.division}:${candidate.prospectClass}:${sampleIndex}`;
      observedRatings.add(rating);

      assert.equal(rating >= candidate.expectedMinimum, true, `${label}:minimum`);
      assert.equal(rating <= candidate.expectedMaximum, true, `${label}:maximum`);
      assert.deepEqual(replay, first, `${label}:determinism`);
    }
    assert.equal(
      observedRatings.has(candidate.expectedMinimum),
      true,
      `${candidate.division}:${candidate.prospectClass}:lower-endpoint`,
    );
    assert.equal(
      observedRatings.has(candidate.expectedMaximum),
      true,
      `${candidate.division}:${candidate.prospectClass}:upper-endpoint`,
    );
  }
});

test("ceiling weights stay unchanged when feasibility narrows the exact ability interval", () => {
  const wideCounts = new Map<PlayerStarRating, number>();
  const narrowCounts = new Map<PlayerStarRating, number>();

  for (let sampleIndex = 0; sampleIndex < 4_096; sampleIndex += 1) {
    const base = {
      seed: `weighted-ceiling-invariance:${sampleIndex}`,
      playerKey: "player:weighted-ceiling-invariance",
      division: "third_division" as const,
      prospectClass: "interesting" as const,
      ratingScale: playerRatingScale,
      ceilingConstraint: { kind: "policy" } as const,
    };
    const candidate = selectContextualProspectCeilingCandidate(base);
    const wide = materializeContextualProspectPotentialTarget({
      candidate,
      role: "central_midfielder",
      ratingScale: base.ratingScale,
      maximumFeasibleRolePotentialAbility: 20,
    });
    const narrow = materializeContextualProspectPotentialTarget({
      candidate,
      role: "central_midfielder",
      ratingScale: base.ratingScale,
      maximumFeasibleRolePotentialAbility: 13,
    });

    wideCounts.set(wide.ceilingRating, (wideCounts.get(wide.ceilingRating) ?? 0) + 1);
    narrowCounts.set(narrow.ceilingRating, (narrowCounts.get(narrow.ceilingRating) ?? 0) + 1);
  }

  assert.deepEqual(narrowCounts, wideCounts);
  const maximumRatingShare = (wideCounts.get(3.5) ?? 0) / 4_096;
  assert.equal(maximumRatingShare >= 0.22 && maximumRatingShare <= 0.28, true);
});

test("exact ceiling ability varies inside one star while never exceeding its feasible upper edge", () => {
  const observedAbilities = new Set<number>();
  const maximumFeasibleRolePotentialAbility = 17.2;

  for (let sampleIndex = 0; sampleIndex < 128; sampleIndex += 1) {
    const selectionInput = {
      seed: `exact-ceiling-variation:${sampleIndex}`,
      playerKey: "player:exact-ceiling-variation",
      division: "first_division" as const,
      prospectClass: "rare" as const,
      ratingScale: playerRatingScale,
      ceilingConstraint: { kind: "at_least_rating", rating: 6 } as const,
    };
    const candidate = selectContextualProspectCeilingCandidate(selectionInput);
    const target = materializeContextualProspectPotentialTarget({
      candidate,
      role: "central_midfielder",
      ratingScale: selectionInput.ratingScale,
      maximumFeasibleRolePotentialAbility,
    });

    assert.equal(target.ceilingRating, 6);
    assert.equal(target.rolePotentialAbility >= 17.01, true);
    assert.equal(target.rolePotentialAbility <= maximumFeasibleRolePotentialAbility, true);
    observedAbilities.add(Number(target.rolePotentialAbility.toFixed(4)));
  }

  assert.equal(observedAbilities.size > 32, true);
});

test("contextual fitting preserves role hard caps while raising a rare ceiling", () => {
  const current = filledAbilities(12, {
    technical: { finishing: 9.8 },
    goalkeeping: {
      reflexes: 4,
      handling: 4,
      rushingOut: 4,
      goalkeeperPositioning: 4,
      footwork: 4,
    },
  });
  const candidate = selectContextualProspectCeilingCandidate({
    seed: "contextual-role-hard-caps",
    playerKey: "player:contextual-center-back",
    division: "third_division",
    prospectClass: "rare",
    ratingScale: playerRatingScale,
    ceilingConstraint: { kind: "policy" },
  });
  const target = materializeContextualProspectPotentialTarget({
    candidate,
    role: "center_back",
    ratingScale: playerRatingScale,
    maximumFeasibleRolePotentialAbility: maximumReachableRolePotentialAbility({
      abilities: current,
      ageYears: 17,
      role: "center_back",
    }),
  });
  const potential = allocatePotentialToContextualTarget({
    seed: "contextual-role-hard-caps",
    playerKey: "player:contextual-center-back",
    abilities: current,
    ageYears: 17,
    role: "center_back",
    division: "third_division",
    clubTier: "survival",
    potentialClass: "elite",
    ratingScale: playerRatingScale,
    target,
  });

  assert.equal(starRatingForRolePotential(potential, "center_back") >= 5, true);
  assert.equal(starRatingForRolePotential(potential, "center_back") <= 6, true);
  assert.equal(Number(potential.technical.finishing) <= 10, true);
  assert.equal(Number(potential.goalkeeping.reflexes), 4);
  assert.equal(Number(potential.technical.passing) - Number(current.technical.passing) <= 9.9, true);
  assert.equal(Number(potential.physical.pace) - Number(current.physical.pace) <= 9.075, true);
  assert.equal(Number(potential.mental.positioning) - Number(current.mental.positioning) <= 11.55, true);
});

test("a reconstructed natural outlier stays constructively below its world-budget cap", () => {
  const current = filledAbilities(15);
  const potential = allocateCappedReachablePotential({
    seed: "reconstructed-below-six",
    playerKey: "player:reconstructed-below-six",
    abilities: current,
    ageYears: 24,
    role: "central_midfielder",
    division: "first_division",
    clubTier: "title_contender",
    potentialClass: "elite",
    maximumRolePotentialAbility: 16.99,
  });
  const roleAbility = Number(
    rolePotentialAbility(potential, getPlayerRoleProfile("central_midfielder")),
  );

  assert.equal(roleAbility <= 16.99, true);
  assert.equal(isPotentialAtLeastCurrent(current, potential), true);
});

test("a budgeted six-star floor stays constructive from the lowest young rare guardrail", () => {
  const current = filledAbilities(7.5);
  const candidate = selectContextualProspectCeilingCandidate({
    seed: "contextual-six-floor-from-low-current",
    playerKey: "player:low-current-six-ceiling",
    division: "third_division",
    prospectClass: "rare",
    ratingScale: playerRatingScale,
    ceilingConstraint: { kind: "at_least_rating", rating: 6 },
  });
  const target = materializeContextualProspectPotentialTarget({
    candidate,
    role: "central_midfielder",
    ratingScale: playerRatingScale,
    maximumFeasibleRolePotentialAbility: maximumReachableRolePotentialAbility({
      abilities: current,
      ageYears: 16,
      role: "central_midfielder",
    }),
  });
  const potential = allocatePotentialToContextualTarget({
    seed: "contextual-six-floor-from-low-current",
    playerKey: "player:low-current-six-ceiling",
    abilities: current,
    ageYears: 16,
    role: "central_midfielder",
    division: "third_division",
    clubTier: "survival",
    potentialClass: "elite",
    ratingScale: playerRatingScale,
    target,
  });

  assert.equal(starRatingForRolePotential(potential, "central_midfielder"), 6);
  for (const key of PLAYER_ABILITY_KEYS) {
    const growth = Number(readPlayerAbility(potential, key)) - Number(readPlayerAbility(current, key));
    assert.equal(growth >= 0 && growth <= 10, true, key);
  }
});

function filledAbilities(value: number, overrides: PartialDeepPlayerAbilities = {}): PlayerAbilities {
  return {
    technical: {
      finishing: rating(overrides.technical?.finishing ?? value),
      passing: rating(overrides.technical?.passing ?? value),
      longPassing: rating(overrides.technical?.longPassing ?? value),
      crossing: rating(overrides.technical?.crossing ?? value),
      dribbling: rating(overrides.technical?.dribbling ?? value),
      technique: rating(overrides.technical?.technique ?? value),
      tackling: rating(overrides.technical?.tackling ?? value),
      penalties: rating(overrides.technical?.penalties ?? value),
      freeKicks: rating(overrides.technical?.freeKicks ?? value),
    },
    physical: {
      pace: rating(overrides.physical?.pace ?? value),
      strength: rating(overrides.physical?.strength ?? value),
      stamina: rating(overrides.physical?.stamina ?? value),
      agility: rating(overrides.physical?.agility ?? value),
      heading: rating(overrides.physical?.heading ?? value),
    },
    mental: {
      positioning: rating(overrides.mental?.positioning ?? value),
      vision: rating(overrides.mental?.vision ?? value),
      anticipation: rating(overrides.mental?.anticipation ?? value),
      composure: rating(overrides.mental?.composure ?? value),
      determination: rating(overrides.mental?.determination ?? value),
      leadership: rating(overrides.mental?.leadership ?? value),
    },
    goalkeeping: {
      reflexes: rating(overrides.goalkeeping?.reflexes ?? value),
      handling: rating(overrides.goalkeeping?.handling ?? value),
      rushingOut: rating(overrides.goalkeeping?.rushingOut ?? value),
      goalkeeperPositioning: rating(overrides.goalkeeping?.goalkeeperPositioning ?? value),
      footwork: rating(overrides.goalkeeping?.footwork ?? value),
    },
  };
}

function rating(value: number) {
  return abilityValue(value);
}

function prospectCase(
  division: ClubCategory,
  prospectClass: BandedContextualProspectClass,
  expectedMinimum: PlayerStarRating,
  expectedMaximum: PlayerStarRating,
) {
  return {
    division,
    prospectClass,
    expectedMinimum,
    expectedMaximum,
  } as const;
}

function starRatingForRolePotential(
  abilities: PlayerAbilities,
  role: "central_midfielder" | "center_back",
): PlayerStarRating {
  const roleAbility = Number(rolePotentialAbility(abilities, getPlayerRoleProfile(role)));
  let rating: PlayerStarRating = 1;
  for (const threshold of playerRatingScale.abilityThresholds) {
    if (roleAbility >= threshold.minimumAbilityInclusive) rating = threshold.rating;
  }
  return rating;
}

type PartialDeepPlayerAbilities = {
  readonly [Group in keyof PlayerAbilities]?: Partial<Record<keyof PlayerAbilities[Group], number>>;
};
