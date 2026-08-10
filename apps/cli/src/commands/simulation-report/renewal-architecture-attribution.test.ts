import assert from "node:assert/strict";
import { test } from "vitest";

import {
  evaluateRenewalAblation,
  evaluateRenewalNeedFunnel,
  maximumReplacementMatching,
  renewalNeedEpisodesForSeason,
  renewalArchitectureOwner,
  type RenewalAblationArmFacts,
  type RenewalAblationArmKey,
  type RenewalAblationMetric,
  type ReplacementMatchingPlayer,
} from "./renewal-architecture-attribution.ts";

test("maximum replacement matching never reuses a player and preserves the maximum cardinality", () => {
  const incumbents = [
    player("incumbent:strong", "club:a", 11),
    player("incumbent:weak", "club:a", 10),
  ];
  const candidates = [
    player("candidate:strong", "club:a", 10.5),
    player("candidate:weak", "club:a", 9.5),
  ];

  assert.deepEqual(maximumReplacementMatching({ incumbents, candidates, sameClub: true }), [
    { incumbentPlayerId: "incumbent:weak", replacementPlayerId: "candidate:weak" },
    { incumbentPlayerId: "incumbent:strong", replacementPlayerId: "candidate:strong" },
  ]);
});

test("local and division matchings answer different replacement questions", () => {
  const incumbent = player("incumbent", "club:a", 10);
  const elsewhere = player("elsewhere", "club:b", 10);

  assert.equal(maximumReplacementMatching({
    incumbents: [incumbent],
    candidates: [elsewhere],
    sameClub: true,
  }).length, 0);
  assert.equal(maximumReplacementMatching({
    incumbents: [incumbent],
    candidates: [elsewhere],
    sameClub: false,
  }).length, 1);
});

test("the preregistered architecture rule reaches every owner and fails missing facts closed", () => {
  const base = {
    openingSeniorLeaderSlotShare: 0.7,
    localReplacementCapacity: 0.2,
    divisionReplacementCapacity: 0.2,
    worldsMeetingMatureAcademyParity: 7,
    annualAcademyMaterialMinuteShare: 0.8,
    reconciliationFailureCount: 0,
  } as const;

  assert.equal(renewalArchitectureOwner({
    ...base,
    localReplacementCapacity: 0.5,
  }), "selection_retention");
  assert.equal(renewalArchitectureOwner({
    ...base,
    divisionReplacementCapacity: 0.5,
  }), "market_distribution");
  assert.equal(renewalArchitectureOwner({
    ...base,
    worldsMeetingMatureAcademyParity: 5,
  }), "academy_realization");
  assert.equal(renewalArchitectureOwner(base), "renewal_supply");
  assert.equal(renewalArchitectureOwner({
    ...base,
    localReplacementCapacity: "not_observed",
  }), "coupled_or_not_attributed");
  assert.equal(renewalArchitectureOwner({
    ...base,
    reconciliationFailureCount: 1,
  }), "coupled_or_not_attributed");
});

test("renewal episodes reopen after fulfillment and reconcile both total taxonomies", () => {
  type EpisodeInput = Parameters<typeof renewalNeedEpisodesForSeason>[0];
  const buyer = "club:buyer" as EpisodeInput["diagnostics"][number]["clubId"];
  const target = "player:target" as EpisodeInput["lifecycleFacts"][number]["playerId"];
  const asGameDate = (value: number) => value as EpisodeInput["diagnostics"][number]["occurredOn"];
  const episodes = renewalNeedEpisodesForSeason({
    worldSeed: "world",
    seasonNumber: 4,
    divisionByClubId: { [buyer]: 1 },
    playerRoleById: { [target]: "striker" },
    diagnostics: [10, 11, 13].flatMap((date, index) => [
      {
        occurredOn: asGameDate(date),
        clubId: buyer,
        target: { kind: "role" as const, role: "striker" as const },
        event: "need_evaluated" as const,
        count: 1,
      },
      ...(index === 0 ? [{
        occurredOn: asGameDate(date),
        clubId: buyer,
        target: { kind: "role" as const, role: "striker" as const },
        event: "permanent_target_found" as const,
        playerId: target,
        count: 1,
      }] : []),
    ]),
    lifecycleFacts: [{
      occurredOn: asGameDate(12),
      event: "transfer_completed",
      buyingClubId: buyer,
      playerId: target,
      negotiationId: "negotiation:1",
    }],
  });

  assert.equal(episodes.length, 2);
  assert.deepEqual(episodes.map(({ needEpisodeOrdinal, terminalOutcome }) => ({
    needEpisodeOrdinal,
    terminalOutcome,
  })), [
    { needEpisodeOrdinal: 1, terminalOutcome: "fulfilled" },
    { needEpisodeOrdinal: 2, terminalOutcome: "recruitment_impossible" },
  ]);
  assert.equal(evaluateRenewalNeedFunnel(episodes).reconciliationFailureCount, 0);
});

