import { isMainThread, parentPort, Worker, workerData } from "node:worker_threads";

import {
  assignGeneratedSquadIdentities,
  createFakeDomesticWorld,
  generatedRoleIdentityForPosition,
  GENERATED_SQUAD_IDENTITIES,
  GENERATED_SQUAD_IDENTITY_KEYS,
  selectPlayerValuationConfig,
  squadIdentityPositionForSlot,
  type FakeDomesticWorld,
  type GeneratedSquadIdentityKey,
} from "@game/content";
import {
  generateRoundRobinCalendar,
  selectCareerAiTeam,
  type MatchTeamContext,
} from "@game/engine";
import {
  observeTacticalAgencyTeamSelection,
  runTacticalAgencySelectionSeries,
  summarizeTacticalAgencyPrimaryRoles,
  type TacticalAgencyLowBlockSeriesInput,
  type TacticalAgencyRoleSummary,
  type TacticalAgencySelectionRow,
  type TacticalAgencySelectionWorkItem,
} from "@game/simulation-tools";

import { careerStateFromNewWorld } from "../career/scenarios.ts";
import type { ClubId, CliCareerState, CliSaveId, PlayerId } from "../career/types.ts";
import type { LeagueDiversityOpeningGateRow } from "./league-diversity-gate.ts";

/** Competition identity as the CLI names it, through the career aliases. */
type CliCompetitionId = FakeDomesticWorld["domesticCompetitionWorld"]["competitionIds"][number];

/**
 * A pitch position, read off content's own slot mapping.
 *
 * Taken from the return type rather than imported from `@game/domain`, which
 * the CLI is not allowed to reach into directly.
 */
type PlayerPosition = ReturnType<typeof squadIdentityPositionForSlot>;

/**
 * One world of the Phase 81A Step 02 before-state, and the worker that runs it.
 *
 * A world is the shard key. It is the largest unit that shares nothing with any
 * other unit - its own seed, its own generated squads, its own calendar - so
 * partitioning by world is what makes the run identical at one worker and at
 * seven. Worker count is execution metadata; it may never touch a number.
 *
 * Nothing is sent across the boundary except the seed in and plain rows out.
 * Each worker generates its own world, so no `CareerState` is ever cloned and
 * the shard cannot inherit anything from the shard before it.
 */

/** What one shard is asked to measure. */
export interface TacticalAgencyWorldInput {
  /** World seed. The only thing that distinguishes one shard from another. */
  readonly worldSeed: string;
  /** Rounds of the observed competition to select for. */
  readonly roundCount: number;
}

/** What one shard produces. */
export interface TacticalAgencyWorldResult {
  /** World seed this came from, so a row can always be traced back. */
  readonly worldSeed: string;
  /** Competition the selections were observed in. */
  readonly competitionId: CliCompetitionId;
  /** One row per club per fixture, in calendar order. */
  readonly rows: readonly TacticalAgencySelectionRow[];
  /** Primary roles across every senior squad in that competition. */
  readonly roles: TacticalAgencyRoleSummary;
  /** Stamped calibration the world was generated and measured under. */
  readonly matchTacticsCalibrationVersion: string;
  /** Milliseconds spent inside the selector, for cost estimation. */
  readonly elapsedMilliseconds: number;
}

/** One directed real-squad matchup with both production-selected contexts. */
export interface TacticalAgencyConditionedMatchup {
  readonly contextId: string;
  readonly worldSeed: string;
  readonly competitionId: CliCompetitionId;
  readonly ownIdentityKey: string;
  readonly opponentIdentityKey: string;
  readonly ownFormationKey: string;
  readonly opponentFormationKey: string;
  readonly own: MatchTeamContext;
  readonly opponent: MatchTeamContext;
}

/** One production selector decision retained for B2 population attribution. */
export interface TacticalAgencyConditionedClubSelection {
  readonly worldSeed: string;
  readonly competitionId: CliCompetitionId;
  readonly clubId: ClubId;
  readonly squadIdentityKey: string;
  readonly formationKey: string;
  readonly bestStructuralScore: number;
  readonly secondStructuralScore: number | "not_observed";
  readonly tiedAtBestCount: number;
  readonly outOfPositionSlotCount: number;
}

/** B2's opening row plus the formation distribution needed for attribution. */
export interface TacticalAgencyConditionedPopulationRow extends LeagueDiversityOpeningGateRow {
  readonly formationCounts: Readonly<Record<string, number>>;
}

