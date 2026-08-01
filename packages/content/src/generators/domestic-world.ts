import {
  competitionId,
  createCompetition,
  createDomesticCompetitionWorld,
  gameDate,
  getPlayerRoleProfile,
  playerId,
  roleCurrentAbility,
  rolePotentialAbility,
  seasonId,
  type Club,
  type ClubCategory,
  type ClubFinanceState,
  type ClubId,
  type CompetitionId,
  type DomesticCompetitionWorld,
  type GameDate,
  type LeagueTableRules,
  type PersonIdentity,
  type PlayerDynamicState,
  type PlayerEconomyCalibrationVersionBundle,
  type PlayerId,
  type RoleIdentifiedPlayer,
  type SeasonId,
  type SeasonTransferWindows,
  type SeniorSquadState,
} from "@game/domain";
import { completedCivilYears, fromISO } from "@game/shared";

import {
  playerEconomyCalibration,
  marketBehaviorCalibration,
  playerRatingScale,
  playerWagePolicyConfig,
} from "../balance/player-economy-calibration.ts";
import {
  FAKE_CLUB_COUNT,
  FAKE_LINEUP_SIZE,
  FAKE_PLAYERS_PER_CLUB,
  generateFakeClubs,
  type FakeClubs,
} from "./fake-clubs.ts";
import {
  generateFakePlayersForClubs,
  type FakeLineupSlot,
  type FakePlayers,
} from "./fake-players.ts";
import { createFakeGameplayConfig, type FakeGameplayConfig } from "./gameplay-config.ts";
import {
  generateCompetitionSeasonDistribution,
  generateInitialClubFinanceState,
} from "./club-finance-world.ts";
import {
  generateInitialYouthAcademies,
  initialYouthPlayerId,
  INITIAL_YOUTH_PLAYERS_PER_CLUB,
  type GenerateInitialYouthAcademiesResult,
} from "./initial-youth-academies.ts";
import {
  openingCompetitiveTierForClubRank,
  type OpeningPlayerGenerationClubContext,
} from "./player-generation-bands.ts";
import { currentAbilityRarityLaneForYouthProspect } from "./player-potential-rarity.ts";
import {
  buildInitialWorldExceptionalAllocation,
  type InitialWorldExceptionalAllocation,
  type PlayerRarityAssignment,
  type PlayerRarityBudget,
} from "./player-rarity-budget.ts";
import { generateInitialSeniorSquadState } from "./senior-squad-world.ts";
import {
  resolveSeasonTransferWindows,
  seasonStartYearFromDate,
} from "./transfer-window-catalog.ts";
import {
  currentAbilityRarityLaneForGeneratedArchetype,
  resolveGeneratedCurrentAbilityRarityLane,
  resolveGeneratedExceptionalProfile,
  type GeneratedPlayerArchetypeKey,
} from "./player-archetypes.ts";

/** Stable topology decision exposed by every generated complete domestic world. */
export const FAKE_DOMESTIC_TOPOLOGY_ID = "fictional-three-tier-v1";

/** Canonical top-to-bottom competition order for the fictional country. */
export const FAKE_DOMESTIC_COMPETITION_IDS: readonly CompetitionId[] = [
  competitionId("competition:ita-1"),
  competitionId("competition:ita-2"),
  competitionId("competition:ita-3"),
];

/** Exact number of senior clubs and players in the canonical country. */
export const FAKE_DOMESTIC_CLUB_COUNT = FAKE_CLUB_COUNT * 3;
export const FAKE_DOMESTIC_SENIOR_PLAYER_COUNT =
  FAKE_DOMESTIC_CLUB_COUNT * FAKE_PLAYERS_PER_CLUB;

interface DomesticDivisionSpec {
  readonly category: ClubCategory;
  readonly competitionId: CompetitionId;
  readonly competitionName: string;
  readonly namespace: string;
  readonly shortNamePrefix: string;
}

const DOMESTIC_DIVISIONS: readonly DomesticDivisionSpec[] = [
  {
    category: "first_division",
    competitionId: FAKE_DOMESTIC_COMPETITION_IDS[0]!,
    competitionName: "Fictional First Division",
    namespace: "ita-1",
    shortNamePrefix: "D1",
  },
  {
    category: "second_division",
    competitionId: FAKE_DOMESTIC_COMPETITION_IDS[1]!,
    competitionName: "Fictional Second Division",
    namespace: "ita-2",
    shortNamePrefix: "D2",
  },
  {
    category: "third_division",
    competitionId: FAKE_DOMESTIC_COMPETITION_IDS[2]!,
    competitionName: "Fictional Third Division",
    namespace: "ita-3",
    shortNamePrefix: "D3",
  },
];

