import assert from "node:assert/strict";
import { test } from "vitest";

import { createFakeDomesticWorld, selectPlayerValuationConfig } from "@game/content";
import {
  buildOccasionContext,
  createInitialMatchSimulationState,
  generateRoundRobinCalendar,
  selectCareerAiTeam,
  type MatchPlayerIncidentProfile,
  type MatchTeamContext,
} from "@game/engine";

import { careerStateFromNewWorld } from "../career/scenarios.ts";
import type { CliSaveId } from "../career/types.ts";

test("structural creator and shooter allocation reverse on real same-role task swaps", () => {
  const worldSeed = "phase81a-actor-allocation-reachability";
  const world = createFakeDomesticWorld({ worldSeed });
  const careerState = careerStateFromNewWorld(
    "save:phase81a-actor-allocation-reachability" as CliSaveId,
    world,
    worldSeed,
  );
  const competitionId = world.domesticCompetitionWorld.competitionIds[0];
  if (competitionId === undefined) throw new Error("Generated world has no first division");
  const competition = world.domesticCompetitionWorld.competitions[competitionId];
  if (competition === undefined) throw new Error(`Missing generated competition ${competitionId}`);
  const fixture = generateRoundRobinCalendar({
    seed: worldSeed,
    seasonId: world.seasonId,
    competitionId,
    clubIds: competition.clubIds,
    seasonStartDate: world.seasonStartDate,
  }).fixtures[0];
  if (fixture === undefined) throw new Error("Generated competition has no fixture");

  const select = (clubId: typeof fixture.homeClubId) => selectCareerAiTeam({
    careerState,
    clubId,
    fixture,
    policy: {
      roleWeights: world.roleWeights,
      tacticalDistribution: {
        directness: 0.5,
        pressing: 0.5,
        width: 0.5,
        risk: 0.5,
        mentality: "balanced",
      },
      stateMultiplierCurves: world.stateMultiplierCurves,
      benchSize: 9,
    },
    matchTacticsCalibration: world.matchTacticsCalibration,
    valuationConfig: selectPlayerValuationConfig(careerState.gameState.meta.calibrationVersions),
  }).teamContext;

  const home = select(fixture.homeClubId);
  const away = select(fixture.awayClubId);
  for (const actor of ["creator", "shooter"] as const) {
    const pair = widestSameRoleTaskPair(home, actor);
    assert.ok(pair.qualityGap > 0, `real generated same-role ${actor}s must differ in task quality`);

    const realCounts = actorCounts(home, away, pair, fixture.id, worldSeed, world, actor);
    const swappedCounts = actorCounts(
      swapTaskAttributes(home, pair.strong.playerId, pair.weak.playerId),
      away,
      pair,
      fixture.id,
      worldSeed,
      world,
      actor,
    );

    assert.ok(realCounts.strong > realCounts.weak, `${actor}:real:${JSON.stringify(realCounts)}`);
    assert.ok(realCounts.weak > 0, `${actor}: the weaker eligible player must remain reachable`);
    assert.ok(swappedCounts.strong < swappedCounts.weak, `${actor}:swapped:${JSON.stringify(swappedCounts)}`);
  }

  const equalized = equalizeShooterTaskAttributes(home);
  const equalizedSimulation = createInitialMatchSimulationState({
    fixtureId: fixture.id,
    seed: worldSeed,
    home: equalized,
    away,
    engineConfig: world.matchEngineConfig,
    matchTacticsCalibration: world.matchTacticsCalibration,
  });
  const shooterCounts = new Map<string, number>();
  for (let minute = 1; minute <= 10_000; minute += 1) {
    const occasion = buildOccasionContext({
      simulation: equalizedSimulation,
      attackingSide: "home",
      defendingSide: "away",
      minute,
      route: "central",
      routeQualityEdge: 0,
      scoreBeforeOccasion: { home: 0, away: 0 },
    });
    shooterCounts.set(occasion.shooterPlayerId, (shooterCounts.get(occasion.shooterPlayerId) ?? 0) + 1);
  }
  const observed = equalized.lineup
    .filter((slot) => slot.canonicalRole !== "goalkeeper")
    .map((slot) => ({
      count: shooterCounts.get(slot.playerId) ?? 0,
      propensity: world.matchTacticsCalibration.chanceActorSelection
        .shooterPropensityBasisPointsByRole[slot.canonicalRole],
    }));
  assert.equal(observed.length, 10);
  assert.equal(observed.every((row) => row.count > 0), true, "every real fielded outfielder must remain reachable");
  const lowest = [...observed].sort((left, right) => left.propensity - right.propensity)[0];
  const highest = [...observed].sort((left, right) => right.propensity - left.propensity)[0];
  if (lowest === undefined || highest === undefined) throw new Error("Generated eleven has no outfield roles");
  assert.ok(highest.propensity > lowest.propensity, "generated eleven must exercise distinct role propensities");
  assert.ok(highest.count > lowest.count, `${highest.count}/${lowest.count}`);
});

interface RealTaskPair {
  readonly strong: MatchPlayerIncidentProfile;
  readonly weak: MatchPlayerIncidentProfile;
  readonly qualityGap: number;
}