/** One B2 world: all domestic clubs selected once and joined to opening gates. */
export interface TacticalAgencyConditionedWorldResult {
  readonly worldSeed: string;
  readonly matchups: readonly TacticalAgencyConditionedMatchup[];
  readonly clubSelections: readonly TacticalAgencyConditionedClubSelection[];
  readonly populationRows: readonly TacticalAgencyConditionedPopulationRow[];
  readonly matchTacticsCalibrationVersion: string;
  readonly engineConfig: FakeDomesticWorld["matchEngineConfig"];
  readonly matchTacticsCalibration: FakeDomesticWorld["matchTacticsCalibration"];
}

/** Envelope a worker posts back, so a failure is a message rather than a hang. */
export type TacticalAgencyWorkerMessage =
  | { readonly ok: true; readonly result: TacticalAgencyWorldResult }
  | { readonly ok: false; readonly message: string };

/**
 * Measures one generated world through the real career path.
 *
 * The traversal is the one the step names: generated world, selectable squad,
 * `selectCareerAiTeam(...)`, fixture. The calendar is the production
 * `generateRoundRobinCalendar(...)` rather than hand-paired clubs, so the dates
 * that age assessments and suspensions are the dates a career would have.
 */
export function runTacticalAgencyWorld(input: TacticalAgencyWorldInput): TacticalAgencyWorldResult {
  const world = createFakeDomesticWorld({ worldSeed: input.worldSeed });
  const careerState = careerStateFromNewWorld(
    careerSaveIdFor(input.worldSeed),
    world,
    input.worldSeed,
  );

  const competitionId = observedCompetitionId(world);
  const clubIds = world.domesticCompetitionWorld.competitions[competitionId]?.clubIds ?? [];
  const calendar = generateRoundRobinCalendar({
    seed: input.worldSeed,
    seasonId: world.seasonId,
    competitionId,
    clubIds,
    seasonStartDate: world.seasonStartDate,
  });

  const identityKeyByClubId = squadIdentityKeyByClubId(
    world,
    input.worldSeed,
    competitionId,
    clubIds,
  );
  const workItem = (
    clubId: ClubId,
    fixture: TacticalAgencySelectionWorkItem["fixture"],
  ): TacticalAgencySelectionWorkItem => {
    const squadIdentityKey = identityKeyByClubId.get(clubId);

    return { clubId, fixture, ...(squadIdentityKey === undefined ? {} : { squadIdentityKey }) };
  };

  const workItems: TacticalAgencySelectionWorkItem[] = [];
  for (const fixture of calendar.fixtures) {
    if (fixture.roundNumber > input.roundCount) continue;
    workItems.push(workItem(fixture.homeClubId, fixture));
    workItems.push(workItem(fixture.awayClubId, fixture));
  }

  const series = runTacticalAgencySelectionSeries(
    {
      careerState,
      workItems,
      policy: {
        roleWeights: world.roleWeights,
        tacticalDistribution: NEUTRAL_TACTICS,
        stateMultiplierCurves: world.stateMultiplierCurves,
        benchSize: BENCH_SIZE,
      },
      matchTacticsCalibration: world.matchTacticsCalibration,
      valuationConfig: selectPlayerValuationConfig(careerState.gameState.meta.calibrationVersions),
    },
    () => performance.now(),
  );

  return {
    worldSeed: input.worldSeed,
    competitionId,
    rows: series.rows,
    roles: summarizeTacticalAgencyPrimaryRoles(careerState, seniorPlayerIds(careerState, clubIds)),
    matchTacticsCalibrationVersion: world.matchTacticsCalibration.version,
    elapsedMilliseconds: series.elapsedMilliseconds,
  };
}

/**
 * Builds B2's complete opening population through one production selection per
 * club. The selected contexts remain internal evidence; report assembly emits
 * only summaries and canonical IDs rather than duplicating lineups in JSON.
 */
