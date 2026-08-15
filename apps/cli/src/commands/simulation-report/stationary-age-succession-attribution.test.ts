import assert from "node:assert/strict";
import { test } from "vitest";

import type { PlayerGenerationExceptionalStockSummary } from "@game/simulation-tools";
import type { PlayerPotentialProjection } from "@game/engine";

import {
  evaluateProgressiveCurrent16FunnelCheckpoint,
  evaluateSuccessorCeilingPairedCanary,
  evaluateSuccessorCeilingPairedCheckpoint,
  evaluateSuccessorPathwayCanary,
  evaluateSuccessorPathwayCheckpoint,
  evaluateStationaryAgeSuccessionCheckpoint,
  type SuccessorCeilingArmWorldInput,
  type SuccessorPathwayWorldFacts,
  type StationaryAgeSuccessionWorldInput,
} from "./stationary-age-succession-attribution.ts";

test("L6.40 keeps independent owners and requires every real-data reachability lane", () => {
  const inputs = Array.from({ length: 7 }, (_, index) => worldInput(`world-${index + 1}`));
  const decision = evaluateStationaryAgeSuccessionCheckpoint(inputs);

  assert.equal(decision.decision, "OWNERS_IDENTIFIED");
  assert.deepEqual(decision.owners, [
    "OPENING_STOCK_RETENTION",
    "SUCCESSOR_FLOW",
    "MARKET_OR_DEVELOPMENT_FUNNEL",
  ]);
  assert.equal(decision.shared, true);
  assert.equal(decision.openingStockRetentionWorldCount, 7);
  assert.equal(decision.successorFlowWorldCount, 7);
  assert.equal(decision.worlds[0]?.transitions.length, 2);
  assert.equal(decision.pooled.transitionCount, 14);
  assert.equal(decision.pooled.needEpisodeCount, 14);
  assert.deepEqual(decision.reachability, {
    transitionWithPriorNeed: true,
    transitionWithoutPriorNeed: true,
    qualifiedMarketObstruction: true,
    completedSuccessorAcquisition: true,
    reopenedNeed: true,
  });

  const withoutReopenedNeed = inputs.map((input) => ({
    ...input,
    renewalNeedEpisodes: input.renewalNeedEpisodes.slice(0, 1),
  }));
  assert.equal(
    evaluateStationaryAgeSuccessionCheckpoint(withoutReopenedNeed).decision,
    "STOP_INSTRUMENT",
  );
});

test("L6.42 separates every current-16 lifecycle loss before naming its owner", () => {
  const inputs = Array.from({ length: 7 }, (_, index) =>
    current16WorldInput(`current16-world-${index + 1}`));
  const decision = evaluateProgressiveCurrent16FunnelCheckpoint(inputs);

  assert.equal(decision.decision, "OWNER_IDENTIFIED");
  assert.equal(decision.owner, "observed_ceiling_supply");
  assert.equal(decision.ownerCoherenceWorldCount, 7);
  assert.equal(decision.openingEliteRetentionOwner, true);
  assert.equal(decision.openingEliteRetentionWorldCount, 7);
  assert.equal(decision.generatedCurrent16LeaderCount, 7);
  assert.equal(decision.reconciliationFailureCount, 0);
  assert.equal(decision.stationarity.decision, "OWNER_IDENTIFIED");
  assert.equal(decision.stationarity.owner, "ceiling_supply");
  assert.equal(decision.funnel.senior_observation.denominatorCount, 91);
  assert.equal(decision.funnel.current16_retention.survivorCount, 7);
  assert.equal(
    Object.values(decision.openingStateCounts).reduce((sum, count) => sum + count, 0),
    decision.openingEliteCount,
  );

  const zeroRetentionLoss = inputs.map((input) => ({
    ...input,
    owner: {
      ...input.owner,
      playerSeasons: [
        ...input.owner.playerSeasons.map((row) => row.seasonNumber === 10
          && row.playerId === "generated:outside"
          ? { ...row, competitionId: "competition:ita-1", clubId: "club:1:generated" }
          : row.seasonNumber === 10 && row.playerId === "generated:quality"
            ? { ...row, currentAbility: 16 }
            : row),
        playerSeason({
          playerId: "generated:inactive",
          clubId: "club:1:generated",
          seasonNumber: 10,
          age: 28,
          currentAbility: 16,
        }),
      ],
    },
  }));
  const zeroLossDecision = evaluateProgressiveCurrent16FunnelCheckpoint(zeroRetentionLoss);
  assert.equal(zeroLossDecision.funnel.current16_retention.lossCount, 0);
  assert.equal(zeroLossDecision.decision, "OWNER_IDENTIFIED");

  const missingDenominator = inputs.map((input) => ({
    ...input,
    architecture: {
      ...input.architecture,
      playerOrigins: input.architecture.playerOrigins.filter(({ playerId }) =>
        !["generated:inactive", "generated:outside", "generated:quality", "generated:success"]
          .includes(playerId)),
    },
    owner: {
      ...input.owner,
      playerSeasons: input.owner.playerSeasons.filter(({ playerId }) =>
        !["generated:inactive", "generated:outside", "generated:quality", "generated:success"]
          .includes(playerId)),
    },
  }));
  assert.equal(
    evaluateProgressiveCurrent16FunnelCheckpoint(missingDenominator).decision,
    "STOP_INSTRUMENT",
  );
});

