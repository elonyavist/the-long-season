import assert from "node:assert/strict";
import { test } from "vitest";

import {
  CAREER_STATE_SCHEMA_VERSION,
  clubId,
  createCareerState,
  gameDate,
  playerId,
  saveId,
  seasonId,
  type CareerState,
  type Club,
  type PlayerId,
} from "@game/domain";

import { selectCareerActivePlayerStock } from "./active-player-stock.ts";

test("selectCareerActivePlayerStock combines senior, academy, and free-agent facts in world order", () => {
  const state = careerStateFixture();

  assert.deepEqual(selectCareerActivePlayerStock(state), [
    {
      playerId: playerId("player:senior"),
      source: "senior",
      clubId: clubId("club:selected"),
    },
    {
      playerId: playerId("player:academy"),
      source: "academy",
      clubId: clubId("club:selected"),
    },
    {
      playerId: playerId("player:free"),
      source: "free_agent",
    },
    {
      playerId: playerId("player:promotion-candidate"),
      source: "promotion_candidate",
      clubId: clubId("club:selected"),
    },
  ]);
});

test("selectCareerActivePlayerStock reserves unresolved promotion candidates and excludes inactive history", () => {
  const state = careerStateFixture();
  const selected = selectCareerActivePlayerStock(state);
  const promotionCandidate = selected.find(
    ({ playerId: selectedPlayerId }) =>
      selectedPlayerId === playerId("player:promotion-candidate"),
  );

  assert.deepEqual(promotionCandidate, {
    playerId: playerId("player:promotion-candidate"),
    source: "promotion_candidate",
    clubId: clubId("club:selected"),
  });
  assert.equal(
    selected.some(({ playerId: selectedPlayerId }) =>
      selectedPlayerId === playerId("player:historical")
    ),
    false,
  );
});

test("selectCareerActivePlayerStock rejects ambiguous club associations", () => {
  const state = careerStateFixture();
  const seniorId = playerId("player:senior");
  const invalidState = {
    ...state,
    youthAcademyState: {
      ...state.youthAcademyState!,
      clubRosters: {
        ...state.youthAcademyState!.clubRosters,
        [clubId("club:selected")]: {
          clubId: clubId("club:selected"),
          playerIds: [
            ...state.youthAcademyState!.clubRosters[clubId("club:selected")]!
              .playerIds,
            seniorId,
          ],
        },
      },
    },
  };

  assert.throws(
    () => selectCareerActivePlayerStock(invalidState),
    /association is ambiguous: player:senior \(senior, academy\)/,
  );
});

function careerStateFixture(): CareerState {
  const selectedClubId = clubId("club:selected");
  const seniorId = playerId("player:senior");
  const academyId = playerId("player:academy");
  const freeAgentId = playerId("player:free");
  const promotionCandidateId = playerId("player:promotion-candidate");
  const historicalId = playerId("player:historical");
  const activePlayerIds = [
    seniorId,
    academyId,
    freeAgentId,
    promotionCandidateId,
  ];
  const allPlayerIds = [...activePlayerIds, historicalId];

  return createCareerState({
    saveId: saveId("save:active-player-stock"),
    schemaVersion: CAREER_STATE_SCHEMA_VERSION,
    selectedClubId,
    gameState: {
      meta: {
        seed: "active-player-stock",
        rngAlgorithmVersion: "test",
        saveSchemaVersion: 1,
      },
      calendar: {
        currentDate: gameDate(20_000),
        currentSeasonId: seasonId("season:2026"),
      },
      players: Object.fromEntries(
        allPlayerIds.map((id) => [id, { id }]),
      ) as CareerState["gameState"]["players"],
      playerIds: activePlayerIds,
      playerStates: {},
      clubs: {
        [selectedClubId]: clubFixture(selectedClubId, [seniorId]),
      },
      clubIds: [selectedClubId],
      fixtures: {},
      fixtureIds: [],
    },
    transferHistory: [],
    youthAcademyState: {
      clubRosters: {
        [selectedClubId]: {
          clubId: selectedClubId,
          playerIds: [academyId],
        },
      },
      clubRosterIds: [selectedClubId],
      playerLifecycle: {
        [academyId]: lifecycle(academyId, selectedClubId, "academy"),
        [promotionCandidateId]: lifecycle(
          promotionCandidateId,
          selectedClubId,
          "promotion_candidate",
        ),
      },
      playerLifecycleIds: [academyId, promotionCandidateId],
    },
  });
}

function lifecycle(
  targetPlayerId: PlayerId,
  targetClubId: Club["id"],
  status: "academy" | "promotion_candidate",
) {
  return {
    playerId: targetPlayerId,
    clubId: targetClubId,
    status,
    academyEntrySeasonId: seasonId("season:2026"),
    academyEntryDate: gameDate(19_500),
  } as const;
}

function clubFixture(
  id: Club["id"],
  playerIds: readonly PlayerId[],
): Club {
  return {
    id,
    name: "Selected Club",
    shortName: "Selected",
    category: "third_division",
    reputation: 5,
    playerIds,
  };
}