export function runTacticalAgencyConditionedWorld(
  input: Pick<TacticalAgencyWorldInput, "worldSeed">,
): TacticalAgencyConditionedWorldResult {
  const world = createFakeDomesticWorld({ worldSeed: input.worldSeed });
  const careerState = careerStateFromNewWorld(
    careerSaveIdFor(input.worldSeed),
    world,
    input.worldSeed,
  );
  const valuationConfig = selectPlayerValuationConfig(careerState.gameState.meta.calibrationVersions);
  const matchups: TacticalAgencyConditionedMatchup[] = [];
  const clubSelections: TacticalAgencyConditionedClubSelection[] = [];
  const populationRows: TacticalAgencyConditionedPopulationRow[] = [];

  for (const competitionId of world.domesticCompetitionWorld.competitionIds) {
    const competition = world.domesticCompetitionWorld.competitions[competitionId];
    if (competition === undefined) throw new Error(`Generated competition is missing: ${competitionId}`);
    const clubIds = competition.clubIds;
    const calendar = generateRoundRobinCalendar({
      seed: input.worldSeed,
      seasonId: world.seasonId,
      competitionId,
      clubIds,
      seasonStartDate: world.seasonStartDate,
    });
    const firstRound = calendar.fixtures.filter(({ roundNumber }) => roundNumber === 1);
    const identityKeyByClubId = squadIdentityKeyByClubId(
      world,
      input.worldSeed,
      competitionId,
      clubIds,
    );
    const observedByClub = new Map<ClubId, ReturnType<typeof observeTacticalAgencyTeamSelection>>();
    const selectionInput = {
      careerState,
      policy: {
        roleWeights: world.roleWeights,
        tacticalDistribution: NEUTRAL_TACTICS,
        stateMultiplierCurves: world.stateMultiplierCurves,
        benchSize: BENCH_SIZE,
      },
      matchTacticsCalibration: world.matchTacticsCalibration,
      valuationConfig,
    };

    for (const fixture of firstRound) {
      for (const clubId of [fixture.homeClubId, fixture.awayClubId]) {
        const squadIdentityKey = identityKeyByClubId.get(clubId);
        if (squadIdentityKey === undefined) {
          throw new Error(`B2 identity join omitted ${clubId}`);
        }
        if (observedByClub.has(clubId)) {
          throw new Error(`B2 selected ${clubId} more than once in round one`);
        }
        observedByClub.set(clubId, observeTacticalAgencyTeamSelection(selectionInput, {
          clubId,
          fixture,
          squadIdentityKey,
        }));
      }
    }
    if (observedByClub.size !== clubIds.length) {
      throw new Error(
        `B2 selected ${observedByClub.size} of ${clubIds.length} clubs in ${competitionId}`,
      );
    }

    for (const clubId of clubIds) {
      const observed = observedByClub.get(clubId);
      const squadIdentityKey = identityKeyByClubId.get(clubId);
      if (observed === undefined || squadIdentityKey === undefined) {
        throw new Error(`B2 attribution join omitted ${clubId}`);
      }
      clubSelections.push({
        worldSeed: input.worldSeed,
        competitionId,
        clubId,
        squadIdentityKey,
        formationKey: observed.row.formationKey,
        bestStructuralScore: observed.row.bestStructuralScore,
        secondStructuralScore: observed.row.secondStructuralScore ?? "not_observed",
        tiedAtBestCount: observed.row.tiedAtBestCount,
        outOfPositionSlotCount: observed.row.outOfPositionSlotCount,
      });
    }

    for (const fixture of firstRound) {
      const homeObserved = observedByClub.get(fixture.homeClubId);
      const awayObserved = observedByClub.get(fixture.awayClubId);
      const homeIdentity = identityKeyByClubId.get(fixture.homeClubId);
      const awayIdentity = identityKeyByClubId.get(fixture.awayClubId);
      if (
        homeObserved === undefined
        || awayObserved === undefined
        || homeIdentity === undefined
        || awayIdentity === undefined
      ) {
        throw new Error(`B2 fixture ${fixture.id} has an unselected side`);
      }
      const homeContextId = `${input.worldSeed}|${competitionId}|${fixture.id}|home`;
      const awayContextId = `${input.worldSeed}|${competitionId}|${fixture.id}|away`;
      matchups.push(
        {
          contextId: homeContextId,
          worldSeed: input.worldSeed,
          competitionId,
          ownIdentityKey: homeIdentity,
          opponentIdentityKey: awayIdentity,
          ownFormationKey: homeObserved.row.formationKey,
          opponentFormationKey: awayObserved.row.formationKey,
          own: homeObserved.teamContext,
          opponent: awayObserved.teamContext,
        },
        {
          contextId: awayContextId,
          worldSeed: input.worldSeed,
          competitionId,
          ownIdentityKey: awayIdentity,
          opponentIdentityKey: homeIdentity,
          ownFormationKey: awayObserved.row.formationKey,
          opponentFormationKey: homeObserved.row.formationKey,
          own: awayObserved.teamContext,
          opponent: homeObserved.teamContext,
        },
      );
    }

    populationRows.push(conditionedPopulationRow({
      careerState,
      worldSeed: input.worldSeed,
      competitionId,
      clubIds,
      identityKeyByClubId,
      observedByClub,
    }));
  }

  return {
    worldSeed: input.worldSeed,
    matchups,
    clubSelections,
    populationRows,
    matchTacticsCalibrationVersion: world.matchTacticsCalibration.version,
    engineConfig: world.matchEngineConfig,
    matchTacticsCalibration: world.matchTacticsCalibration,
  };
}