test("L6.43 pairs structural successor renewal and fails closed on six-star drift", () => {
  const control = Array.from({ length: 7 }, (_, index) =>
    successorWorldInput(`successor-world-${index + 1}`, false));
  const candidate = Array.from({ length: 7 }, (_, index) =>
    successorWorldInput(`successor-world-${index + 1}`, true));
  const canary = evaluateSuccessorCeilingPairedCanary({
    control: control.map((world) => ({
      ...world,
      successorCeilingSeasons: world.successorCeilingSeasons.slice(0, 1),
    })),
    candidate: candidate.map((world) => ({
      ...world,
      successorCeilingSeasons: world.successorCeilingSeasons.slice(0, 1),
    })),
  });
  assert.equal(canary.decision, "CANARY_GO");
  assert.equal(canary.seasonFactCount, 7);

  const decision = evaluateSuccessorCeilingPairedCheckpoint({
    control,
    candidate,
    seasonCount: 10,
    controlIntegratedFailedGateKeys: ["carried_known_red"],
    candidateIntegratedFailedGateKeys: ["carried_known_red"],
  });
  assert.equal(decision.decision, "GO");
  assert.equal(decision.generatedAtLeastOpeningWorldCount, 7);
  assert.equal(decision.candidateImprovementWorldCount, 7);
  assert.equal(decision.pooledCareerGeneratedLeaderShare, 0.9);
  assert.equal(decision.age33PlusLeaderCount > 0, true);
  assert.deepEqual(decision.newIntegratedFailureKeys, []);

  const drifted = candidate.map((world, index) => index !== 0 ? world : ({
    ...world,
    successorCeilingSeasons: world.successorCeilingSeasons.map((season) =>
      season.seasonNumber !== 1 ? season : {
        ...season,
        sixAssignmentPlayerIds: ["different-six"],
      }
    ),
  }));
  const driftDecision = evaluateSuccessorCeilingPairedCheckpoint({
    control,
    candidate: drifted,
    seasonCount: 10,
    controlIntegratedFailedGateKeys: [],
    candidateIntegratedFailedGateKeys: [],
  });
  assert.equal(driftDecision.decision, "STOP_RETHINK");
  assert.equal(driftDecision.failedGateKeys.includes("six_star_lane_identity"), true);
});

