import assert from "node:assert/strict";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "vitest";

import {
  CAREER_STATE_SCHEMA_VERSION,
  accruePlayerFixtureParticipation,
  careerInboxMessageId,
  closePlayerParticipationMonth,
  clubId,
  competitionId,
  createCareerState,
  createCareerInboxMessage,
  contractNegotiationId,
  createEmptyPlayerParticipationLedger,
  fixtureId,
  gameDate,
  nonNegativeMoney,
  playerId,
  saveId,
  seasonId,
  type CareerState,
  type GameState,
  type Player,
  type PlayerAbilities,
  type PlayerDynamicState,
  type YouthAcademyState,
} from "@game/domain";

import { JsonCareerStorage } from "./json-career-storage.ts";
import { StorageError } from "./game-storage.interface.ts";
import { withPersistableCareerFacts } from "./testing/persistable-career-fixture.ts";

/**
 * JSON career storage tests protect durable career-state round trips.
 */

test("save then load returns the same CareerState snapshot", async () => {
  const directoryPath = await createTempSaveDirectory();
  const storage = new JsonCareerStorage({
    directoryPath,
    nowISO: fixedClock("2026-06-21T10:00:00.000Z"),
  });
  const state = minimalCareerState();

  try {
    const metadata = await storage.saveCareer({
      saveId: saveId("save:career-demo"),
      name: "Career Demo",
      state,
    });
    const loaded = await storage.loadCareer(saveId("save:career-demo"));

    assert.deepEqual(loaded, state);
    assert.equal(metadata.saveId, "save:career-demo");
    assert.equal(metadata.name, "Career Demo");
    assert.equal(metadata.createdAtISO, "2026-06-21T10:00:00.000Z");
    assert.equal(metadata.updatedAtISO, "2026-06-21T10:00:00.000Z");
    assert.equal(metadata.autosaveIntervalDays, 7);
  } finally {
    await removeTempSaveDirectory(directoryPath);
  }
});

test("career saves are listed in deterministic save-ID order", async () => {
  const directoryPath = await createTempSaveDirectory();
  const storage = new JsonCareerStorage({
    directoryPath,
    nowISO: fixedClock("2026-06-21T10:00:00.000Z"),
  });

  try {
    for (const [id, name] of [["save:zeta", "Zeta"], ["save:alpha", "Alpha"]] as const) {
      await storage.saveCareer({
        saveId: saveId(id),
        name,
        state: createCareerState({ ...minimalCareerState(), saveId: saveId(id) }),
      });
    }

    await writeFile(join(directoryPath, "ignore.json"), "{}", "utf8");

    const careers = await storage.listCareers();

    assert.deepEqual(careers.map((career) => career.saveId), ["save:alpha", "save:zeta"]);
    assert.deepEqual(careers.map((career) => career.name), ["Alpha", "Zeta"]);
  } finally {
    await removeTempSaveDirectory(directoryPath);
  }
});

test("saving a career does not mutate the input object", async () => {
  const directoryPath = await createTempSaveDirectory();
  const storage = new JsonCareerStorage({
    directoryPath,
    nowISO: fixedClock("2026-06-21T10:00:00.000Z"),
  });
  const state = minimalCareerState();
  const beforeSave = JSON.stringify(state);

  try {
    await storage.saveCareer({
      saveId: saveId("save:career-demo"),
      name: "Career Demo",
      state,
    });

    assert.equal(JSON.stringify(state), beforeSave);
  } finally {
    await removeTempSaveDirectory(directoryPath);
  }
});

test("save then load preserves career match preparation", async () => {
  const directoryPath = await createTempSaveDirectory();
  const storage = new JsonCareerStorage({
    directoryPath,
    nowISO: fixedClock("2026-06-21T10:00:00.000Z"),
  });
  const pro01 = "club:pro01" as CareerState["selectedClubId"];
  const player01 = playerId("player:pro01-01");
  const state = createCareerState({
    ...minimalCareerState(),
    matchPreparation: {
      selectedClubId: pro01,
      selectedLineup: {
        clubId: pro01,
        slots: [
          { slotKey: "gk", playerId: player01, roleKey: "gk" },
        ],
      },
      tactic: {
        mentality: "balanced",
        pressing: 0.5,
        directness: 0.5,
        width: 0.5,
        risk: 0.5,
      },
      updatedAt: gameDate(20_000),
    },
  });

  try {
    await storage.saveCareer({
      saveId: saveId("save:career-prep"),
      name: "Career Prep",
      state,
    });

    const loaded = await storage.loadCareer(saveId("save:career-prep"));

    assert.deepEqual(loaded.matchPreparation, state.matchPreparation);
  } finally {
    await removeTempSaveDirectory(directoryPath);
  }
});