function widestSameRoleTaskPair(team: MatchTeamContext, actor: "creator" | "shooter"): RealTaskPair {
  let widest: RealTaskPair | undefined;
  for (let leftIndex = 0; leftIndex < team.lineup.length; leftIndex += 1) {
    const left = team.lineup[leftIndex];
    if (left === undefined || left.canonicalRole === "goalkeeper") continue;
    for (let rightIndex = leftIndex + 1; rightIndex < team.lineup.length; rightIndex += 1) {
      const right = team.lineup[rightIndex];
      if (right === undefined || right.canonicalRole !== left.canonicalRole) continue;
      const leftProfile = profileFor(team, left.playerId);
      const rightProfile = profileFor(team, right.playerId);
      const leftQuality = openPlayTaskQuality(leftProfile, actor);
      const rightQuality = openPlayTaskQuality(rightProfile, actor);
      const strong = leftQuality >= rightQuality ? leftProfile : rightProfile;
      const weak = leftQuality >= rightQuality ? rightProfile : leftProfile;
      const candidate = { strong, weak, qualityGap: Math.abs(leftQuality - rightQuality) };
      if (widest === undefined || candidate.qualityGap > widest.qualityGap) widest = candidate;
    }
  }
  if (widest === undefined) throw new Error("Real selected eleven has no repeated outfield role");
  return widest;
}

function actorCounts(
  home: MatchTeamContext,
  away: MatchTeamContext,
  pair: RealTaskPair,
  fixtureId: Parameters<typeof createInitialMatchSimulationState>[0]["fixtureId"],
  seed: string,
  world: ReturnType<typeof createFakeDomesticWorld>,
  actor: "creator" | "shooter",
): { readonly strong: number; readonly weak: number } {
  const simulation = createInitialMatchSimulationState({
    fixtureId,
    seed,
    home,
    away,
    engineConfig: world.matchEngineConfig,
    matchTacticsCalibration: world.matchTacticsCalibration,
  });
  let strong = 0;
  let weak = 0;
  for (let minute = 1; minute <= 10_000; minute += 1) {
    const occasion = buildOccasionContext({
      simulation,
      attackingSide: "home",
      defendingSide: "away",
      minute,
      route: "central",
      routeQualityEdge: 0,
      scoreBeforeOccasion: { home: 0, away: 0 },
    });
    const selectedPlayerId = actor === "creator" ? occasion.creatorPlayerId : occasion.shooterPlayerId;
    if (selectedPlayerId === pair.strong.playerId) strong += 1;
    if (selectedPlayerId === pair.weak.playerId) weak += 1;
  }
  return { strong, weak };
}

function swapTaskAttributes(
  team: MatchTeamContext,
  strongPlayerId: MatchPlayerIncidentProfile["playerId"],
  weakPlayerId: MatchPlayerIncidentProfile["playerId"],
): MatchTeamContext {
  const strong = profileFor(team, strongPlayerId);
  const weak = profileFor(team, weakPlayerId);
  return {
    ...team,
    incidentProfiles: team.incidentProfiles.map((profile) => {
      if (profile.playerId === strongPlayerId) return withTaskAttributes(profile, weak);
      if (profile.playerId === weakPlayerId) return withTaskAttributes(profile, strong);
      return profile;
    }),
  };
}

/** Holds shooter execution equal so the real role propensity is observed alone. */
function equalizeShooterTaskAttributes(team: MatchTeamContext): MatchTeamContext {
  return {
    ...team,
    incidentProfiles: team.incidentProfiles.map((profile) => ({
      ...profile,
      finishing: 10,
      composure: 10,
      technique: 10,
      anticipation: 10,
    })),
  };
}

function withTaskAttributes(
  target: MatchPlayerIncidentProfile,
  source: MatchPlayerIncidentProfile,
): MatchPlayerIncidentProfile {
  return {
    ...target,
    finishing: source.finishing,
    passing: source.passing,
    crossing: source.crossing,
    dribbling: source.dribbling,
    technique: source.technique,
    freeKicks: source.freeKicks,
    pace: source.pace,
    heading: source.heading,
    vision: source.vision,
    anticipation: source.anticipation,
    composure: source.composure,
    strength: source.strength,
    penalties: source.penalties,
  };
}

function openPlayTaskQuality(
  profile: MatchPlayerIncidentProfile,
  actor: "creator" | "shooter",
): number {
  return actor === "creator"
    ? (
      profile.passing * 3 + profile.vision * 3 + profile.technique * 2
      + profile.dribbling + profile.anticipation
    ) / 10
    : (
      profile.finishing * 3 + profile.composure * 2 + profile.technique
      + profile.anticipation
    ) / 7;
}

function profileFor(
  team: MatchTeamContext,
  playerId: MatchPlayerIncidentProfile["playerId"],
): MatchPlayerIncidentProfile {
  const profile = team.incidentProfiles.find((candidate) => candidate.playerId === playerId);
  if (profile === undefined) throw new Error(`Missing match profile for ${playerId}`);
  return profile;
}
