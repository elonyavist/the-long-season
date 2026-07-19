import assert from "node:assert/strict";
import { test } from "vitest";

import {
  CAREER_STATE_SCHEMA_VERSION,
  abilityValue,
  clubId,
  createCareerState,
  createMarketState,
  gameDate,
  getPlayerRoleProfile,
  mapPlayerAbilities,
  nonNegativeMoney,
  playerId,
  saveId,
  seasonId,
  stateValue,
  rawDiagnosticAbilityAverage,
  roleCurrentAbility,
  type CareerState,
  type Club,
  type Player,
  type PlayerAbilities,
  type PlayerDynamicState,
  type PlayerId,
  type PlayerPosition,
  type PlayerRole,
} from "@game/domain";

import { promoteYouthCandidatesToSeniorSquads } from "./youth-promotion.ts";

/** Tests for explicit youth-to-senior promotion rules. */

test("promoteYouthCandidatesToSeniorSquads promotes AI club candidates when there is room", () => {
  const candidate = playerId("player:ai-candidate");
  const careerState = careerStateFixture({
    selectedClubId: "club:pro01",
    candidateClubId: "club:pro02",
    candidate,
  });
  const result = promoteYouthCandidatesToSeniorSquads({ careerState });

  assert.equal(result.records[0]?.promoted, true);
  assert.equal(result.records[0]?.reason, "promoted");
  assert.equal(result.careerState.gameState.clubs[clubId("club:pro02")]?.playerIds.includes(candidate), true);
  assert.equal(result.careerState.youthAcademyState?.playerLifecycle[candidate], undefined);
});

test("promoteYouthCandidatesToSeniorSquads protects the selected club by default", () => {
  const candidate = playerId("player:selected-candidate");
  const careerState = careerStateFixture({
    selectedClubId: "club:pro01",
    candidateClubId: "club:pro01",
    candidate,
  });
  const result = promoteYouthCandidatesToSeniorSquads({ careerState });

  assert.equal(result.records[0]?.promoted, false);
  assert.equal(result.records[0]?.reason, "selected_club_protected");
  assert.equal(result.careerState.gameState.clubs[clubId("club:pro01")]?.playerIds.includes(candidate), false);
  assert.equal(result.careerState.youthAcademyState?.playerLifecycle[candidate]?.status, "promotion_candidate");
});

test("promoteYouthCandidatesToSeniorSquads can explicitly promote selected-club candidates for lab automation", () => {
  const candidate = playerId("player:selected-lab-candidate");
  const careerState = careerStateFixture({
    selectedClubId: "club:pro01",
    candidateClubId: "club:pro01",
    candidate,
  });
  const result = promoteYouthCandidatesToSeniorSquads({
    careerState,
    allowSelectedClubPromotion: true,
  });

  assert.equal(result.records[0]?.promoted, true);
  assert.equal(result.careerState.gameState.clubs[clubId("club:pro01")]?.playerIds.includes(candidate), true);
});

test("promoteYouthCandidatesToSeniorSquads skips full senior squads", () => {
  const candidate = playerId("player:full-candidate");
  const careerState = careerStateFixture({
    selectedClubId: "club:pro01",
    candidateClubId: "club:pro02",
    candidate,
    seniorCount: 25,
  });
  const result = promoteYouthCandidatesToSeniorSquads({ careerState });

  assert.equal(result.records[0]?.promoted, false);
  assert.equal(result.records[0]?.reason, "senior_squad_full");
});

test("promoteYouthCandidatesToSeniorSquads promotes a goalkeeper specialist by role quality", () => {
  const candidate = playerId("player:goalkeeper-specialist");
  const abilities = roleShapedAbilities("goalkeeper", 14, 1);
  const careerState = careerStateFixture({
    selectedClubId: "club:pro01",
    candidateClubId: "club:pro02",
    candidate,
    candidateAbilities: abilities,
    candidatePotential: abilities,
    candidatePosition: "gk",
    candidateRole: "goalkeeper",
  });

  assert.equal(Number(rawDiagnosticAbilityAverage(abilities)) < 7.4, true);
  assert.equal(Number(roleCurrentAbility(abilities, getPlayerRoleProfile("goalkeeper"))) >= 7.4, true);

  const result = promoteYouthCandidatesToSeniorSquads({ careerState });

  assert.equal(result.records[0]?.reason, "promoted");
});