test("save then load preserves compact season history and ordered player statistics", async () => {
  const directoryPath = await createTempSaveDirectory();
  const storage = new JsonCareerStorage({
    directoryPath,
    nowISO: fixedClock("2026-06-21T10:00:00.000Z"),
  });
  const pro01 = "club:pro01" as CareerState["selectedClubId"];
  const state = createCareerState({
    ...minimalCareerState(),
    seasonHistory: [
      {
        sequenceNumber: 1,
        seasonId: seasonId("season:2026"),
        competitionId: "competition:demo" as NonNullable<CareerState["seasonHistory"]>[number]["competitionId"],
        finalTable: [leagueTableRowFixture(1, pro01, 3)],
        championClubId: pro01,
        selectedClubFinish: leagueTableRowFixture(1, pro01, 3),
        aggregateGoals: {
          fixtureCount: 1,
          totalGoals: 2,
        },
        playerStatistics: {
          participationCoverage: "complete",
          eventCoverage: "partial",
          rows: [{
            playerId: playerId("player:retired-json"),
            starts: 20,
            substituteAppearances: 4,
            minutes: 1_880,
            ratingTotal: 164.2,
            ratingSamples: 24,
            goals: 11,
            assists: 6,
            saves: 0,
          }],
        },
      },
    ],
  });

  try {
    await storage.saveCareer({
      saveId: saveId("save:career-history"),
      name: "Career History",
      state,
    });

    const loaded = await storage.loadCareer(saveId("save:career-history"));

    assert.deepEqual(loaded.seasonHistory, state.seasonHistory);
  } finally {
    await removeTempSaveDirectory(directoryPath);
  }
});

test("current JSON envelopes normalize archived seasons that predate player statistics", async () => {
  const directoryPath = await createTempSaveDirectory();
  const storage = new JsonCareerStorage({
    directoryPath,
    nowISO: fixedClock("2026-06-21T10:00:00.000Z"),
  });
  const pro01 = "club:pro01" as CareerState["selectedClubId"];
  const state = createCareerState({
    ...minimalCareerState(),
    seasonHistory: [{
      sequenceNumber: 1,
      seasonId: seasonId("season:2025"),
      competitionId: "competition:demo" as NonNullable<CareerState["seasonHistory"]>[number]["competitionId"],
      finalTable: [leagueTableRowFixture(1, pro01, 3)],
      championClubId: pro01,
      selectedClubFinish: leagueTableRowFixture(1, pro01, 3),
      aggregateGoals: { fixtureCount: 1, totalGoals: 2 },
    }],
  });

  try {
    await storage.saveCareer({
      saveId: saveId("save:legacy-career-history"),
      name: "Legacy Career History",
      state,
    });

    const loaded = await storage.loadCareer(saveId("save:legacy-career-history"));

    assert.deepEqual(loaded.seasonHistory?.[0]?.playerStatistics, {
      participationCoverage: "unavailable",
      eventCoverage: "unavailable",
      rows: [],
    });
  } finally {
    await removeTempSaveDirectory(directoryPath);
  }
});

test("save then load preserves optional youth academy state", async () => {
  const directoryPath = await createTempSaveDirectory();
  const storage = new JsonCareerStorage({
    directoryPath,
    nowISO: fixedClock("2026-06-21T10:00:00.000Z"),
  });
  const state = careerStateWithYouthAcademy();

  try {
    await storage.saveCareer({
      saveId: saveId("save:career-youth"),
      name: "Career Youth",
      state,
    });

    const loaded = await storage.loadCareer(saveId("save:career-youth"));

    assert.deepEqual(loaded.youthAcademyState, state.youthAcademyState);
  } finally {
    await removeTempSaveDirectory(directoryPath);
  }
});