test("L6.43A attributes closed selected-player windows and rejects a broken boundary", () => {
  const control = Array.from({ length: 7 }, (_, index) =>
    successorWorldInput(`pathway-world-${index + 1}`, false));
  const candidate = Array.from({ length: 7 }, (_, index) =>
    successorPathwayWorldInput(`pathway-world-${index + 1}`));
  const canary = evaluateSuccessorPathwayCanary({
    control: control.map((world) => ({
      ...world,
      successorCeilingSeasons: world.successorCeilingSeasons.slice(0, 1),
    })),
    candidate: candidate.map((world) => ({
      ...world,
      successorCeilingSeasons: world.successorCeilingSeasons.slice(0, 1),
      pathway: {
        ...world.pathway,
        assignments: world.pathway.assignments.slice(0, 1),
        boundaries: world.pathway.boundaries.filter(({ seasonNumber }) => seasonNumber === 1),
      },
    })),
  });
  assert.equal(canary.decision, "CANARY_GO");
  assert.equal(canary.acceptedAssignmentCount, 7);

  const decision = evaluateSuccessorPathwayCheckpoint({
    control,
    candidate,
    seasonCount: 10,
  });
  assert.equal(decision.decision, "OWNER_IDENTIFIED");
  assert.equal(decision.owner, "senior_registration");
  assert.equal(decision.ownerCoherenceWorldCount, 7);
  assert.equal(decision.pooledClosedWindowCount, 49);
  assert.equal(decision.sixStarFirstDivergences.length, 7);
  assert.equal(decision.sixStarFirstDivergences[0]?.cause, "allocation_constraints");

  const broken = candidate.map((world, index) => index !== 0 ? world : ({
    ...world,
    pathway: {
      ...world.pathway,
      boundaries: world.pathway.boundaries.slice(1),
    },
  }));
  assert.equal(evaluateSuccessorPathwayCheckpoint({
    control,
    candidate: broken,
    seasonCount: 10,
  }).decision, "STOP_INSTRUMENT");
});

function successorWorldInput(
  worldSeed: string,
  candidate: boolean,
): SuccessorCeilingArmWorldInput {
  const base = current16WorldInput(worldSeed);
  const openingBuffer = Array.from({ length: 12 }, (_, index) => ({
    player: openingPlayerInCompetition({
      playerId: `opening:buffer:${index + 1}`,
      clubId: "club:1:opening-state",
      competitionId: "competition:ita-1",
      age: 24,
      currentAbility: 16,
    }),
    origin: {
      playerId: `opening:buffer:${index + 1}`,
      origin: "opening_senior" as const,
      generatedSeasonNumber: 0,
      entryClubId: "club:1:opening-state",
    },
  }));
  const generated = candidate
    ? Array.from({ length: 9 }, (_, index) => ({
        id: `generated:successor:${index + 1}`,
        row: playerSeason({
          playerId: `generated:successor:${index + 1}`,
          clubId: "club:1:generated",
          seasonNumber: 10,
          age: 25,
          currentAbility: 16,
          goals: 90 - index,
          assists: 90 - index,
        }),
        origin: {
          playerId: `generated:successor:${index + 1}`,
          origin: "annual_academy_intake" as const,
          generatedSeasonNumber: 4,
          entryClubId: "club:1:generated",
        },
      }))
    : [];
  const playerSeasons = base.owner.playerSeasons.map((row) =>
    row.playerId === "player:reference:1:1" && row.seasonNumber === 10
      ? { ...row, goals: 89.5, assists: 89.5 }
      : row
  );
  return {
    ...base,
    owner: {
      ...base.owner,
      openingPlayers: [
        ...(base.owner.openingPlayers ?? []),
        ...openingBuffer.map(({ player }) => player),
      ],
      playerSeasons: [...playerSeasons, ...generated.map(({ row }) => row)],
    },
    architecture: {
      ...base.architecture,
      playerOrigins: [
        ...base.architecture.playerOrigins,
        ...openingBuffer.map(({ origin }) => origin),
        ...generated.map(({ origin }) => origin),
      ],
    },
    successorCeilingSeasons: Array.from({ length: 10 }, (_, index) => ({
      seasonNumber: index + 1,
      activeFiveOrBetterCount: 14,
      targetFiveOrBetterCount: 16,
      fiveAssignmentCount: candidate ? 1 : 0,
      unfilledFiveVacancyCount: candidate ? 0 : 1,
      activeSixCount: 4,
      targetSixCount: 4,
      sixAssignmentCount: 1,
      unfilledSixVacancyCount: 0,
      clubCapRefusalCount: candidate ? 1 : 0,
      reconciliationFailureCount: 0,
      activeSixPlayerIds: ["active-six"],
      sixCandidateFacts: [{
        playerId: `six:${index + 1}`,
        clubId: "club:1:generated",
        division: "first_division",
      }],
      sixAssignmentPlayerIds: [`six:${index + 1}`],
      selectedPlayers: [
        {
          playerId: `six:${index + 1}`,
          clubId: "club:1:generated",
          role: "striker",
          developmentEnvironment: "excellent",
          minimumRating: 6 as const,
          projection: potentialProjection(`six:${index + 1}`, 17, 6),
        },
        ...(candidate ? [{
          playerId: `five:${index + 1}`,
          clubId: "club:1:generated",
          role: "striker",
          developmentEnvironment: "good",
          minimumRating: 5 as const,
          projection: potentialProjection(`five:${index + 1}`, 16, 5),
        }] : []),
      ],
    })),
  };
}

