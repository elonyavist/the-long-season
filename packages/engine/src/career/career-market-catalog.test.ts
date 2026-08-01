import assert from "node:assert/strict";
import { test } from "vitest";

import {
  CAREER_STATE_SCHEMA_VERSION,
  clubId,
  competitionId,
  createCareerState,
  gameDate,
  playerContractId,
  playerId,
  seasonId,
  seniorSquadRegistrationId,
  type CareerState,
} from "@game/domain";

import { buildCareerMarketCatalog } from "./career-market-catalog.ts";

test("buildCareerMarketCatalog selects every persisted external senior and free agent once", () => {
  const careerState = catalogCareerFixture();
  const catalog = buildCareerMarketCatalog(careerState);

  assert.deepEqual(catalog.targets.map((target) => target.playerId), [
    playerId("player:first"),
    playerId("player:second"),
    playerId("player:third"),
    playerId("player:free"),
  ]);
  assert.deepEqual(catalog.targets.map((target) => target.employment.sourceTier), [
    "first_division",
    "second_division",
    "third_division",
    "free_agent",
  ]);
  assert.equal(new Set(catalog.targets.map((target) => target.playerId)).size, 4);
  assert.equal(catalog.targets.some((target) => target.playerId === playerId("player:selected")), false);
  assert.equal(catalog.targets.some((target) => target.playerId === playerId("player:youth")), false);
  for (const target of catalog.targets) {
    assert.ok(careerState.gameState.players[target.playerId] !== undefined);
  }
});

test("buildCareerMarketCatalog rejects missing canonical topology or active contracts", () => {
  const careerState = catalogCareerFixture();
  const {
    domesticCompetitionWorld: _omittedTopology,
    ...gameStateWithoutTopology
  } = careerState.gameState;

  assert.throws(
    () => buildCareerMarketCatalog({
      ...careerState,
      gameState: gameStateWithoutTopology,
    }),
    /three-division Market topology is missing/,
  );
  assert.throws(
    () => buildCareerMarketCatalog({
      ...careerState,
      seniorSquadState: {
        ...careerState.seniorSquadState!,
        activeContractIds: careerState.seniorSquadState!.activeContractIds.filter(
          (id) => id !== playerContractId("contract:first"),
        ),
      },
    }),
    /Contracted Market target is incomplete: player:first/,
  );
});

