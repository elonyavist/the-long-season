import assert from "node:assert/strict";
import { test } from "vitest";

import {
  CAREER_STATE_SCHEMA_VERSION,
  clubId,
  createCareerState,
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
  type PlayerRole,
  type RoleIdentifiedPlayer,
} from "@game/domain";

import {
  applySeasonalYouthIntake,
  YOUTH_ACADEMY_TARGET_MAX_SIZE,
  YouthIntakeError,
  type YouthIntakeCandidate,
} from "./youth-intake.ts";

/** Tests for applying annual youth intake to career academy state. */

test("applySeasonalYouthIntake adds candidates to youth rosters but not senior rosters", () => {
  const careerState = careerStateFixture({ initialYouthCount: 8 });
  const candidates = candidateBatch("club:pro01", 3);
  const result = applySeasonalYouthIntake({
    careerState,
    seasonId: seasonId("season:0002"),
    intakeDate: gameDate(20_365),
    candidates,
  });
  const selectedClub = result.careerState.gameState.clubs[clubId("club:pro01")];

  assert.equal(selectedClub?.playerIds.length, 1);
  assert.equal(result.careerState.youthAcademyState?.clubRosters[clubId("club:pro01")]?.playerIds.length, 11);
  assert.equal(result.records[0]?.acceptedPlayerIds.length, 3);
  assert.equal(result.records[0]?.skippedPlayerIds.length, 0);
});

test("applySeasonalYouthIntake caps active academy size", () => {
  const careerState = careerStateFixture({ initialYouthCount: YOUTH_ACADEMY_TARGET_MAX_SIZE - 1 });
  const result = applySeasonalYouthIntake({
    careerState,
    seasonId: seasonId("season:0002"),
    intakeDate: gameDate(20_365),
    candidates: candidateBatch("club:pro01", 4),
  });

  assert.equal(result.careerState.youthAcademyState?.clubRosters[clubId("club:pro01")]?.playerIds.length, 11);
  assert.equal(result.records[0]?.acceptedPlayerIds.length, 1);
  assert.equal(result.records[0]?.skippedPlayerIds.length, 3);
});

test("applySeasonalYouthIntake initializes youth state for an old career save when candidates fill the target", () => {
  const careerState = careerStateFixture({ initialYouthCount: 0, includeYouthState: false });
  const result = applySeasonalYouthIntake({
    careerState,
    seasonId: seasonId("season:0002"),
    intakeDate: gameDate(20_365),
    candidates: candidateBatch("club:pro01", YOUTH_ACADEMY_TARGET_MAX_SIZE),
  });

  assert.equal(result.careerState.youthAcademyState?.clubRosterIds.length, 1);
  assert.equal(result.careerState.youthAcademyState?.clubRosters[clubId("club:pro01")]?.playerIds.length, 11);
});

test("applySeasonalYouthIntake rejects unsafe candidate pools", () => {
  assertYouthIntakeError(
    () =>
      applySeasonalYouthIntake({
        careerState: careerStateFixture({ initialYouthCount: 0 }),
        seasonId: seasonId("season:0002"),
        intakeDate: gameDate(20_365),
        candidates: [
          {
            targetClubId: clubId("club:missing"),
            player: playerFixture(playerId("player:intake-missing")),
            playerState: playerStateFixture(),
          },
        ],
      }),
    "candidate_target_club_not_found",
  );

  const duplicateCandidate = candidateFixture("club:pro01", "player:intake-duplicate");
  assertYouthIntakeError(
    () =>
      applySeasonalYouthIntake({
        careerState: careerStateFixture({ initialYouthCount: 0 }),
        seasonId: seasonId("season:0002"),
        intakeDate: gameDate(20_365),
        candidates: [duplicateCandidate, duplicateCandidate],
      }),
    "duplicate_candidate_player",
  );

  assertYouthIntakeError(
    () =>
      applySeasonalYouthIntake({
        careerState: careerStateFixture({ initialYouthCount: 0 }),
        seasonId: seasonId("season:0002"),
        intakeDate: gameDate(20_365),
        candidates: candidateBatch("club:pro01", 2),
      }),
    "academy_underfilled_after_refill",
  );
});