function successorPathwayWorldInput(worldSeed: string): SuccessorCeilingArmWorldInput & {
  readonly pathway: SuccessorPathwayWorldFacts;
} {
  const base = successorWorldInput(worldSeed, true);
  const successorCeilingSeasons = base.successorCeilingSeasons.map((season) =>
    season.seasonNumber !== 5
      ? season
      : { ...season, sixAssignmentPlayerIds: ["six:drifted"] }
  );
  const assignments = successorCeilingSeasons.flatMap((season) =>
    season.selectedPlayers
      .filter(({ minimumRating }) => minimumRating === 5)
      .map((selected) => ({
        seasonNumber: season.seasonNumber,
        playerId: selected.playerId,
        clubId: selected.clubId,
        role: selected.role,
        developmentEnvironment: selected.developmentEnvironment,
        projection: selected.projection,
      }))
  );
  const boundaries = assignments.flatMap((assignment) =>
    Array.from({ length: 11 - assignment.seasonNumber }, (_, index) => {
      const seasonNumber = assignment.seasonNumber + index;
      const exitSeason = assignment.seasonNumber + 3;
      return {
        seasonNumber,
        playerId: assignment.playerId,
        academyActive: seasonNumber < exitSeason,
        academyExitOutcomes: seasonNumber === exitSeason && exitSeason <= 10
          ? ["released" as const]
          : [],
        seniorAssociations: [],
        playerExitReasons: [],
        projection: "not_observed" as const,
      };
    })
  );
  return {
    ...base,
    successorCeilingSeasons,
    pathway: {
      worldSeed,
      assignments,
      boundaries,
      reconciliationFailureCount: 0,
    },
  };
}

function potentialProjection(
  playerId: string,
  storedCeilingAbility: number,
  storedCeilingRating: 5 | 6,
): PlayerPotentialProjection {
  return {
    playerId: playerId as PlayerPotentialProjection["playerId"],
    age: 17,
    roleFamily: "outfield" as const,
    currentAbility: 12,
    p50Ability: 15,
    upperAbility: storedCeilingAbility,
    storedCeilingAbility,
    currentRating: 3.5 as const,
    p50Rating: 4.5 as const,
    upperRating: storedCeilingRating,
    storedCeilingRating,
  };
}