test("promoteYouthCandidatesToSeniorSquads ignores inflated attributes outside the primary role", () => {
  const candidate = playerId("player:irrelevant-attributes");
  const abilities = roleCoreSuppressedAbilities("central_midfielder", 10, 1);
  const careerState = careerStateFixture({
    selectedClubId: "club:pro01",
    candidateClubId: "club:pro02",
    candidate,
    candidateAbilities: abilities,
    candidatePotential: abilities,
  });

  assert.equal(Number(rawDiagnosticAbilityAverage(abilities)) >= 7.4, true);
  assert.equal(Number(roleCurrentAbility(abilities, getPlayerRoleProfile("central_midfielder"))) < 7.4, true);

  const result = promoteYouthCandidatesToSeniorSquads({ careerState });

  assert.equal(result.records[0]?.reason, "not_useful_enough");
});

test("promoteYouthCandidatesToSeniorSquads recognizes role-specific potential room", () => {
  const candidate = playerId("player:role-potential-room");
  const current = roleShapedAbilities("central_midfielder", 4, 1);
  const potential = roleShapedAbilities("central_midfielder", 10, 1);
  const careerState = careerStateFixture({
    selectedClubId: "club:pro01",
    candidateClubId: "club:pro02",
    candidate,
    candidateAbilities: current,
    candidatePotential: potential,
  });

  assert.equal(Number(rawDiagnosticAbilityAverage(potential)) - Number(rawDiagnosticAbilityAverage(current)) < 3.5, true);

  const result = promoteYouthCandidatesToSeniorSquads({ careerState });

  assert.equal(result.records[0]?.reason, "promoted");
});

function careerStateFixture(input: {
  readonly selectedClubId: string;
  readonly candidateClubId: string;
  readonly candidate: PlayerId;
  readonly seniorCount?: number;
  readonly candidateAbilities?: PlayerAbilities;
  readonly candidatePotential?: PlayerAbilities;
  readonly candidatePosition?: PlayerPosition;
  readonly candidateRole?: PlayerRole;
}): CareerState {
  const pro01 = clubId("club:pro01");
  const pro02 = clubId("club:pro02");
  const selectedClubId = clubId(input.selectedClubId);
  const candidateClubId = clubId(input.candidateClubId);
  const seniorCount = input.seniorCount ?? 22;
  const clubs: Record<Club["id"], Club> = {
    [pro01]: clubFixture(pro01, seniorPlayers("pro01", pro01 === candidateClubId ? seniorCount : 22)),
    [pro02]: clubFixture(pro02, seniorPlayers("pro02", pro02 === candidateClubId ? seniorCount : 22)),
  };
  const players: Record<PlayerId, Player> = {
    [input.candidate]: playerFixture(
      input.candidate,
      input.candidateAbilities ?? abilitySet(8),
      input.candidatePotential ?? abilitySet(13),
      input.candidatePosition ?? "cm",
      input.candidateRole ?? "central_midfielder",
    ),
  };
  const playerStates: Record<PlayerId, PlayerDynamicState> = {
    [input.candidate]: playerStateFixture(),
  };
  const playerIds: PlayerId[] = [input.candidate];

  for (const clubIdValue of [pro01, pro02]) {
    for (const seniorId of clubs[clubIdValue]?.playerIds ?? []) {
      players[seniorId] = playerFixture(
        seniorId,
        abilitySet(8),
        abilitySet(10),
        "cm",
        "central_midfielder",
      );
      playerStates[seniorId] = playerStateFixture();
      playerIds.push(seniorId);
    }
  }

  return createCareerState({
    saveId: saveId("save:youth-promotion"),
    schemaVersion: CAREER_STATE_SCHEMA_VERSION,
    selectedClubId,
    gameState: {
      meta: {
        seed: "youth-promotion",
        rngAlgorithmVersion: "test",
        saveSchemaVersion: 1,
      },
      calendar: {
        currentDate: gameDate(20_000),
        currentSeasonId: seasonId("season:0001"),
      },
      players,
      playerIds,
      playerStates,
      clubs,
      clubIds: [pro01, pro02],
      fixtures: {},
      fixtureIds: [],
    },
    marketState: createMarketState({
      clubBudgets: {
        [pro01]: { clubId: pro01, transferBudget: nonNegativeMoney(1_000_000_00) },
        [pro02]: { clubId: pro02, transferBudget: nonNegativeMoney(1_000_000_00) },
      },
      clubBudgetIds: [pro01, pro02],
    }),
    transferHistory: [],
    youthAcademyState: {
      clubRosters: {
        [pro01]: { clubId: pro01, playerIds: [] },
        [pro02]: { clubId: pro02, playerIds: [] },
      },
      clubRosterIds: [pro01, pro02],
      playerLifecycle: {
        [input.candidate]: {
          playerId: input.candidate,
          clubId: candidateClubId,
          status: "promotion_candidate",
          academyEntrySeasonId: seasonId("season:0001"),
          academyEntryDate: gameDate(19_000),
        },
      },
      playerLifecycleIds: [input.candidate],
    },
  });
}

