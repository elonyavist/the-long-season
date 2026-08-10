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

test("task-quality allocation is reachable on real generated same-role players", () => {
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
  const pair = widestSameRoleTaskPair(home);
  assert.ok(pair.qualityGap > 0, "real generated same-role players must differ in task quality");

  const realCounts = actorCounts(home, away, pair, fixture.id, worldSeed, world);
  const swappedCounts = actorCounts(
    swapTaskAttributes(home, pair.strong.playerId, pair.weak.playerId),
    away,
    pair,
    fixture.id,
    worldSeed,
    world,
  );

  assert.ok(realCounts.strong > realCounts.weak, JSON.stringify(realCounts));
  assert.ok(swappedCounts.strong < swappedCounts.weak, JSON.stringify(swappedCounts));
});

interface RealTaskPair {
  readonly strong: MatchPlayerIncidentProfile;
  readonly weak: MatchPlayerIncidentProfile;
  readonly qualityGap: number;
}

function widestSameRoleTaskPair(team: MatchTeamContext): RealTaskPair {
  let widest: RealTaskPair | undefined;
  for (let leftIndex = 0; leftIndex < team.lineup.length; leftIndex += 1) {
    const left = team.lineup[leftIndex];
    if (left === undefined || left.canonicalRole === "goalkeeper") continue;
    for (let rightIndex = leftIndex + 1; rightIndex < team.lineup.length; rightIndex += 1) {
      const right = team.lineup[rightIndex];
      if (right === undefined || right.canonicalRole !== left.canonicalRole) continue;
      const leftProfile = profileFor(team, left.playerId);
      const rightProfile = profileFor(team, right.playerId);
      const leftQuality = openPlayTaskQuality(leftProfile);
      const rightQuality = openPlayTaskQuality(rightProfile);
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
    for (const playerId of [occasion.creatorPlayerId, occasion.shooterPlayerId]) {
      if (playerId === pair.strong.playerId) strong += 1;
      if (playerId === pair.weak.playerId) weak += 1;
    }
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

function openPlayTaskQuality(profile: MatchPlayerIncidentProfile): number {
  const creator = (
    profile.passing * 3 + profile.vision * 3 + profile.technique * 2
    + profile.dribbling + profile.anticipation
  ) / 10;
  const shooter = (
    profile.finishing * 3 + profile.composure * 2 + profile.technique
    + profile.anticipation
  ) / 7;
  return creator + shooter;
}

function profileFor(
  team: MatchTeamContext,
  playerId: MatchPlayerIncidentProfile["playerId"],
): MatchPlayerIncidentProfile {
  const profile = team.incidentProfiles.find((candidate) => candidate.playerId === playerId);
  if (profile === undefined) throw new Error(`Missing match profile for ${playerId}`);
  return profile;
}