function current16WorldInput(worldSeed: string): StationaryAgeSuccessionWorldInput {
  const competitions = ["competition:ita-1", "competition:ita-2", "competition:ita-3"];
  const openingPlayers = competitions.flatMap((competitionId, divisionIndex) =>
    Array.from({ length: 3 }, (_, index) => openingPlayerInCompetition({
      playerId: `player:reference:${divisionIndex + 1}:${index + 1}`,
      clubId: `club:${divisionIndex + 1}:reference`,
      competitionId,
      age: 24,
      currentAbility: 16,
    }))
  );
  const openingRows = competitions.flatMap((competitionId, divisionIndex) =>
    Array.from({ length: 3 }, (_, index) => {
      const playerId = `player:reference:${divisionIndex + 1}:${index + 1}`;
      return [
        playerSeason({
          playerId,
          clubId: `club:${divisionIndex + 1}:reference`,
          competitionId,
          seasonNumber: 1,
          age: 24,
          currentAbility: 16,
        }),
        playerSeason({
          playerId,
          clubId: `club:${divisionIndex + 1}:reference`,
          competitionId,
          seasonNumber: 10,
          age: 33,
          currentAbility: 16,
        }),
      ];
    }).flat()
  );
  const openingStatePlayers = [
    ["opening:not-active", "not_active"] as const,
    ["opening:outside", "outside"] as const,
    ["opening:below", "below"] as const,
    ["opening:retained-a", "retained"] as const,
    ["opening:retained-b", "retained"] as const,
    ["opening:retained-c", "retained"] as const,
  ];
  for (const [playerId] of openingStatePlayers) {
    openingPlayers.push(openingPlayerInCompetition({
      playerId,
      clubId: "club:1:opening-state",
      competitionId: "competition:ita-1",
      age: 25,
      currentAbility: 16,
    }));
  }
  openingPlayers.push(openingPlayerInCompetition({
    playerId: "opening:from-below",
    clubId: "club:1:opening-state",
    competitionId: "competition:ita-1",
    age: 24,
    currentAbility: 15,
  }));
  openingPlayers.push(openingPlayerInCompetition({
    playerId: "opening:generated-club-anchor",
    clubId: "club:1:generated",
    competitionId: "competition:ita-1",
    age: 24,
    currentAbility: 15,
  }));
  const openingStateRows = openingStatePlayers.flatMap(([playerId, state]) => {
    if (state === "not_active") return [];
    return [playerSeason({
      playerId,
      clubId: state === "outside" ? "club:2:reference" : "club:1:opening-state",
      competitionId: state === "outside" ? "competition:ita-2" : "competition:ita-1",
      seasonNumber: 10,
      age: 34,
      currentAbility: state === "below" ? 15 : 16,
    })];
  });
  openingStateRows.push(playerSeason({
    playerId: "opening:from-below",
    clubId: "club:1:opening-state",
    competitionId: "competition:ita-1",
    seasonNumber: 10,
    age: 33,
    currentAbility: 16,
  }));

  const generatedDefinitions = [
    { id: "generated:no-senior", stage: "no_senior" },
    { id: "generated:ceiling", stage: "ceiling" },
    { id: "generated:development", stage: "development" },
    { id: "generated:inactive", stage: "inactive" },
    { id: "generated:outside", stage: "outside" },
    { id: "generated:quality", stage: "quality" },
    { id: "generated:success", stage: "success" },
    ...Array.from({ length: 6 }, (_, index) => ({
      id: `generated:ceiling-extra-${index + 1}`,
      stage: "ceiling",
    })),
  ];
  const generatedRows = generatedDefinitions.flatMap(({ id, stage }) => {
    if (stage === "no_senior") return [];
    if (stage === "ceiling") return [playerSeason({
      playerId: id,
      clubId: "club:1:generated",
      seasonNumber: 10,
      age: 25,
      currentAbility: 14,
      potentialRoom: 1,
    })];
    if (stage === "development") return [playerSeason({
      playerId: id,
      clubId: "club:1:generated",
      seasonNumber: 10,
      age: 25,
      currentAbility: 14,
      potentialRoom: 2,
    })];
    if (stage === "inactive") return [playerSeason({
      playerId: id,
      clubId: "club:1:generated",
      seasonNumber: 4,
      age: 22,
      currentAbility: 16,
    })];
    return [
      playerSeason({
        playerId: id,
        clubId: "club:1:generated",
        seasonNumber: 4,
        age: 22,
        currentAbility: 16,
      }),
      playerSeason({
        playerId: id,
        clubId: stage === "outside" ? "club:2:reference" : "club:1:generated",
        competitionId: stage === "outside" ? "competition:ita-2" : "competition:ita-1",
        seasonNumber: 10,
        age: 28,
        currentAbility: stage === "quality" ? 15 : 16,
        goals: stage === "success" ? 100 : 0,
        assists: stage === "success" ? 100 : 0,
      }),
    ];
  });
  const lowerDivisionGenerated = [2, 3].flatMap((division) => {
    const playerId = `generated:division-${division}`;
    return {
      playerId,
      origin: {
        playerId,
        origin: "annual_academy_intake" as const,
        generatedSeasonNumber: 4,
        entryClubId: `club:${division}:reference`,
      },
      row: playerSeason({
        playerId,
        clubId: `club:${division}:reference`,
        competitionId: `competition:ita-${division}`,
        seasonNumber: 10,
        age: 25,
        currentAbility: 16,
      }),
    };
  });
  const openingOrigins = openingPlayers.map(({ playerId, clubId }) => ({
    playerId,
    origin: "opening_senior" as const,
    generatedSeasonNumber: 0,
    entryClubId: clubId,
  }));
  const generatedOrigins = generatedDefinitions.map(({ id }) => ({
    playerId: id,
    origin: "annual_academy_intake" as const,
    generatedSeasonNumber: 4,
    entryClubId: "club:1:generated",
  }));
  return {
    owner: {
      worldSeed,
      openingPlayers,
      tableSeasons: [],
      playerSeasons: [
        ...openingRows,
        ...openingStateRows,
        ...generatedRows,
        ...lowerDivisionGenerated.map(({ row }) => row),
      ],
      selectionLoadSeasons: [],
      playerUseSeasons: [],
      clubIdentitySeasons: [],
      annualRolePlanReconciliationFailureCount: 0,
      annualRolePlanPositiveRoleCounts: [],
      reconciliationFailureCount: 0,
    },
    architecture: {
      worldSeed,
      playerOrigins: [
        ...openingOrigins,
        ...generatedOrigins,
        ...lowerDivisionGenerated.map(({ origin }) => origin),
      ],
      exits: [],
    },
    renewalNeedEpisodes: [],
    exceptionalStock: emptyExceptionalStock(),
  };
}