/** Reads the frozen Step 06A opening row from the selections B2 already made. */
function conditionedPopulationRow(input: {
  readonly careerState: CliCareerState;
  readonly worldSeed: string;
  readonly competitionId: CliCompetitionId;
  readonly clubIds: readonly ClubId[];
  readonly identityKeyByClubId: ReadonlyMap<ClubId, string>;
  readonly observedByClub: ReadonlyMap<ClubId, ReturnType<typeof observeTacticalAgencyTeamSelection>>;
}): TacticalAgencyConditionedPopulationRow {
  const identityCounts: Record<string, number> = Object.fromEntries(
    GENERATED_SQUAD_IDENTITY_KEYS.map((key) => [key, 0]),
  );
  const formationCounts = new Map<string, number>();
  const shapesByIdentity = new Map<string, Map<string, number>>();
  let catalogOrderSensitiveSelectionCount = 0;
  let avoidableOutOfPositionSlotCount = 0;

  for (const clubId of input.clubIds) {
    const identity = input.identityKeyByClubId.get(clubId);
    const observed = input.observedByClub.get(clubId);
    if (identity === undefined || observed === undefined) {
      throw new Error(`B2 opening population omitted ${clubId}`);
    }
    identityCounts[identity] = (identityCounts[identity] ?? 0) + 1;
    formationCounts.set(
      observed.row.formationKey,
      (formationCounts.get(observed.row.formationKey) ?? 0) + 1,
    );
    const identityShapes = shapesByIdentity.get(identity) ?? new Map<string, number>();
    identityShapes.set(
      observed.row.formationKey,
      (identityShapes.get(observed.row.formationKey) ?? 0) + 1,
    );
    shapesByIdentity.set(identity, identityShapes);
    if (observed.row.tiedAtBestCount > 1) catalogOrderSensitiveSelectionCount += 1;
    avoidableOutOfPositionSlotCount += observed.row.outOfPositionSlotCount;
  }

  const modalFormations = [...shapesByIdentity.values()].map((counts) => {
    const modal = [...counts].sort(([leftKey, leftCount], [rightKey, rightCount]) =>
      rightCount - leftCount || leftKey.localeCompare(rightKey))[0];
    if (modal === undefined) throw new Error("B2 observed identity has no formation");
    return modal[0];
  });
  const topFormationCount = Math.max(0, ...formationCounts.values());
  const roles = summarizeTacticalAgencyPrimaryRoles(
    input.careerState,
    seniorPlayerIds(input.careerState, input.clubIds),
  );

  return {
    worldSeed: input.worldSeed,
    competitionId: String(input.competitionId),
    clubCount: input.clubIds.length,
    identityCounts,
    formationCounts: Object.fromEntries(
      [...formationCounts].sort(([left], [right]) => left.localeCompare(right)),
    ),
    identityMismatchCount: 0,
    primaryRolePositiveCount: roles.roleShares.filter(({ count }) => count > 0).length,
    distinctFormationCount: formationCounts.size,
    replicatedFormationCount: [...formationCounts.values()].filter((count) => count >= 2).length,
    topFormationShare: input.clubIds.length === 0 ? 0 : topFormationCount / input.clubIds.length,
    distinctIdentityModalFormationCount: new Set(modalFormations).size,
    catalogOrderSensitiveSelectionCount,
    avoidableOutOfPositionSlotCount,
  };
}