test("save then load preserves a blocking selected-club counteroffer exactly", async () => {
  const directoryPath = await createTempSaveDirectory();
  const storage = new JsonCareerStorage({
    directoryPath,
    nowISO: fixedClock("2026-06-21T10:00:00.000Z"),
  });
  const base = minimalCareerState();
  const player = playerId("player:pro01-01");
  const club = base.selectedClubId;
  const contract = base.seniorSquadState?.activeContractIds[0];
  assert.ok(contract !== undefined);
  const negotiation = contractNegotiationId("contract-negotiation:storage-counteroffer");
  const submittedTerms = contractTerms(120_000_00);
  const counterTerms = contractTerms(135_000_00);
  const preferredTerms = contractTerms(145_000_00);
  const state = createCareerState({
    ...base,
    contractNegotiationState: {
      negotiations: {
        [negotiation]: {
          id: negotiation,
          playerId: player,
          clubId: club,
          currentContractId: contract,
          createdOn: gameDate(19_995),
          status: "countered",
          submittedOffer: {
            submittedOn: gameDate(19_996),
            responseDueOn: gameDate(19_998),
            terms: submittedTerms,
          },
          counterOffer: {
            issuedOn: gameDate(19_998),
            expiresOn: gameDate(20_012),
            terms: counterTerms,
            evaluation: {
              decision: "countered",
              scoreBasisPoints: 8_500,
              reasons: ["annual_wage_below_demand"],
              demand: {
                evaluatedOn: gameDate(19_998),
                age: 27,
                currentAbility: 10,
                publicPotentialP50Ability: 12,
                role: "goalkeeper",
                expectedSquadStatus: "squad_player",
                currentAnnualWage: nonNegativeMoney(100_000_00),
                remainingContractDays: 367,
                clubReputation: 5,
                clubCategory: "third_division",
                freeAgentLeverageBasisPoints: 0,
                preferredTerms,
                minimumTerms: counterTerms,
              },
            },
          },
        },
      },
      negotiationIds: [negotiation],
    },
    currentSeasonInbox: [createCareerInboxMessage({
      id: careerInboxMessageId(`inbox:contract-counteroffer:${negotiation}`),
      date: gameDate(19_998),
      category: "contract_counteroffer",
      source: "contract_office",
      level: "blocking",
      continuePolicy: "until_resolved",
      lifecycle: { read: false, acknowledged: false, resolved: false },
      related: {
        clubId: club,
        playerId: player,
        contractId: contract,
        contractNegotiationId: negotiation,
      },
      actionIds: ["open_contract_negotiation"],
    })],
  });

  try {
    await storage.saveCareer({ saveId: state.saveId, name: "Counteroffer", state });

    const loaded = await storage.loadCareer(state.saveId);

    assert.deepEqual(loaded.contractNegotiationState, state.contractNegotiationState);
    assert.deepEqual(loaded.currentSeasonInbox, state.currentSeasonInbox);
  } finally {
    await removeTempSaveDirectory(directoryPath);
  }
});

test("loading a missing career save throws a typed storage error", async () => {
  const directoryPath = await createTempSaveDirectory();
  const storage = new JsonCareerStorage({ directoryPath });

  try {
    await assert.rejects(
      () => storage.loadCareer(saveId("save:missing")),
      (error: unknown) => error instanceof StorageError && error.code === "save_not_found",
    );
  } finally {
    await removeTempSaveDirectory(directoryPath);
  }
});

test("loading malformed career saves fails clearly", async () => {
  const directoryPath = await createTempSaveDirectory();
  const storage = new JsonCareerStorage({ directoryPath });
  const malformedPath = join(directoryPath, `${encodeURIComponent(saveId("save:bad"))}.career.json`);

  try {
    await writeFile(malformedPath, JSON.stringify({ saveSchemaVersion: 13, metadata: {}, state: {} }), "utf8");

    await assert.rejects(
      () => storage.loadCareer(saveId("save:bad")),
      (error: unknown) => error instanceof StorageError && error.code === "save_unreadable",
    );
  } finally {
    await removeTempSaveDirectory(directoryPath);
  }
});