function clubFixture(id: Club["id"], playerIds: readonly PlayerId[]): Club {
  return {
    id,
    name: String(id),
    shortName: String(id),
    category: "third_division",
    reputation: 5,
    playerIds,
  };
}

function seniorPlayers(prefix: string, count: number): readonly PlayerId[] {
  const playerIds: PlayerId[] = [];

  for (let index = 1; index <= count; index += 1) {
    playerIds.push(playerId(`player:${prefix}-senior-${String(index).padStart(2, "0")}`));
  }

  return playerIds;
}

function playerFixture(
  id: PlayerId,
  abilities: PlayerAbilities,
  potential: PlayerAbilities,
  position: PlayerPosition,
  primaryRole: PlayerRole,
): Player {
  return {
    id,
    firstName: "Player",
    lastName: String(id),
    birthDate: gameDate(14_000),
    naturalPositions: [position],
    primaryRole,
    abilities,
    potential,
  };
}

function roleShapedAbilities(role: PlayerRole, relevantValue: number, baselineValue: number): PlayerAbilities {
  const profile = getPlayerRoleProfile(role);
  const relevantKeys = new Set([...profile.coreForRole, ...profile.secondaryForRole]);

  return mapPlayerAbilities(abilitySet(baselineValue), (value, key) =>
    relevantKeys.has(key) ? abilityValue(relevantValue) : value,
  );
}

function roleCoreSuppressedAbilities(role: PlayerRole, baselineValue: number, coreValue: number): PlayerAbilities {
  const coreKeys = new Set(getPlayerRoleProfile(role).coreForRole);

  return mapPlayerAbilities(abilitySet(baselineValue), (value, key) =>
    coreKeys.has(key) ? abilityValue(coreValue) : value,
  );
}

function playerStateFixture(): PlayerDynamicState {
  return {
    fitness: stateValue(100),
    form: stateValue(50),
    morale: stateValue(50),
  };
}

function abilitySet(value: number): PlayerAbilities {
  const ability = value as PlayerAbilities["technical"]["finishing"];

  return {
    technical: {
      finishing: ability,
      passing: ability,
      longPassing: ability,
      crossing: ability,
      dribbling: ability,
      technique: ability,
      tackling: ability,
      penalties: ability,
      freeKicks: ability,
    },
    physical: {
      pace: ability,
      strength: ability,
      stamina: ability,
      agility: ability,
      heading: ability,
    },
    mental: {
      positioning: ability,
      vision: ability,
      anticipation: ability,
      composure: ability,
      determination: ability,
      leadership: ability,
    },
    goalkeeping: {
      reflexes: ability,
      handling: ability,
      rushingOut: ability,
      goalkeeperPositioning: ability,
      footwork: ability,
    },
  };
}