function openingPlayerInCompetition(input: {
  readonly playerId: string;
  readonly clubId: string;
  readonly competitionId: string;
  readonly age: number;
  readonly currentAbility: number;
}) {
  return {
    ...openingPlayer(
      input.playerId,
      input.clubId,
      input.age,
      input.currentAbility,
      true,
    ),
    competitionId: input.competitionId,
  };
}

function worldInput(worldSeed: string): StationaryAgeSuccessionWorldInput {
  const seasonTenRows = Array.from({ length: 10 }, (_, index) => playerSeason({
    playerId: `player:leader-${index}`,
    clubId: "club:a",
    seasonNumber: 10,
    age: 25 + index % 5,
    currentAbility: 16,
    goals: 20 - index,
    assists: 12 - index,
  }));
  const transitionRows = [
    playerSeason({
      playerId: "player:incumbent-a",
      clubId: "club:a",
      seasonNumber: 1,
      age: 30,
      currentAbility: 16,
    }),
    playerSeason({
      playerId: "player:incumbent-a",
      clubId: "club:a",
      seasonNumber: 2,
      age: 31,
      currentAbility: 15.4,
    }),
    playerSeason({
      playerId: "player:incumbent-b",
      clubId: "club:b",
      seasonNumber: 1,
      age: 30,
      currentAbility: 15,
    }),
  ];
  const origins = [
    ...seasonTenRows.map((row, index) => ({
      playerId: row.playerId,
      origin: index < 6 ? "opening_senior" as const : "annual_academy_intake" as const,
      generatedSeasonNumber: index < 6 ? 0 : 4,
    })),
    {
      playerId: "player:incumbent-a",
      origin: "opening_senior" as const,
      generatedSeasonNumber: 0,
    },
    {
      playerId: "player:incumbent-b",
      origin: "opening_senior" as const,
      generatedSeasonNumber: 0,
    },
  ];
  return {
    owner: {
      worldSeed,
      openingPlayers: [
        openingPlayer("player:incumbent-a", "club:a", 30, 16, true),
        openingPlayer("player:incumbent-b", "club:b", 30, 15, true),
      ],
      tableSeasons: [],
      playerSeasons: [...transitionRows, ...seasonTenRows],
      selectionLoadSeasons: [],
      playerUseSeasons: [],
      clubIdentitySeasons: [],
      annualRolePlanReconciliationFailureCount: 0,
      annualRolePlanPositiveRoleCounts: [],
      reconciliationFailureCount: 0,
    },
    architecture: {
      worldSeed,
      playerOrigins: origins,
      exits: [],
    },
    renewalNeedEpisodes: [
      {
        worldSeed,
        divisionLevel: 1,
        clubId: "club:a",
        seasonNumber: 1,
        role: "striker",
        needEpisodeOrdinal: 1,
        firstAppearanceDate: 1,
        maximumStage: "fulfilled",
        terminalOutcome: "fulfilled",
        fulfilledPlayerId: "player:successor",
        roleSuccessionSnapshot: {
          incumbent: {
            playerId: "player:incumbent-a" as never,
            age: 30,
            currentAbility: 16,
            p50Ability: 16,
            upperAbility: 16,
          },
          planningFloor: 14,
          sameRoleAlternativeCount: 1,
          bestPrimeAgeAlternative: {
            playerId: "player:internal" as never,
            age: 24,
            currentAbility: 14.5,
            p50Ability: 15,
            upperAbility: 16,
          },
        },
        successionTargetPoolStage: "qualified_prime_age_loses_generic_score",
      },
      {
        worldSeed,
        divisionLevel: 1,
        clubId: "club:a",
        seasonNumber: 3,
        role: "striker",
        needEpisodeOrdinal: 2,
        firstAppearanceDate: 3,
        maximumStage: "observed",
        terminalOutcome: "recruitment_impossible",
      },
    ],
    exceptionalStock: emptyExceptionalStock(),
  };
}