function careerStateFixture(options: {
  readonly initialYouthCount: number;
  readonly includeYouthState?: boolean;
}): CareerState {
  const pro01 = clubId("club:pro01");
  const seniorPlayer = playerId("player:senior-01");
  const youthPlayers = candidateBatch("club:pro01", options.initialYouthCount, "player:existing-youth");
  const players: Record<PlayerId, Player> = {
    [seniorPlayer]: playerFixture(seniorPlayer),
  };
  const playerStates: Record<PlayerId, PlayerDynamicState> = {
    [seniorPlayer]: playerStateFixture(),
  };
  const playerIds: PlayerId[] = [seniorPlayer];

  for (const candidate of youthPlayers) {
    players[candidate.player.id] = candidate.player;
    playerStates[candidate.player.id] = candidate.playerState;
    playerIds.push(candidate.player.id);
  }

  return createCareerState({
    saveId: saveId("save:youth-intake"),
    schemaVersion: CAREER_STATE_SCHEMA_VERSION,
    selectedClubId: pro01,
    gameState: {
      meta: {
        seed: "youth-intake",
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
      clubs: {
        [pro01]: {
          id: pro01,
          name: "PRO01",
          shortName: "PRO01",
          category: "third_division",
          reputation: 5,
          playerIds: [seniorPlayer],
        },
      },
      clubIds: [pro01],
      fixtures: {},
      fixtureIds: [],
    },
    transferHistory: [],
    ...(options.includeYouthState === false
      ? {}
      : {
          youthAcademyState: {
            clubRosters: {
              [pro01]: {
                clubId: pro01,
                playerIds: youthPlayers.map((candidate) => candidate.player.id),
              },
            },
            clubRosterIds: [pro01],
            playerLifecycle: youthPlayers.reduce<Record<PlayerId, NonNullable<CareerState["youthAcademyState"]>["playerLifecycle"][PlayerId]>>(
              (accumulator, candidate) => {
                accumulator[candidate.player.id] = {
                  playerId: candidate.player.id,
                  clubId: pro01,
                  status: "academy",
                  academyEntrySeasonId: seasonId("season:0001"),
                  academyEntryDate: gameDate(20_000),
                };
                return accumulator;
              },
              {},
            ),
            playerLifecycleIds: youthPlayers.map((candidate) => candidate.player.id),
          },
        }),
  });
}

function candidateBatch(
  targetClubId: string,
  count: number,
  prefix = "player:intake",
): readonly YouthIntakeCandidate[] {
  const candidates: YouthIntakeCandidate[] = [];

  for (let index = 1; index <= count; index += 1) {
    candidates.push(candidateFixture(targetClubId, `${prefix}-${String(index).padStart(2, "0")}`));
  }

  return candidates;
}

function candidateFixture(targetClubId: string, playerIdValue: string): YouthIntakeCandidate {
  const id = playerId(playerIdValue);
  return {
    targetClubId: clubId(targetClubId),
    player: playerFixture(id),
    playerState: playerStateFixture(),
  };
}

function playerFixture(id: PlayerId): RoleIdentifiedPlayer {
  const primaryRole: PlayerRole = "central_midfielder";

  return {
    id,
    firstName: "Youth",
    lastName: String(id),
    birthDate: gameDate(14_000),
    naturalPositions: ["cm"],
    primaryRole,
    archetype: "central_midfielder_playmaker",
    naturalRoles: [primaryRole],
    adaptedRoles: [],
    weakRoles: [],
    roleFamiliarity: { [primaryRole]: "natural" },
    abilities: abilitySet(7),
    potential: abilitySet(11),
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

function assertYouthIntakeError(action: () => void, code: YouthIntakeError["code"]): void {
  assert.throws(
    action,
    (error) => error instanceof YouthIntakeError && error.code === code,
  );
}
