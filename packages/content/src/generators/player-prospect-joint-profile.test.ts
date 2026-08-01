import assert from "node:assert/strict";
import { test } from "vitest";

import {
  getPlayerRoleProfile,
  isPotentialAtLeastCurrent,
  PLAYER_ABILITY_KEYS,
  PLAYER_ROLES,
  readPlayerAbility,
  roleCurrentAbility,
  rolePotentialAbility,
  type ClubCategory,
  type PlayerRole,
  type PlayerStarRating,
} from "@game/domain";

import { playerRatingScale } from "../balance/player-economy-calibration.ts";
import type { GeneratedPlayerArchetypeKey } from "./player-archetypes.ts";
import type { PlayerGenerationClubTier } from "./player-generation-bands.ts";
import {
  buildContextualProspectJointProfile,
  ContextualProspectJointProfileError,
  deriveContextualProspectCeilingAbilityInterval,
  deriveContextualProspectCurrentEnvelope,
} from "./player-prospect-joint-profile.ts";
import {
  materializeContextualProspectPotentialTarget,
  minimumRoleAbilityForStarRating,
  selectContextualProspectCeilingCandidate,
  starRatingForRoleAbility,
  type ContextualProspectPotentialTarget,
} from "./player-potential-allocation.ts";
import {
  CONTEXTUAL_PROSPECT_CEILING_RATING_BANDS,
  type BandedContextualProspectClass,
} from "./player-potential-rarity.ts";

test("explicit prospects select the ceiling first and preserve at least one star of young upside", () => {
  const cases: readonly {
    readonly division: ClubCategory;
    readonly clubTier: PlayerGenerationClubTier;
    readonly archetypeKey: Extract<GeneratedPlayerArchetypeKey, "good_prospect" | "serious_prospect" | "rare_prodigy">;
    readonly role: PlayerRole;
  }[] = [
    { division: "third_division", clubTier: "survival", archetypeKey: "good_prospect", role: "goalkeeper" },
    { division: "second_division", clubTier: "mid_table", archetypeKey: "serious_prospect", role: "center_back" },
    { division: "first_division", clubTier: "title_contender", archetypeKey: "rare_prodigy", role: "striker" },
  ];

  for (const candidate of cases) {
    for (const ageYears of [15, 18, 20]) {
      const input = jointInput({ ...candidate, ageYears });
      const first = buildContextualProspectJointProfile(input);
      const replay = buildContextualProspectJointProfile(input);
      assert.equal(first.kind, "contextual_prospect");
      if (first.kind !== "contextual_prospect") continue;

      const profile = getPlayerRoleProfile(candidate.role);
      const currentRating = starRatingForRoleAbility(
        Number(roleCurrentAbility(first.current, profile)),
        playerRatingScale,
      );
      const potentialRating = starRatingForRoleAbility(
        Number(rolePotentialAbility(first.potential, profile)),
        playerRatingScale,
      );

      assert.equal(potentialRating, first.selectedCeiling.ceilingRating);
      assert.equal(
        Math.abs(
          Number(rolePotentialAbility(first.potential, profile))
            - first.selectedCeiling.rolePotentialAbility,
        ) <= 0.000_01,
        true,
      );
      assert.equal(potentialRating - currentRating >= 1, true);
      assert.equal(isPotentialAtLeastCurrent(first.current, first.potential), true);
      assert.deepEqual(replay, first);
    }
  }
});