test("factorial attribution requires both conditional contrasts and five paired worlds", () => {
  const arms = factorialArms({ market: 0.06, blueprint: 0, interaction: 0 });
  const decision = evaluateRenewalAblation(arms);
  assert.equal(
    decision.metrics.find(({ metric }) => metric === "localReplacementCapacity")?.owner,
    "market",
  );

  const incoherent = {
    ...arms,
    market: {
      ...arms.market,
      worlds: arms.market.worlds.map((world, index) => index < 4
        ? world
        : { ...world, values: { ...world.values, localReplacementCapacity: 0.19 } }),
    },
  };
  assert.equal(
    evaluateRenewalAblation(incoherent).metrics.find(
      ({ metric }) => metric === "localReplacementCapacity",
    )?.owner,
    "not_reproduced",
  );
});

test("material interaction is never assigned to one axis", () => {
  const decision = evaluateRenewalAblation(factorialArms({
    market: 0.04,
    blueprint: 0.04,
    interaction: 0.04,
  }));
  assert.equal(
    decision.metrics.find(({ metric }) => metric === "localReplacementCapacity")?.owner,
    "shared_interaction",
  );
});

test("population divergence is paired by world and reports the first changed season", () => {
  const arms = factorialArms({ market: 0.06, blueprint: 0, interaction: 0 });
  const changedWorlds = arms.blueprint.populationSignatures.map((world, index) => ({
    ...world,
    seasons: world.seasons.map((season) => index === 0 && season.seasonNumber === 2
      ? { ...season, sha256: "changed" }
      : season),
  }));
  const decision = evaluateRenewalAblation({
    ...arms,
    blueprint: { ...arms.blueprint, populationSignatures: changedWorlds },
  });

  assert.equal(
    decision.firstPopulationDivergenceSeasonByArm.blueprint["world-1"],
    2,
  );
  assert.equal(
    decision.firstPopulationDivergenceSeasonByArm.blueprint["world-2"],
    "not_observed",
  );
});

function player(
  playerId: string,
  clubId: string,
  currentAbility: number,
): ReplacementMatchingPlayer {
  return {
    playerId,
    clubId,
    role: "striker",
    currentAbility,
  };
}

function factorialArms(input: {
  readonly market: number;
  readonly blueprint: number;
  readonly interaction: number;
}): Readonly<Record<RenewalAblationArmKey, RenewalAblationArmFacts>> {
  const base = 0.2;
  return {
    control: arm("control", base),
    market: arm("market", base + input.market),
    blueprint: arm("blueprint", base + input.blueprint),
    combined: arm("combined", base + input.market + input.blueprint + input.interaction),
  };
}

function arm(
  armKey: RenewalAblationArmKey,
  localReplacementCapacity: number,
): RenewalAblationArmFacts {
  const values = metricValues(localReplacementCapacity);
  return {
    arm: armKey,
    values,
    worlds: Array.from({ length: 7 }, (_, index) => ({
      worldSeed: `world-${index + 1}`,
      values,
    })),
    populationSignatures: Array.from({ length: 7 }, (_, index) => ({
      worldSeed: `world-${index + 1}`,
      seasons: [1, 2].map((seasonNumber) => ({
        seasonNumber,
        playerCount: 100,
        sha256: `same-${seasonNumber}`,
      })),
    })),
  };
}

function metricValues(
  localReplacementCapacity: number,
): Readonly<Record<RenewalAblationMetric, number>> {
  return {
    localReplacementCapacity,
    divisionReplacementCapacity: 0.6,
    fourReplicatedFormationRetentionShare: 0.96,
    careerGeneratedLeaderShareSeasonTen: 0.55,
    championPoints: 65,
  };
}