/** Complete generated country returned to later CLI/web composition roots. */
export interface FakeDomesticWorld extends FakeGameplayConfig {
  readonly clubs: readonly Club[];
  readonly clubIds: readonly ClubId[];
  readonly clubsById: Readonly<Record<ClubId, Club>>;
  readonly divisionClubIds: Readonly<Record<ClubCategory, readonly ClubId[]>>;
  readonly players: Readonly<Record<PlayerId, RoleIdentifiedPlayer>>;
  readonly playerIds: readonly PlayerId[];
  readonly playerIdentities: Readonly<Record<PlayerId, PersonIdentity>>;
  readonly playerArchetypes: Readonly<Record<PlayerId, GeneratedPlayerArchetypeKey>>;
  readonly playerStates: Readonly<Record<PlayerId, PlayerDynamicState>>;
  readonly lineupsByClubId: Readonly<Record<ClubId, readonly FakeLineupSlot[]>>;
  readonly divisionPlayerRarityBudgets: Readonly<Record<ClubCategory, PlayerRarityBudget>>;
  readonly playerRarityAssignments: Readonly<Record<PlayerId, PlayerRarityAssignment>>;
  readonly exceptionalAllocation: InitialWorldExceptionalAllocation;
  readonly seniorSquadState: SeniorSquadState;
  readonly clubFinanceState: ClubFinanceState;
  readonly initialYouthAcademies: GenerateInitialYouthAcademiesResult;
  readonly seasonId: SeasonId;
  readonly seasonStartDate: GameDate;
  readonly tableRules: LeagueTableRules;
  readonly domesticCompetitionWorld: DomesticCompetitionWorld;
  readonly transferWindowCompetitionIds: readonly CompetitionId[];
  readonly transferWindowsByCompetitionId: Readonly<Record<CompetitionId, SeasonTransferWindows>>;
  readonly calibrationVersions: PlayerEconomyCalibrationVersionBundle;
  /** Default new-career club; app selection remains a later bootstrap concern. */
  readonly defaultSelectedClubId: ClubId;
}

/** Options for deterministic complete-country generation. */
export interface FakeDomesticWorldOptions {
  readonly worldSeed?: string;
}

/**
 * Builds the complete ordered 54-club fictional domestic country.
 *
 * The content facade owns identities and starting facts only. It deliberately
 * emits no fixture or calendar IDs: engine calendar generation remains the
 * sole schedule owner.
 */