/**
 * The competition the before-state is measured in.
 *
 * The third division, because that is where a career starts and therefore what
 * a player actually meets first. It is declared here rather than taken as an
 * argument so two runs cannot quietly measure different populations.
 */
function observedCompetitionId(world: FakeDomesticWorld): CliCompetitionId {
  const competitionId = world.domesticCompetitionWorld.competitionIds[2];
  if (competitionId === undefined) {
    throw new Error(`Generated world has no third division: ${world.domesticCompetitionWorld.competitionIds.length}`);
  }

  return competitionId;
}

/**
 * Which squad identity generated each club of the observed division.
 *
 * Content assigns identities from one competition-scoped balanced deck.
 * `divisionClubIds` is the exact generation order, and the competition ID is
 * part of the canonical RNG key, so restarting club ordinals in another tier
 * cannot silently repeat the same sequence.
 *
 * Re-derived and then **checked against the squad it claims to describe**. A
 * re-derivation that drifted would mislabel every row while still producing a
 * full, plausible table - the one failure this checkpoint could not detect from
 * its own output. Verifying costs one comparison per club and converts a silent
 * wrong answer into a loud one.
 */
function squadIdentityKeyByClubId(
  world: FakeDomesticWorld,
  worldSeed: string,
  competitionId: CliCompetitionId,
  clubIds: readonly ClubId[],
): ReadonlyMap<ClubId, string> {
  const generationOrder = world.domesticCompetitionWorld.competitions[competitionId]?.clubIds ?? [];
  const assignments = assignGeneratedSquadIdentities({
    seed: worldSeed,
    competitionIdentityKey: competitionId,
    orderedClubIds: generationOrder,
  });
  const keyByClubId = new Map<ClubId, string>();

  for (const clubId of clubIds) {
    if (!generationOrder.includes(clubId)) {
      throw new Error(`Club ${clubId} is not in the observed division's generation order`);
    }

    const identity = assignments.get(clubId);
    if (identity === undefined) {
      throw new Error(`The canonical squad identity assignment omitted club ${clubId}`);
    }
    const squadPlayerIds = world.clubsById[clubId]?.playerIds ?? [];
    for (const [slotIndex, playerId] of squadPlayerIds.entries()) {
      const expected = squadIdentityPositionForSlot(identity, slotIndex + 1);
      const actual = world.players[playerId]?.naturalPositions[0];
      if (actual !== expected) {
        throw new Error(
          `Club ${clubId} slot ${slotIndex + 1} is ${String(actual)}, but identity `
            + `${identity.key} builds ${expected} there: the identity join is wrong`,
        );
      }
    }

    keyByClubId.set(clubId, identity.key);
  }

  return keyByClubId;
}

/** Every senior footballer on the observed competition's rosters, in club order. */
function seniorPlayerIds(
  careerState: CliCareerState,
  clubIds: readonly ClubId[],
): readonly PlayerId[] {
  const playerIds: PlayerId[] = [];
  for (const clubId of clubIds) {
    const club = careerState.gameState.clubs[clubId];
    if (club === undefined) continue;
    playerIds.push(...club.playerIds);
  }

  return playerIds;
}

/** One club re-built from one identity, and the shape it then chose. */
export interface TacticalAgencyCounterfactualRow {
  readonly clubId: ClubId;
  readonly squadIdentityKey: string;
  readonly formationKey: string;
}

/** The archetype-mix counterfactual for one world. */
export interface TacticalAgencyCounterfactualResult {
  readonly worldSeed: string;
  readonly rows: readonly TacticalAgencyCounterfactualRow[];
  /** Clubs tested. Each was re-built from all eight identities. */
  readonly clubCount: number;
  /** Clubs whose chosen shape was not the same under all eight identities. */
  readonly clubsWhoseShapeMoved: number;
  /** Distinct shapes each club produced across the eight identities, club order. */
  readonly distinctShapeCountByClub: readonly number[];
}

/**
 * Changes only the archetype mix and asks whether the chosen shape moves.
 *
 * Checkpoint A recorded "the absent roles cause the monoculture" as an
 * *inference*. Observing new roles and new shapes together does not discharge
 * it: both changed at once, so either could be the cause. This holds one squad's
 * quality fixed and varies nothing but the roles.
 *
 * Each of the club's twenty-two footballers keeps its ability, age, condition
 * and contract, and is re-roled to the position the candidate identity puts in
 * its slot. The role identity comes from content's own
 * `generatedRoleIdentityForPosition(...)`, so a re-roled footballer is the same
 * footballer content would have generated there - a hand-written role table here
 * would be a second copy free to disagree with generation.
 *
 * **This is a measurement construction and never a production path.** It builds
 * a career state that no career would ever reach, which is exactly what makes it
 * a controlled experiment rather than another observation.
 */
