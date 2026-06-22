import assert from "node:assert/strict";
import { test } from "vitest";

import {
  CAREER_STATE_SCHEMA_VERSION,
  clubId,
  createCareerState,
  createMarketState,
  gameDate,
  nonNegativeMoney,
  playerId,
  saveId,
  seasonId,
  stateValue,
  type CareerState,
  type Club,
  type Player,
  type PlayerAbilities,
  type PlayerDynamicState,
  type PlayerId,
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

function careerStateFixture(input: {
  readonly selectedClubId: string;
  readonly candidateClubId: string;
  readonly candidate: PlayerId;
  readonly seniorCount?: number;
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
    [input.candidate]: playerFixture(input.candidate, abilitySet(8), abilitySet(13)),
  };
  const playerStates: Record<PlayerId, PlayerDynamicState> = {
    [input.candidate]: playerStateFixture(),
  };
  const playerIds: PlayerId[] = [input.candidate];

  for (const clubIdValue of [pro01, pro02]) {
    for (const seniorId of clubs[clubIdValue]?.playerIds ?? []) {
      players[seniorId] = playerFixture(seniorId, abilitySet(8), abilitySet(10));
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

function playerFixture(id: PlayerId, abilities: PlayerAbilities, potential: PlayerAbilities): Player {
  return {
    id,
    firstName: "Player",
    lastName: String(id),
    birthDate: gameDate(14_000),
    naturalPositions: ["cm"],
    abilities,
    potential,
  };
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