export function createFakeDomesticWorld(
  options: FakeDomesticWorldOptions = {},
): FakeDomesticWorld {
  if (playerEconomyCalibration.versions.topologyDecisionId !== FAKE_DOMESTIC_TOPOLOGY_ID) {
    throw new Error("Generated domestic topology and calibration bundle versions differ");
  }
  const worldSeed = options.worldSeed ?? "demo-001";
  const season = seasonId("season:2026");
  const seasonStartDate = gameDate(fromISO("2026-08-01"));
  const divisions = generateDomesticDivisionClubs(worldSeed);
  const clubs = divisions.flatMap((division) => division.clubs.clubs);
  const clubIds = divisions.flatMap((division) => division.clubs.clubIds);
  const clubsById = mergeRecords(divisions.map((division) => division.clubs.clubsById));
  const divisionClubIds = Object.fromEntries(
    divisions.map((division) => [division.spec.category, division.clubs.clubIds]),
  ) as Record<ClubCategory, readonly ClubId[]>;
  const openingClubContexts = openingPlayerGenerationClubContexts(divisions);
  const preliminaryPlayers = generateDomesticSeniorPlayers({
    divisions,
    worldSeed,
    clubContexts: openingClubContexts,
  });
  const preliminaryYouthAcademies = generateInitialYouthAcademies({
    worldSeed,
    seasonId: season,
    referenceDate: seasonStartDate,
    clubIds,
    clubContexts: openingClubContexts,
    ratingScale: playerRatingScale,
  });
  const exceptionalAllocation = buildInitialWorldExceptionalAllocation({
    seed: worldSeed,
    ratingScale: playerRatingScale,
    candidates: exceptionalCandidates(
      divisions,
      preliminaryPlayers,
      preliminaryYouthAcademies,
      seasonStartDate,
    ),
  });
  const generatedPlayers = generateDomesticSeniorPlayers({
    divisions,
    worldSeed,
    clubContexts: openingClubContexts,
    exceptionalAllocation,
  });
  const players = mergeRecords(generatedPlayers.map((division) => division.players.players));
  const playerIds = generatedPlayers.flatMap((division) => division.players.playerIds);
  const playerIdentities = mergeRecords(
    generatedPlayers.map((division) => division.players.playerIdentities),
  );
  const playerArchetypes = mergeRecords(
    generatedPlayers.map((division) => division.players.playerArchetypes),
  );
  const playerStates = mergeRecords(
    generatedPlayers.map((division) => division.players.playerStates),
  );
  const lineupsByClubId = mergeRecords(
    generatedPlayers.map((division) => division.players.lineupsByClubId),
  );
  const playerRarityAssignments = mergeRecords(
    generatedPlayers.map((division) => division.players.playerRarityAssignments),
  );
  const divisionPlayerRarityBudgets = Object.fromEntries(
    generatedPlayers.map((division) => [
      division.spec.category,
      division.players.playerRarityBudget,
    ]),
  ) as Record<ClubCategory, PlayerRarityBudget>;
  const seniorSquadState = generateInitialSeniorSquadState({
    worldSeed,
    referenceDate: seasonStartDate,
    clubs: clubsById,
    clubIds,
    players,
    playerIds,
    wagePolicy: playerWagePolicyConfig,
  });
  const clubFinanceState = generateInitialClubFinanceState({
    referenceDate: seasonStartDate,
    clubs: clubsById,
    clubIds,
    seniorSquadState,
    wagePolicy: playerWagePolicyConfig,
    marketBehaviorPolicy: marketBehaviorCalibration,
  });
  const competitions = Object.fromEntries(divisions.map(({ spec, clubs: divisionClubs }) => [
    spec.competitionId,
    createCompetition({
      id: spec.competitionId,
      name: spec.competitionName,
      clubIds: divisionClubs.clubIds,
      matchRules: {
        maximumSubstitutions: 5,
        substitutionWindowLimit: null,
        allowsPlayerReentry: false,
        yellowCardAccumulationThreshold: 5,
        straightRedSuspensionMatches: 3,
        secondYellowSuspensionMatches: 1,
        yellowAccumulationSuspensionMatches: 1,
      },
      seasonDistribution: generateCompetitionSeasonDistribution(
        clubFinanceState,
        divisionClubs.clubIds,
      ),
    }),
  ])) as DomesticCompetitionWorld["competitions"];
  const domesticCompetitionWorld = createDomesticCompetitionWorld({
    competitionIds: FAKE_DOMESTIC_COMPETITION_IDS,
    competitions,
    seasonHistory: [],
  }, {
    clubs: clubsById,
    fixtureIds: [],
    fixtures: {},
  });
  const initialYouthAcademies = generateInitialYouthAcademies({
    worldSeed,
    seasonId: season,
    referenceDate: seasonStartDate,
    clubIds,
    clubContexts: openingClubContexts,
    potentialSixPlayerIds: exceptionalAllocation.potentialSixPlayerKeys
      .filter((key) =>
        exceptionalAllocation.assignmentsByPlayerKey[key]?.source === "constructed"
        && key.includes("player:youth-")
      )
      .map(playerIdFromKey),
    reconstructedPotentialBelowSixPlayerIds:
      exceptionalAllocation.reconstructedPotentialBelowSixPlayerKeys
        .filter((key) => key.includes("player:youth-"))
        .map(playerIdFromKey),
    ratingScale: playerRatingScale,
  });
  const transferWindowsByCompetitionId = Object.fromEntries(
    FAKE_DOMESTIC_COMPETITION_IDS.map((id) => [
      id,
      resolveSeasonTransferWindows({
        competitionId: id,
        seasonId: season,
        seasonStartYear: seasonStartYearFromDate(seasonStartDate),
      }),
    ]),
  ) as Record<CompetitionId, SeasonTransferWindows>;
  const thirdDivisionFirstClub = divisionClubIds.third_division[0];
  if (thirdDivisionFirstClub === undefined) {
    throw new Error("Canonical third division requires a default selected club");
  }

  return {
    clubs,
    clubIds,
    clubsById,
    divisionClubIds,
    players,
    playerIds,
    playerIdentities,
    playerArchetypes,
    playerStates,
    lineupsByClubId,
    divisionPlayerRarityBudgets,
    playerRarityAssignments,
    exceptionalAllocation,
    seniorSquadState,
    clubFinanceState,
    initialYouthAcademies,
    seasonId: season,
    seasonStartDate,
    tableRules: { pointsForWin: 3, pointsForDraw: 1, pointsForLoss: 0 },
    domesticCompetitionWorld,
    transferWindowCompetitionIds: [...FAKE_DOMESTIC_COMPETITION_IDS],
    transferWindowsByCompetitionId,
    calibrationVersions: { ...playerEconomyCalibration.versions },
    defaultSelectedClubId: thirdDivisionFirstClub,
    ...createFakeGameplayConfig(),
  };
}