export function runTacticalAgencyArchetypeCounterfactual(input: {
  readonly worldSeed: string;
  readonly clubCount: number;
  readonly identityKeys: readonly string[];
}): TacticalAgencyCounterfactualResult {
  const world = createFakeDomesticWorld({ worldSeed: input.worldSeed });
  const careerState = careerStateFromNewWorld(careerSaveIdFor(input.worldSeed), world, input.worldSeed);
  const competitionId = observedCompetitionId(world);
  const clubIds = (world.domesticCompetitionWorld.competitions[competitionId]?.clubIds ?? [])
    .slice(0, input.clubCount);
  const calendar = generateRoundRobinCalendar({
    seed: input.worldSeed,
    seasonId: world.seasonId,
    competitionId,
    clubIds: world.domesticCompetitionWorld.competitions[competitionId]?.clubIds ?? [],
    seasonStartDate: world.seasonStartDate,
  });
  const fixture = calendar.fixtures[0];
  if (fixture === undefined) throw new Error(`Generated world produced no fixtures: ${input.worldSeed}`);

  const valuationConfig = selectPlayerValuationConfig(careerState.gameState.meta.calibrationVersions);
  const rows: TacticalAgencyCounterfactualRow[] = [];
  const distinctShapeCountByClub: number[] = [];
  let clubsWhoseShapeMoved = 0;

  for (const clubId of clubIds) {
    const shapes = new Set<string>();
    for (const squadIdentityKey of input.identityKeys) {
      const rebuilt = careerStateWithReRoledClub(careerState, world, clubId, squadIdentityKey);
      const selection = selectCareerAiTeam({
        careerState: rebuilt,
        clubId,
        fixture,
        policy: {
          roleWeights: world.roleWeights,
          tacticalDistribution: NEUTRAL_TACTICS,
          stateMultiplierCurves: world.stateMultiplierCurves,
          benchSize: BENCH_SIZE,
        },
        matchTacticsCalibration: world.matchTacticsCalibration,
        valuationConfig,
      });
      const formationKey = formationKeyOfLineup(selection.teamContext.lineup);
      shapes.add(formationKey);
      rows.push({ clubId, squadIdentityKey, formationKey });
    }
    distinctShapeCountByClub.push(shapes.size);
    if (shapes.size > 1) clubsWhoseShapeMoved += 1;
  }

  return {
    worldSeed: input.worldSeed,
    rows,
    clubCount: clubIds.length,
    clubsWhoseShapeMoved,
    distinctShapeCountByClub,
  };
}

/**
 * The squad skeleton every club shared before Phase 81A, slot `1` to `22`.
 *
 * **An analysis oracle and nothing else**, recovered from `positionForSlot(...)`
 * as it stood at commit `f850ccc^`. It exists so Checkpoint A2.1 can isolate
 * the chart component of Step 03A. The footballers keep ability vectors
 * generated from their Phase 81A roles, so this oracle does not recreate the
 * complete pre-81A population.
 *
 * It must never gain a generation caller. Its removal owner is the Phase 81A
 * closeout report, which deletes it once the guardrail has an owner.
 */
export type TacticalAgencySquadChart = readonly [
  PlayerPosition, PlayerPosition, PlayerPosition, PlayerPosition, PlayerPosition,
  PlayerPosition, PlayerPosition, PlayerPosition, PlayerPosition, PlayerPosition,
  PlayerPosition, PlayerPosition, PlayerPosition, PlayerPosition, PlayerPosition,
  PlayerPosition, PlayerPosition, PlayerPosition, PlayerPosition, PlayerPosition,
  PlayerPosition, PlayerPosition,
];

export const PRE_PHASE_81A_SQUAD_SKELETON = [
  "gk", "rb", "cb", "cb", "lb", "cm", "cm", "rw", "lw", "st", "st",
  "gk", "cb", "cb", "cm", "st", "cb", "cb", "rwb", "lwb", "st", "st",
] as const satisfies TacticalAgencySquadChart;