test("career storage writes a career-specific JSON envelope", async () => {
  const directoryPath = await createTempSaveDirectory();
  const storage = new JsonCareerStorage({
    directoryPath,
    nowISO: fixedClock("2026-06-21T10:00:00.000Z"),
  });

  try {
    await storage.saveCareer({
      saveId: saveId("save:career-demo"),
      name: "Career Demo",
      state: minimalCareerState(),
    });

    const storedPath = join(directoryPath, `${encodeURIComponent(saveId("save:career-demo"))}.career.json`);
    const raw = JSON.parse(await readFile(storedPath, "utf8")) as Readonly<Record<string, unknown>>;

    assert.equal(raw.saveSchemaVersion, 13);
    assert.equal(((raw.state as { readonly schemaVersion: number }).schemaVersion), 2);
    assert.equal(CAREER_STATE_SCHEMA_VERSION, 2);
    assert.equal((raw.metadata as { readonly saveId: string }).saveId, "save:career-demo");
    assert.equal((raw.state as { readonly selectedClubId: string }).selectedClubId, "club:pro01");
  } finally {
    await removeTempSaveDirectory(directoryPath);
  }
});

test("old beta career envelopes fail with a typed reset boundary", async () => {
  const directoryPath = await createTempSaveDirectory();
  const storage = new JsonCareerStorage({ directoryPath });
  const state = minimalCareerState();
  const savePath = (id: ReturnType<typeof saveId>) => join(directoryPath, `${encodeURIComponent(id)}.career.json`);

  try {
    for (const version of [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] as const) {
      const id = saveId(`save:old-beta-${version}`);
      await writeFile(savePath(id), JSON.stringify({
        saveSchemaVersion: version,
        metadata: {
          saveId: id,
          name: `Old beta ${version}`,
          createdAtISO: "2026-07-13T09:00:00.000Z",
          updatedAtISO: "2026-07-13T09:00:00.000Z",
          saveSchemaVersion: 1,
          autosaveIntervalDays: 7,
        },
        state: createCareerState({ ...state, saveId: id }),
      }), "utf8");

      await assert.rejects(
        () => storage.loadCareer(id),
        (error: unknown) => error instanceof StorageError && error.code === "unsupported_schema_version",
      );
    }
  } finally {
    await removeTempSaveDirectory(directoryPath);
  }
});

test("current beta envelopes reject missing or stale competitive-tier state", async () => {
  const directoryPath = await createTempSaveDirectory();
  const storage = new JsonCareerStorage({
    directoryPath,
    nowISO: fixedClock("2026-07-31T10:00:00.000Z"),
  });
  const state = minimalCareerState();
  const storedPath = join(directoryPath, `${encodeURIComponent(state.saveId)}.career.json`);

  try {
    await storage.saveCareer({ saveId: state.saveId, name: "Tier boundary", state });
    const envelope = JSON.parse(await readFile(storedPath, "utf8")) as {
      readonly saveSchemaVersion: number;
      readonly metadata: Readonly<Record<string, unknown>>;
      readonly state: CareerState;
    };
    const { clubCompetitiveTierState: _missingTier, ...stateWithoutTier } = envelope.state;

    await writeFile(
      storedPath,
      JSON.stringify({ ...envelope, state: stateWithoutTier }),
      "utf8",
    );
    await assert.rejects(
      () => storage.loadCareer(state.saveId),
      (error: unknown) => error instanceof StorageError && error.code === "unsupported_schema_version",
    );

    await writeFile(
      storedPath,
      JSON.stringify({
        ...envelope,
        state: {
          ...envelope.state,
          clubCompetitiveTierState: {
            ...envelope.state.clubCompetitiveTierState,
            seasonId: seasonId("season:stale"),
          },
        },
      }),
      "utf8",
    );
    await assert.rejects(
      () => storage.loadCareer(state.saveId),
      (error: unknown) => error instanceof StorageError && error.code === "unsupported_schema_version",
    );
  } finally {
    await removeTempSaveDirectory(directoryPath);
  }
});