test("every supported age, context, role, class, and half-star target has a non-empty current envelope", () => {
  const divisions: readonly ClubCategory[] = [
    "third_division",
    "second_division",
    "first_division",
  ];
  const clubTiers: readonly PlayerGenerationClubTier[] = [
    "survival",
    "mid_table",
    "playoff_contender",
    "title_contender",
  ];
  const classes: readonly {
    readonly prospectClass: BandedContextualProspectClass;
    readonly archetypeKey: Extract<GeneratedPlayerArchetypeKey, "good_prospect" | "serious_prospect" | "rare_prodigy">;
  }[] = [
    { prospectClass: "interesting", archetypeKey: "good_prospect" },
    { prospectClass: "serious", archetypeKey: "serious_prospect" },
    { prospectClass: "rare", archetypeKey: "rare_prodigy" },
  ];
  let supportedConfigurations = 0;

  for (const division of divisions) {
    for (const clubTier of clubTiers) {
      for (const ageYears of [15, 16, 17, 18, 19, 20]) {
        for (const role of PLAYER_ROLES) {
          for (const candidate of classes) {
            if (isUnsupportedRarePlacement(division, clubTier, candidate.prospectClass)) continue;
            const band = CONTEXTUAL_PROSPECT_CEILING_RATING_BANDS[division][candidate.prospectClass];
            const ratings = playerRatingScale.supportedRatings.filter(
              (rating) => rating >= band.minimumRating && rating <= band.maximumRating,
            );

            for (const rating of ratings) {
              const input = jointInput({
                division,
                clubTier,
                ageYears,
                role,
                archetypeKey: candidate.archetypeKey,
              });
              const ceilingInterval = deriveContextualProspectCeilingAbilityInterval(
                input,
                rating,
              );
              for (const rolePotentialAbility of [
                ceilingInterval.minimumRolePotentialAbility,
                ceilingInterval.maximumRolePotentialAbility,
              ]) {
                const envelope = deriveContextualProspectCurrentEnvelope(input, {
                  ceilingRating: rating,
                  rolePotentialAbility,
                }, ceilingInterval);
                assert.equal(
                  envelope.minimumBandPosition <= envelope.maximumBandPosition,
                  true,
                  `${division}:${clubTier}:${ageYears}:${role}:${candidate.prospectClass}:${rating}`,
                );
                supportedConfigurations += 1;
              }
            }
          }
        }
      }
    }
  }

  assert.equal(supportedConfigurations > 4_000, true);
}, 60_000);

test("weak first-division rare-prodigy placements fail with complete typed context", () => {
  for (const clubTier of ["survival", "mid_table"] as const) {
    const input = jointInput({
      division: "first_division",
      clubTier,
      ageYears: 18,
      role: "striker",
      archetypeKey: "rare_prodigy",
    });
    assert.throws(
      () => deriveContextualProspectCeilingAbilityInterval(input, 6),
      (error: unknown) => {
        assert.equal(error instanceof ContextualProspectJointProfileError, true);
        if (!(error instanceof ContextualProspectJointProfileError)) return false;
        assert.equal(error.code, "unsupported_rare_prodigy_placement");
        assert.equal(error.context.ageYears, 18);
        assert.equal(error.context.division, "first_division");
        assert.equal(error.context.clubTier, clubTier);
        assert.equal(error.context.role, "striker");
        assert.equal(error.context.prospectClass, "rare");
        assert.equal(error.context.currentBand.maximumRoleAbility > 0, true);
        assert.equal(error.context.ceilingTarget.ceilingRating, 6);
        assert.equal(error.context.requiredRatingGap, 1);
        return true;
      },
    );
  }
});

test("an empty exact-ceiling interval fails through the typed joint-policy boundary", () => {
  const incompatibleRatingScale = {
    ...playerRatingScale,
    abilityThresholds: playerRatingScale.abilityThresholds.map((threshold) => (
      threshold.rating === 6
        ? { ...threshold, minimumAbilityInclusive: 21 }
        : threshold
    )),
  };
  const input = {
    ...jointInput({
      division: "second_division",
      clubTier: "title_contender",
      ageYears: 17,
      role: "central_midfielder",
      archetypeKey: "rare_prodigy",
    }),
    ratingScale: incompatibleRatingScale,
  };

  assert.throws(
    () => deriveContextualProspectCeilingAbilityInterval(input, 6),
    (error: unknown) => {
      assert.equal(error instanceof ContextualProspectJointProfileError, true);
      if (!(error instanceof ContextualProspectJointProfileError)) return false;
      assert.equal(error.code, "empty_ceiling_ability_interval");
      assert.equal(error.context.ceilingTarget.ceilingRating, 6);
      return true;
    },
  );
});

test("semantic ceiling constraints expose no raw ability threshold to composition roots", () => {
  const base = {
    seed: "semantic-ceiling-constraint",
    playerKey: "player:semantic-ceiling-constraint",
    division: "first_division" as const,
    prospectClass: "rare" as const,
    ratingScale: playerRatingScale,
  };
  const sixCandidate = selectContextualProspectCeilingCandidate({
    ...base,
    ceilingConstraint: { kind: "at_least_rating", rating: 6 },
  });
  const belowSixCandidate = selectContextualProspectCeilingCandidate({
    ...base,
    ceilingConstraint: { kind: "below_rating", rating: 6 },
  });
  const six = materializeContextualProspectPotentialTarget({
    candidate: sixCandidate,
    role: "striker",
    ratingScale: base.ratingScale,
    maximumFeasibleRolePotentialAbility: 20,
  });
  const belowSix = materializeContextualProspectPotentialTarget({
    candidate: belowSixCandidate,
    role: "striker",
    ratingScale: base.ratingScale,
    maximumFeasibleRolePotentialAbility: 20,
  });

  assert.equal(six.ceilingRating, 6);
  assert.equal(belowSix.ceilingRating, 5.5);
  assert.equal(six.rolePotentialAbility >= minimumRoleAbilityForStarRating(playerRatingScale, 6), true);
  assert.equal(belowSix.rolePotentialAbility < minimumRoleAbilityForStarRating(playerRatingScale, 6), true);
});