/** Rebuilds one club's twenty-two footballers onto another identity's chart. */
function careerStateWithReRoledClub(
  careerState: CliCareerState,
  world: FakeDomesticWorld,
  clubId: ClubId,
  squadIdentityKey: string,
): CliCareerState {
  const identity = GENERATED_SQUAD_IDENTITIES[squadIdentityKey as GeneratedSquadIdentityKey];
  if (identity === undefined) throw new Error(`Unknown squad identity: ${squadIdentityKey}`);

  return careerStateWithReRoledClubs(careerState, world, [clubId], (slotNumber) =>
    squadIdentityPositionForSlot(identity, slotNumber));
}

/**
 * Rebuilds several clubs onto a caller-supplied chart, quality untouched.
 *
 * Every footballer keeps its ability, age, condition and contract; only the
 * position and the role identity derived from it change. That is what makes an
 * arm of A2.1 a coupled chart comparison: both arms keep the same twenty-two
 * Phase 81A-generated footballers and differ only in where they are asked to
 * play. It does not reconstruct role-conditioned legacy abilities.
 */
function careerStateWithReRoledClubs(
  careerState: CliCareerState,
  world: FakeDomesticWorld,
  clubIds: readonly ClubId[],
  positionForSlot: (slotNumber: number) => PlayerPosition,
): CliCareerState {
  const players = { ...careerState.gameState.players };

  for (const clubId of clubIds) {
    for (const [slotIndex, playerId] of (world.clubsById[clubId]?.playerIds ?? []).entries()) {
      const player = players[playerId];
      if (player === undefined) continue;
      const position = positionForSlot(slotIndex + 1);
      const roleIdentity = generatedRoleIdentityForPosition(position);
      players[playerId] = {
        ...player,
        naturalPositions: [position],
        primaryRole: roleIdentity.primaryRole,
        archetype: roleIdentity.archetype,
        naturalRoles: roleIdentity.naturalRoles,
        adaptedRoles: roleIdentity.adaptedRoles,
        weakRoles: roleIdentity.weakRoles,
      };
    }
  }

  return { ...careerState, gameState: { ...careerState.gameState, players } };
}

/** Reads the catalog key back off the slot IDs the selector stamped. */
function formationKeyOfLineup(lineup: readonly { readonly slotId: string }[]): string {
  const firstSlot = lineup[0];
  if (firstSlot === undefined) return "";
  const separatorIndex = firstSlot.slotId.indexOf(":");

  return separatorIndex === -1 ? firstSlot.slotId : firstSlot.slotId.slice(0, separatorIndex);
}

/** Save identity for a throwaway measurement career, stable per world seed. */
function careerSaveIdFor(worldSeed: string): CliSaveId {
  return `save:agency-${worldSeed}` as CliSaveId;
}

/**
 * The instruction set every AI club deviates from.
 *
 * Neutral on every knob, because the before-state measures what the *shape*
 * chooser does. `deriveShapeTacticalDistribution(...)` moves each club away from
 * this according to the shape it picked, which is the tactic distribution the
 * step asks for.
 */
const NEUTRAL_TACTICS = {
  directness: 0.5,
  pressing: 0.5,
  width: 0.5,
  risk: 0.5,
  mentality: "balanced",
} as const;

/** Bench size the career path uses, so selection pressure matches a real match. */
const BENCH_SIZE = 8;

/**
 * Builds the paired low-block reading from one generated world.
 *
 * Two real clubs from the observed competition, both selected by the production
 * career path, so the elevens are ones a career would field rather than a
 * synthesised pair. Only the instruction under test differs between arms; the
 * seeds, the elevens, the opponent and the venue rotation are shared.
 *
 * The block itself is the extreme legal setting on every knob that shuts a game
 * down: deep, narrow, patient, low-risk. Reading it against the neutral plan is
 * what gives Step 05 an xG before-state instead of the occasion-volume figures,
 * which cannot tell fewer chances from worse ones.
 */