test("policy-only updates preserve gameplay and gameplay timestamps", async () => {
  const directoryPath = await createTempSaveDirectory();
  const storage = new JsonCareerStorage({
    directoryPath,
    nowISO: fixedClock("2026-07-13T10:00:00.000Z", "2026-07-13T11:00:00.000Z"),
  });
  const state = minimalCareerState();

  try {
    const initial = await storage.saveCareer({ saveId: state.saveId, name: "Policy career", state });
    const fifteenDay = await storage.updateAutosavePolicy(state.saveId, 15);
    const updated = await storage.updateAutosavePolicy(state.saveId, null);

    assert.equal(fifteenDay.autosaveIntervalDays, 15);
    assert.equal(updated.autosaveIntervalDays, null);
    assert.equal(updated.updatedAtISO, initial.updatedAtISO);
    assert.deepEqual(await storage.loadCareer(state.saveId), state);
  } finally {
    await removeTempSaveDirectory(directoryPath);
  }
});

/** Builds the smallest valid durable career state needed for storage tests. */
function minimalCareerState(): CareerState {
  const pro01 = "club:pro01" as CareerState["selectedClubId"];

  return withPersistableCareerFacts(createCareerState({
    saveId: saveId("save:career-demo"),
    schemaVersion: CAREER_STATE_SCHEMA_VERSION,
    selectedClubId: pro01,
    gameState: minimalGameState(),
    transferHistory: [],
    playerParticipationLedger: playerParticipationLedgerFixture(playerId("player:pro01-01")),
  }));
}

/** Builds a closed monthly ledger so JSON saves prove lifecycle persistence. */
function playerParticipationLedgerFixture(player: ReturnType<typeof playerId>) {
  const season = seasonId("season:2026");
  const monthKey = "2026-08";
  const accrued = accruePlayerFixtureParticipation(createEmptyPlayerParticipationLedger(), {
    fixtureId: fixtureId("fixture:json-career-001"),
    playerId: player,
    clubId: clubId("club:pro01"),
    seasonId: season,
    monthKey,
    started: true,
    substituteAppearance: false,
    minutes: 90,
    rating: 7.1,
    playedRoleMinutes: { goalkeeper: 90 },
  });

  return closePlayerParticipationMonth(accrued, season, monthKey);
}

/** Builds a career state with one active youth player for storage round trips. */
function careerStateWithYouthAcademy(): CareerState {
  const pro01 = "club:pro01" as CareerState["selectedClubId"];
  const youth01 = playerId("player:pro01-youth-01");
  const base = minimalCareerState();
  const gameState: GameState = {
    ...base.gameState,
    players: {
      ...base.gameState.players,
      [youth01]: {
        ...playerFixture(youth01),
        firstName: "Youth",
        lastName: "One",
      },
    },
    playerIds: [...base.gameState.playerIds, youth01],
    playerStates: {
      ...base.gameState.playerStates,
      [youth01]: playerStateFixture(),
    },
  };
  const youthAcademyState: YouthAcademyState = {
    clubRosters: {
      [pro01]: {
        clubId: pro01,
        playerIds: [youth01],
      },
    },
    clubRosterIds: [pro01],
    playerLifecycle: {
      [youth01]: {
        playerId: youth01,
        clubId: pro01,
        status: "academy",
        academyEntrySeasonId: seasonId("season:2026"),
        academyEntryDate: gameDate(20_000),
      },
    },
    playerLifecycleIds: [youth01],
  };

  return createCareerState({
    ...base,
    gameState,
    youthAcademyState,
  });
}