interface GeneratedDomesticDivision {
  readonly spec: DomesticDivisionSpec;
  readonly clubs: FakeClubs;
}

interface GeneratedDomesticDivisionPlayers {
  readonly spec: DomesticDivisionSpec;
  readonly players: FakePlayers;
}

function generateDomesticDivisionClubs(worldSeed: string): readonly GeneratedDomesticDivision[] {
  const generated: GeneratedDomesticDivision[] = [];
  const usedNames: string[] = [];
  for (const spec of DOMESTIC_DIVISIONS) {
    const clubs = generateFakeClubs({
      seed: worldSeed,
      country: "italy",
      divisionLevel: spec.category,
      category: spec.category,
      clubIdNamespace: spec.namespace,
      playerIdNamespace: spec.namespace,
      shortNamePrefix: spec.shortNamePrefix,
      excludedNames: usedNames,
    });
    usedNames.push(...clubs.clubs.map((club) => club.name));
    generated.push({ spec, clubs });
  }
  return generated;
}

function generateDomesticSeniorPlayers(input: {
  readonly divisions: readonly GeneratedDomesticDivision[];
  readonly worldSeed: string;
  readonly clubContexts: Readonly<Record<ClubId, OpeningPlayerGenerationClubContext>>;
  readonly exceptionalAllocation?: InitialWorldExceptionalAllocation;
}): readonly GeneratedDomesticDivisionPlayers[] {
  const constructedCurrentSixPlayerIds = input.exceptionalAllocation?.currentSixPlayerKeys
    .filter((key) =>
      input.exceptionalAllocation?.assignmentsByPlayerKey[key]?.source === "constructed"
    )
    .map(playerIdFromKey) ?? [];
  const constructedPotentialSixPlayerIds = input.exceptionalAllocation?.potentialSixPlayerKeys
    .filter((key) =>
      input.exceptionalAllocation?.assignmentsByPlayerKey[key]?.source === "constructed"
    )
    .map(playerIdFromKey) ?? [];
  const reconstructedPotentialBelowSixPlayerIds =
    input.exceptionalAllocation?.reconstructedPotentialBelowSixPlayerKeys.map(
      playerIdFromKey,
    ) ?? [];

  return input.divisions.map(({ spec, clubs: divisionClubs }) => ({
    spec,
    players: generateFakePlayersForClubs(divisionClubs.clubIds, {
      seed: input.worldSeed,
      playerIdNamespace: spec.namespace,
      clubContexts: input.clubContexts,
      ratingScale: playerRatingScale,
      ...(input.exceptionalAllocation === undefined
        ? {}
        : {
            exceptionalAssignments: {
              currentSixPlayerIds: constructedCurrentSixPlayerIds,
              potentialSixPlayerIds: constructedPotentialSixPlayerIds,
              reconstructedPotentialBelowSixPlayerIds,
            },
          }),
    }),
  }));
}