export function buildTacticalAgencyLowBlockInput(input: {
  readonly worldSeed: string;
  readonly seedPrefix: string;
  readonly pairedSeedCount: number;
  /**
   * Re-roles every observed club onto this chart before selecting.
   *
   * Checkpoint A2.1's control arm. Absent means the population as generated,
   * which is the arm every other caller wants.
   */
  readonly reRoleAllClubsTo?: TacticalAgencySquadChart;
}): TacticalAgencyLowBlockSeriesInput {
  const world = createFakeDomesticWorld({ worldSeed: input.worldSeed });
  const generatedCareerState = careerStateFromNewWorld(
    careerSaveIdFor(input.worldSeed),
    world,
    input.worldSeed,
  );
  const competitionId = observedCompetitionId(world);
  const clubIds = world.domesticCompetitionWorld.competitions[competitionId]?.clubIds ?? [];
  const calendar = generateRoundRobinCalendar({
    seed: input.worldSeed,
    seasonId: world.seasonId,
    competitionId,
    clubIds,
    seasonStartDate: world.seasonStartDate,
  });

  const fixture = calendar.fixtures[0];
  if (fixture === undefined) {
    throw new Error(`Generated world produced no fixtures: ${input.worldSeed}`);
  }

  const skeleton = input.reRoleAllClubsTo;
  const careerState = skeleton === undefined
    ? generatedCareerState
    : careerStateWithReRoledClubs(generatedCareerState, world, clubIds, (slotNumber) => {
        const position = skeleton[slotNumber - 1];
        if (position === undefined) {
          throw new Error(`Re-role chart has no slot ${slotNumber}; exactly 22 are required`);
        }

        return position;
      });
  const valuationConfig = selectPlayerValuationConfig(careerState.gameState.meta.calibrationVersions);
  const select = (clubId: ClubId) =>
    selectCareerAiTeam({
      careerState,
      clubId,
      fixture,
      policy: {
        roleWeights: world.roleWeights,
        tacticalDistribution: NEUTRAL_TACTICS,
        stateMultiplierCurves: world.stateMultiplierCurves,
        benchSize: BENCH_SIZE,
      },
      matchTacticsCalibration: world.matchTacticsCalibration,
      valuationConfig,
    }).teamContext;

  return {
    own: select(fixture.homeClubId),
    opponent: select(fixture.awayClubId),
    neutralTactics: NEUTRAL_TACTICS,
    lowBlockTactics: LOW_BLOCK_TACTICS,
    engineConfig: world.matchEngineConfig,
    matchTacticsCalibration: world.matchTacticsCalibration,
    fixtureId: fixture.id,
    seedPrefix: input.seedPrefix,
    pairedSeedCount: input.pairedSeedCount,
  };
}

/**
 * The most shut-down plan the knob caps allow.
 *
 * Every knob at the end of its range that takes football out of the game: short,
 * narrow, passive, cautious. Deliberately extreme, because the question is what
 * the block *can* buy at its limit, not what a moderate one buys.
 */
const LOW_BLOCK_TACTICS = {
  directness: 0,
  pressing: 0,
  width: 0,
  risk: 0,
  mentality: "very_defensive",
} as const;

/** Runs one world in its own thread. */
export function runTacticalAgencyWorldInWorker(
  input: TacticalAgencyWorldInput,
): Promise<TacticalAgencyWorldResult> {
  return new Promise((resolve, reject) => {
    const worker = new Worker(new URL("./tactical-agency-world.ts", import.meta.url), { workerData: input });

    worker.once("message", (message: TacticalAgencyWorkerMessage) => {
      if (message.ok) {
        resolve(message.result);
        return;
      }
      reject(new Error(message.message));
    });
    worker.once("error", reject);
    worker.once("exit", (code) => {
      if (code !== 0) reject(new Error(`Tactical agency worker exited with code ${code}`));
    });
  });
}

/** Narrows the untyped worker payload before this module runs as a worker entry. */
function isTacticalAgencyWorldInput(value: unknown): value is TacticalAgencyWorldInput {
  if (typeof value !== "object" || value === null) return false;
  const candidate = value as Partial<TacticalAgencyWorldInput>;

  return typeof candidate.worldSeed === "string" && typeof candidate.roundCount === "number";
}

if (!isMainThread) {
  try {
    if (!isTacticalAgencyWorldInput(workerData)) {
      throw new Error("Tactical agency worker received an unusable payload");
    }
    parentPort?.postMessage({ ok: true, result: runTacticalAgencyWorld(workerData) });
  } catch (error) {
    parentPort?.postMessage({
      ok: false,
      message: error instanceof Error ? error.message : String(error),
    });
  }
}