/** Builds the smallest valid game state with one selected club. */
function minimalGameState(): GameState {
  const pro01 = "club:pro01" as CareerState["selectedClubId"];
  const player01 = playerId("player:pro01-01");

  return {
    meta: {
      seed: "demo-001",
      rngAlgorithmVersion: "sfc32-cyrb128-v1",
      saveSchemaVersion: 1,
      calibrationVersions: {
        topologyDecisionId: "fictional-three-tier-v1",
        playerRatingScaleVersion: "rating-v1",
        playerMarketCalibrationVersion: "market-v1",
        valuationCurvesVersion: "valuation-v1",
        askingPriceCurvesVersion: "asking-v1",
        marketBehaviorCalibrationVersion: "behavior-v1",
        wageFinanceCalibrationVersion: "wage-v1",
        playerDevelopmentEnvironmentVersion: "development-environment-v1",
      },
    },
    calendar: {
      currentDate: gameDate(20_000),
      currentSeasonId: seasonId("season:2026"),
    },
    players: {
      [player01]: playerFixture(player01),
    },
    playerIds: [player01],
    playerStates: {
      [player01]: playerStateFixture(),
    },
    clubs: {
      [pro01]: {
        id: pro01,
        name: "PRO01",
        shortName: "PRO01",
        category: "third_division",
        reputation: 5,
        playerIds: [player01],
      },
    },
    clubIds: [pro01],
    fixtures: {},
    fixtureIds: [],
    domesticCompetitionWorld: {
      competitionIds: [competitionId("competition:demo-third")],
      competitions: {
        [competitionId("competition:demo-third")]: {
          id: competitionId("competition:demo-third"),
          name: "Scalata Three",
          clubIds: [pro01],
          matchRules: {
            maximumSubstitutions: 5,
            substitutionWindowLimit: null,
            allowsPlayerReentry: false,
            yellowCardAccumulationThreshold: 5,
            straightRedSuspensionMatches: 3,
            secondYellowSuspensionMatches: 1,
            yellowAccumulationSuspensionMatches: 1,
          },
          seasonDistribution: {
            currency: "EUR",
            prizes: [{ position: 1, amount: nonNegativeMoney(1_000_000_00) }],
          },
        },
      },
      seasonHistory: [{
        sequenceNumber: 1,
        seasonId: seasonId("season:2025"),
        competitionId: competitionId("competition:demo-third"),
        finalTable: [leagueTableRowFixture(1, pro01, 3)],
      }],
    },
  };
}

/** Builds the compact player record needed for match-preparation storage tests. */
function playerFixture(id: Player["id"]): Player {
  return {
    id,
    firstName: "Player",
    lastName: "One",
    birthDate: gameDate(10_000),
    naturalPositions: ["gk"],
    primaryRole: "goalkeeper",
    archetype: "goalkeeper_shot_stopper",
    naturalRoles: ["goalkeeper"],
    adaptedRoles: [],
    weakRoles: [],
    roleFamiliarity: { goalkeeper: "natural" },
    abilities: abilitySet(10),
    potential: abilitySet(12),
  };
}

/** Builds a complete ability object with the same numeric value everywhere. */
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

/** Builds the default dynamic player state used by storage fixtures. */
function playerStateFixture(): PlayerDynamicState {
  return {
    fitness: 100 as PlayerDynamicState["fitness"],
    form: 50 as PlayerDynamicState["form"],
    morale: 50 as PlayerDynamicState["morale"],
  };
}

/** Builds one complete term set for persistence-boundary assertions. */
function contractTerms(annualWage: number) {
  return {
    durationYears: 2,
    annualWage: nonNegativeMoney(annualWage),
    squadStatus: "squad_player" as const,
    bonuses: {
      signingBonus: nonNegativeMoney(5_000_00),
      appearanceBonus: nonNegativeMoney(500_00),
      cleanSheetBonus: nonNegativeMoney(250_00),
    },
  };
}

/** Builds a final-table row for season-history storage round trips. */
function leagueTableRowFixture(
  position: number,
  clubId: CareerState["selectedClubId"],
  points: number,
): NonNullable<CareerState["seasonHistory"]>[number]["finalTable"][number] {
  return {
    position,
    clubId,
    played: 1,
    wins: points === 3 ? 1 : 0,
    draws: 0,
    losses: points === 0 ? 1 : 0,
    goalsFor: points === 3 ? 2 : 0,
    goalsAgainst: points === 0 ? 2 : 0,
    goalDifference: points === 3 ? 2 : -2,
    points,
  };
}

/**
 * Creates a deterministic clock function for metadata assertions.
 */
function fixedClock(...timestamps: readonly string[]): () => string {
  assert.notEqual(timestamps.length, 0);

  let index = 0;

  return () => {
    const timestamp = timestamps[Math.min(index, timestamps.length - 1)]!;
    index += 1;

    return timestamp;
  };
}

/** Creates an isolated temporary save directory for a test case. */
async function createTempSaveDirectory(): Promise<string> {
  return mkdtemp(join(tmpdir(), "the-long-season-career-saves-"));
}

/** Removes a temporary save directory after a test case. */
async function removeTempSaveDirectory(directoryPath: string): Promise<void> {
  await rm(directoryPath, { recursive: true, force: true });
}