test("sampled exact ceilings vary but never exceed the context-derived feasible upper edge", () => {
  const observedAbilities = new Set<number>();

  for (let sampleIndex = 0; sampleIndex < 96; sampleIndex += 1) {
    const input = {
      ...jointInput({
        division: "first_division",
        clubTier: "title_contender",
        ageYears: 16,
        role: "striker",
        archetypeKey: "rare_prodigy",
      }),
      seed: `joint-exact-ceiling:${sampleIndex}`,
      playerKey: `player:joint-exact-ceiling:${sampleIndex}`,
      ceilingConstraint: { kind: "at_least_rating", rating: 6 } as const,
    };
    const joint = buildContextualProspectJointProfile(input);
    assert.equal(joint.kind, "contextual_prospect");
    if (joint.kind !== "contextual_prospect") continue;

    const interval = deriveContextualProspectCeilingAbilityInterval(
      input,
      joint.selectedCeiling.ceilingRating,
    );
    assert.equal(
      joint.selectedCeiling.rolePotentialAbility
        <= interval.maximumRolePotentialAbility + 0.000_001,
      true,
    );
    observedAbilities.add(Number(joint.selectedCeiling.rolePotentialAbility.toFixed(4)));
  }

  assert.equal(observedAbilities.size > 24, true);
});

test("joint construction keeps a budgeted six reachable without breaking role hard caps", () => {
  const profile = buildContextualProspectJointProfile({
    ...jointInput({
      division: "third_division",
      clubTier: "survival",
      ageYears: 16,
      role: "center_back",
      archetypeKey: "rare_prodigy",
    }),
    ceilingConstraint: { kind: "at_least_rating", rating: 6 },
  });
  assert.equal(profile.kind, "contextual_prospect");
  if (profile.kind !== "contextual_prospect") return;

  assert.equal(profile.selectedCeiling.ceilingRating, 6);
  assert.equal(Number(profile.potential.technical.finishing) <= 10, true);
  assert.equal(Number(profile.potential.goalkeeping.reflexes) <= 4, true);
  for (const key of PLAYER_ABILITY_KEYS) {
    const growth: number = Number(readPlayerAbility(profile.potential, key))
      - Number(readPlayerAbility(profile.current, key));
    assert.equal(growth >= 0 && growth <= 10, true, key);
  }
});

test("routine youth keep the plateau-capable policy instead of receiving a forced gap", () => {
  const profile = buildContextualProspectJointProfile(jointInput({
    division: "third_division",
    clubTier: "survival",
    ageYears: 20,
    role: "central_midfielder",
    archetypeKey: "normal_youth",
  }));

  assert.equal(profile.kind, "routine");
  assert.equal(profile.prospectClass, "routine");
  assert.equal(isPotentialAtLeastCurrent(profile.current, profile.potential), true);
});

function jointInput(overrides: Partial<{
  readonly division: ClubCategory;
  readonly clubTier: PlayerGenerationClubTier;
  readonly role: PlayerRole;
  readonly ageYears: number;
  readonly archetypeKey: GeneratedPlayerArchetypeKey;
}> = {}) {
  return {
    seed: "joint-profile-test",
    playerKey: "player:joint-profile-test",
    division: overrides.division ?? "second_division",
    clubTier: overrides.clubTier ?? "playoff_contender",
    role: overrides.role ?? "central_midfielder",
    ageYears: overrides.ageYears ?? 17,
    archetypeKey: overrides.archetypeKey ?? "serious_prospect",
    requestedCurrentAbilityLane: "normal" as const,
    ratingScale: playerRatingScale,
    ceilingConstraint: { kind: "policy" } as const,
  };
}

function isUnsupportedRarePlacement(
  division: ClubCategory,
  clubTier: PlayerGenerationClubTier,
  prospectClass: BandedContextualProspectClass,
): boolean {
  return division === "first_division"
    && prospectClass === "rare"
    && clubTier !== "playoff_contender"
    && clubTier !== "title_contender";
}