function exceptionalCandidates(
  divisions: readonly GeneratedDomesticDivision[],
  generatedPlayers: readonly GeneratedDomesticDivisionPlayers[],
  youthAcademies: GenerateInitialYouthAcademiesResult,
  referenceDate: GameDate,
) {
  const seniorPlayers = mergeRecords(
    generatedPlayers.map((division) => division.players.players),
  );
  const seniorArchetypes = mergeRecords(
    generatedPlayers.map((division) => division.players.playerArchetypes),
  );

  return divisions.flatMap(({ spec, clubs }) => clubs.clubs.flatMap((club, clubIndex) => [
    ...club.playerIds.map((id, playerIndex) => {
      const player = seniorPlayers[id];
      const archetypeKey = seniorArchetypes[id];
      if (player === undefined || archetypeKey === undefined) {
        throw new Error(`Missing preliminary senior profile: ${id}`);
      }
      const ageYears = completedCivilYears(player.birthDate, referenceDate);
      return {
        playerKey: String(id),
        clubKey: String(club.id),
        division: spec.category,
        clubTier: openingCompetitiveTierForClubRank(clubIndex + 1),
        ageYears,
        isFirstTeam: playerIndex < FAKE_LINEUP_SIZE,
        naturallyCurrentSix: generatedRating(player, "current") === 6,
        naturallyPotentialSix: generatedRating(player, "potential") === 6,
        naturalArchetypeKey: archetypeKey,
        naturalCurrentAbilityLane:
          currentAbilityRarityLaneForGeneratedArchetype(archetypeKey),
        constructedExceptionalCurrentAbilityLane:
          constructedSeniorExceptionalCurrentAbilityLane(ageYears),
        canConstructExceptionalProfile: true,
      };
    }),
    ...Array.from({ length: INITIAL_YOUTH_PLAYERS_PER_CLUB }, (_, youthIndex) => {
      const id = initialYouthPlayerId(club.id, youthIndex + 1);
      const player = youthAcademies.players[id];
      const archetypeKey = youthAcademies.playerArchetypes[id];
      const developmentLevel = youthAcademies.clubYouthDevelopmentLevels[club.id];
      if (
        player === undefined
        || archetypeKey === undefined
        || developmentLevel === undefined
      ) {
        throw new Error(`Missing preliminary academy profile: ${id}`);
      }
      return {
        playerKey: String(id),
        clubKey: String(club.id),
        division: spec.category,
        clubTier: openingCompetitiveTierForClubRank(clubIndex + 1),
        ageYears: completedCivilYears(player.birthDate, referenceDate),
        isFirstTeam: false,
        naturallyCurrentSix: generatedRating(player, "current") === 6,
        naturallyPotentialSix: generatedRating(player, "potential") === 6,
        naturalArchetypeKey: archetypeKey,
        naturalCurrentAbilityLane: resolveGeneratedCurrentAbilityRarityLane({
          archetypeKey,
          requestedLane: currentAbilityRarityLaneForYouthProspect(
            archetypeKey,
            Number(developmentLevel),
          ),
        }),
        constructedExceptionalCurrentAbilityLane:
          constructedYouthExceptionalCurrentAbilityLane(
            Number(developmentLevel),
          ),
        canConstructExceptionalProfile: true,
      };
    }),
  ]));
}

/** Returns the effective lane used by the senior exceptional-profile owner. */
function constructedSeniorExceptionalCurrentAbilityLane(ageYears: number) {
  return resolveGeneratedExceptionalProfile({
    currentSixAllocated: ageYears > 20,
    potentialSixAllocated: true,
  }).currentAbilityLane;
}

/** Returns the effective lane after the academy request meets the archetype floor. */
function constructedYouthExceptionalCurrentAbilityLane(
  youthDevelopmentLevel: number,
) {
  const exceptionalProfile = resolveGeneratedExceptionalProfile({
    currentSixAllocated: false,
    potentialSixAllocated: true,
  });
  if (exceptionalProfile.archetypeKey === undefined) {
    throw new Error("Potential-only exceptional profile has no archetype");
  }
  return resolveGeneratedCurrentAbilityRarityLane({
    archetypeKey: exceptionalProfile.archetypeKey,
    requestedLane: currentAbilityRarityLaneForYouthProspect(
      exceptionalProfile.archetypeKey,
      youthDevelopmentLevel,
    ),
  });
}

/**
 * Composes the canonical opening football context once for senior and academy
 * generation.
 *
 * Future countries call the same national policy at their own composition
 * root. They must not multiply one country's prospect bands inside this
 * Italian world or reconstruct competitive tier from reputation downstream.
 */
function openingPlayerGenerationClubContexts(
  divisions: readonly GeneratedDomesticDivision[],
): Readonly<Record<ClubId, OpeningPlayerGenerationClubContext>> {
  return Object.fromEntries(divisions.flatMap(({ clubs }) =>
    clubs.clubs.map((club, clubIndex) => [
      club.id,
      {
        category: club.category,
        reputation: club.reputation,
        competitiveTier: openingCompetitiveTierForClubRank(clubIndex + 1),
      },
    ]),
  )) as Record<ClubId, OpeningPlayerGenerationClubContext>;
}

function playerIdFromKey(key: string): PlayerId {
  return playerId(key);
}

function generatedRating(
  player: RoleIdentifiedPlayer,
  kind: "current" | "potential",
): number {
  const roleProfile = getPlayerRoleProfile(player.primaryRole);
  const ability = kind === "current"
    ? Number(roleCurrentAbility(player.abilities, roleProfile))
    : Number(rolePotentialAbility(player.potential, roleProfile));
  let rating = 1;
  for (const threshold of playerRatingScale.abilityThresholds) {
    if (ability >= threshold.minimumAbilityInclusive) rating = threshold.rating;
  }
  return rating;
}

function mergeRecords<Key extends string, Value>(
  records: readonly Readonly<Record<Key, Value>>[],
): Record<Key, Value> {
  return Object.assign({}, ...records) as Record<Key, Value>;
}