/** Builds the smallest three-tier state needed to test population ownership. */
function catalogCareerFixture(): CareerState {
  const selectedClubId = clubId("club:selected");
  const firstClubId = clubId("club:first");
  const secondClubId = clubId("club:second");
  const thirdClubId = clubId("club:third");
  const selectedPlayerId = playerId("player:selected");
  const firstPlayerId = playerId("player:first");
  const secondPlayerId = playerId("player:second");
  const thirdPlayerId = playerId("player:third");
  const freePlayerId = playerId("player:free");
  const youthPlayerId = playerId("player:youth");
  const playerIds = [
    selectedPlayerId,
    firstPlayerId,
    secondPlayerId,
    thirdPlayerId,
    freePlayerId,
    youthPlayerId,
  ];
  const contractRows = [
    [selectedPlayerId, selectedClubId, "selected"],
    [firstPlayerId, firstClubId, "first"],
    [secondPlayerId, secondClubId, "second"],
    [thirdPlayerId, thirdClubId, "third"],
  ] as const;
  const contractIds = contractRows.map(([, , suffix]) =>
    playerContractId(`contract:${suffix}`)
  );
  const registrationRows = contractRows.map(([targetPlayerId, targetClubId, suffix], index) => {
    const id = seniorSquadRegistrationId(`registration:${suffix}`);
    return [id, targetPlayerId, targetClubId, index + 1] as const;
  });

  return createCareerState({
    saveId: "save:catalog" as CareerState["saveId"],
    schemaVersion: CAREER_STATE_SCHEMA_VERSION,
    selectedClubId,
    gameState: {
      meta: { seed: "catalog", rngAlgorithmVersion: "test", saveSchemaVersion: 1 },
      calendar: {
        currentDate: gameDate(20_000),
        currentSeasonId: "season:2026" as CareerState["gameState"]["calendar"]["currentSeasonId"],
      },
      players: Object.fromEntries(playerIds.map((id) => [id, { id }])) as
        CareerState["gameState"]["players"],
      playerIds,
      playerStates: {},
      clubs: {
        [selectedClubId]: club(selectedClubId, "third_division", [selectedPlayerId]),
        [firstClubId]: club(firstClubId, "first_division", [firstPlayerId]),
        [secondClubId]: club(secondClubId, "second_division", [secondPlayerId]),
        [thirdClubId]: club(thirdClubId, "third_division", [thirdPlayerId]),
      },
      clubIds: [selectedClubId, firstClubId, secondClubId, thirdClubId],
      fixtures: {},
      fixtureIds: [],
      domesticCompetitionWorld: {
        competitionIds: [
          competitionId("competition:first"),
          competitionId("competition:second"),
          competitionId("competition:third"),
        ],
        competitions: {
          [competitionId("competition:first")]: competition(
            competitionId("competition:first"),
            "First Division",
            [firstClubId],
          ),
          [competitionId("competition:second")]: competition(
            competitionId("competition:second"),
            "Second Division",
            [secondClubId],
          ),
          [competitionId("competition:third")]: competition(
            competitionId("competition:third"),
            "Third Division",
            [selectedClubId, thirdClubId],
          ),
        },
        seasonHistory: [],
      },
    },
    transferHistory: [],
    seniorSquadState: {
      registrations: Object.fromEntries(registrationRows.map(([id, targetPlayerId, targetClubId, shirtNumber]) => [
        id,
        {
          id,
          playerId: targetPlayerId,
          clubId: targetClubId,
          shirtNumber,
          registeredOn: gameDate(19_000),
        },
      ])) as NonNullable<CareerState["seniorSquadState"]>["registrations"],
      registrationIds: registrationRows.map(([id]) => id),
      contracts: Object.fromEntries(contractRows.map(([targetPlayerId, targetClubId, suffix]) => [
        playerContractId(`contract:${suffix}`),
        {
          id: playerContractId(`contract:${suffix}`),
          playerId: targetPlayerId,
          clubId: targetClubId,
          type: "professional",
          startsOn: gameDate(19_000),
          endsOn: gameDate(21_000),
          annualWage: 100_000_00,
          squadStatus: "squad_player",
          bonuses: { signingBonus: 0, appearanceBonus: 0 },
        },
      ])) as NonNullable<CareerState["seniorSquadState"]>["contracts"],
      contractIds,
      activeContractIds: contractIds,
      contractHistory: {},
      contractHistoryEntryIds: [],
    },
    youthAcademyState: {
      clubRosters: {
        [selectedClubId]: {
          clubId: selectedClubId,
          playerIds: [youthPlayerId],
        },
      },
      clubRosterIds: [selectedClubId],
      playerLifecycle: {
        [youthPlayerId]: {
          playerId: youthPlayerId,
          clubId: selectedClubId,
          status: "academy",
          academyEntrySeasonId: seasonId("season:2026"),
          academyEntryDate: gameDate(19_500),
        },
      },
      playerLifecycleIds: [youthPlayerId],
    },
  });
}

function club(
  id: ReturnType<typeof clubId>,
  category: CareerState["gameState"]["clubs"][ReturnType<typeof clubId>]["category"],
  playerIds: readonly ReturnType<typeof playerId>[],
) {
  return {
    id,
    name: String(id),
    shortName: String(id),
    category,
    reputation: 5,
    playerIds,
  };
}

function competition(
  id: ReturnType<typeof competitionId>,
  name: string,
  clubIds: readonly ReturnType<typeof clubId>[],
) {
  return {
    id,
    name,
    clubIds,
    matchRules: {
      maximumSubstitutions: 5,
      substitutionWindowLimit: null,
      allowsPlayerReentry: false,
      yellowCardAccumulationThreshold: 5,
      straightRedSuspensionMatches: 3,
      secondYellowSuspensionMatches: 1,
      yellowAccumulationSuspensionMatches: 1,
    },
  };
}