function playerSeason(input: {
  readonly playerId: string;
  readonly clubId: string;
  readonly competitionId?: string;
  readonly seasonNumber: number;
  readonly age: number;
  readonly currentAbility: number;
  readonly potentialRoom?: number;
  readonly goals?: number;
  readonly assists?: number;
}) {
  return {
    competitionId: input.competitionId ?? "competition:ita-1",
    seasonNumber: input.seasonNumber,
    playerId: input.playerId,
    clubId: input.clubId,
    age: input.age,
    role: "striker" as const,
    currentAbility: input.currentAbility,
    potentialRoom: input.potentialRoom ?? 0,
    appearances: 1,
    starts: 1,
    minutes: 90,
    shots: 1,
    shotsOnTarget: 1,
    creatorNominations: 1,
    goals: input.goals ?? 0,
    assists: input.assists ?? 0,
  };
}

function openingPlayer(
  playerId: string,
  clubId: string,
  age: number,
  currentAbility: number,
  openingStarter: boolean,
) {
  return {
    competitionId: "competition:ita-1",
    clubId,
    playerId,
    age,
    role: "striker" as const,
    currentAbility,
    openingStarter,
  };
}

function emptyExceptionalStock(): PlayerGenerationExceptionalStockSummary {
  return {
    observationCount: 0,
    evaluationStatus: "not_evaluated",
    activePlayerObservationCount: 0,
    youngStoredCeilingSixObservationCount: 0,
    youngPublicUpperSixObservationCount: 0,
    transitionObservationCount: 0,
    requiredReplacementObservationCount: 0,
    completedReplacementCount: 0,
    missingReplacementCount: 0,
    inflationArrivalCount: 0,
    stockEntryObservationCount: 0,
    stockEntryPlayerObservationCount: 0,
    stockEntryCategoryPlacementViolationCount: 0,
    stockEntryClubUniquenessViolationCount: 0,
    snapshots: [],
    transitions: [],
    stockEntries: [],
  };
}
