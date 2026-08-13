import { isMainThread, parentPort, Worker, workerData } from "node:worker_threads";

import {
  createFakeDomesticWorld,
  GENERATED_SQUAD_IDENTITY_KEYS,
  selectPlayerValuationConfig,
} from "@game/content";
import { generateRoundRobinCalendar } from "@game/engine";
import {
  attributeOwnSquadAgencyTranslation,
  evaluateOwnSquadAgencyTranslationSet,
  evaluateOwnSquadAgencySet,
  observeTacticalAgencyTeamSelection,
  runOwnSquadAgencySchedule,
  type OwnSquadAgencyScheduleResult,
  type OwnSquadAgencySetResult,
  type OwnSquadAgencyTranslationAttribution,
  type TacticalShapeInvariantResult,
} from "@game/simulation-tools";

import { careerStateFromNewWorld } from "../career/scenarios.ts";
import type { ClubId } from "../career/types.ts";
import { createTacticalShapeSectionFacts } from "./tactical-shape-section.ts";
import { createOwnSquadAgencyHistoricalGuardrailFacts } from "./career-sections.ts";
import { evaluateLeagueDiversityOpeningGate, type LeagueDiversityOpeningGateVerdict } from "./league-diversity-gate.ts";
import {
  TACTICAL_AGENCY_BENCH_SIZE,
  careerSaveIdFor,
  conditionedPopulationRow,
  observedCompetitionId,
  runTacticalAgencyArchetypeCounterfactual,
  squadIdentityKeyByClubId,
} from "./tactical-agency-world.ts";

/** Frozen independently decided Checkpoint D2 populations. */
export const OWN_SQUAD_AGENCY_SEED_SETS = [
  { setName: "d2-c", seedPrefix: "phase81a-specialised-own-squad-c" },
  { setName: "d2-d", seedPrefix: "phase81a-specialised-own-squad-d" },
] as const;

const OWN_SQUAD_AGENCY_WORLD_COUNT = 7;
const OWN_SQUAD_AGENCY_PAIRED_SEED_COUNT = 8;

/** One worker's real-world selection, structural and paired-match facts. */
export interface OwnSquadAgencyWorldResult {
  readonly worldSeed: string;
  readonly schedules: readonly OwnSquadAgencyScheduleResult[];
  readonly openingGate: LeagueDiversityOpeningGateVerdict;
  readonly matchTacticsCalibrationVersion: string;
}

interface OwnSquadAgencyWorldInput {
  readonly worldSeed: string;
  readonly matchSeedPrefix: string;
}

interface OwnSquadAgencyWorkerEnvelope {
  readonly workerKind: "own_squad_agency_world";
  readonly input: OwnSquadAgencyWorldInput;
}

type OwnSquadAgencyWorkerMessage =
  | { readonly ok: true; readonly result: OwnSquadAgencyWorldResult }
  | { readonly ok: false; readonly message: string };

/** Complete report facts for the locked Checkpoint D2 profile. */
export interface OwnSquadAgencySectionFacts {
  readonly sets: readonly OwnSquadAgencySetResult[];
  readonly openingGates: Readonly<Record<string, readonly LeagueDiversityOpeningGateVerdict[]>>;
  readonly historicalFootball: Readonly<Record<string, Awaited<ReturnType<typeof createOwnSquadAgencyHistoricalGuardrailFacts>>>>;
  readonly noDominantInvariants: readonly TacticalShapeInvariantResult[];
  readonly decision: "GO" | "REFINE" | "STOP_RETHINK";
  readonly execution: {
    readonly workerCount: 7;
    readonly worldCountPerSet: 7;
    readonly pairedSeedCount: 8;
    readonly elapsedMilliseconds: number;
  };
  readonly calibrationVersions: Readonly<Record<string, string>>;
  readonly worldSeeds: readonly string[];
}

/** Focused D2 match-translation facts without a repeated historical career. */
export interface OwnSquadAgencyTranslationAttributionFacts {
  readonly sets: readonly ReturnType<typeof evaluateOwnSquadAgencyTranslationSet>[];
  readonly attribution: OwnSquadAgencyTranslationAttribution;
  readonly execution: {
    readonly workerCount: 7;
    readonly worldCountPerSet: 7;
    readonly pairedSeedCount: 8;
    readonly elapsedMilliseconds: number;
  };
  readonly calibrationVersions: Readonly<Record<string, string>>;
  readonly worldSeeds: readonly string[];
}

interface OwnSquadAgencyFocusedSet {
  readonly setName: string;
  readonly worldSeeds: readonly string[];
  readonly worlds: readonly OwnSquadAgencyWorldResult[];
}

/** Runs both locked sets serially; each set owns one seven-worker pool. */
export async function createOwnSquadAgencySectionFacts(input: {
  readonly workerCount: number;
}): Promise<OwnSquadAgencySectionFacts> {
  if (input.workerCount !== 7) {
    throw new Error(`Checkpoint D2 requires exactly 7 workers, received ${input.workerCount}`);
  }
  const startedAt = performance.now();
  const noDominantInvariants = createTacticalShapeSectionFacts().report.invariants.filter(
    ({ key }) => key === "no_dominant_composition"
      || key === "no_dominant_formation"
      || key === "no_dominant_tactic",
  );
  const noDominantReadersHeld = noDominantInvariants.length === 3
    && noDominantInvariants.every(({ status }) => status === "pass");
  const focusedSets = await runOwnSquadAgencyFocusedSets(input.workerCount);
  const sets: OwnSquadAgencySetResult[] = [];
  const openingGates: Record<string, readonly LeagueDiversityOpeningGateVerdict[]> = {};
  const historicalFootball: Record<
    string,
    Awaited<ReturnType<typeof createOwnSquadAgencyHistoricalGuardrailFacts>>
  > = {};
  const versions = new Set<string>();
  const allWorldSeeds: string[] = [];

  for (const focused of focusedSets) {
    const { setName, worldSeeds, worlds } = focused;
    allWorldSeeds.push(...worldSeeds);
    for (const world of worlds) versions.add(world.matchTacticsCalibrationVersion);
    const setOpeningGates = worlds.map(({ openingGate }) => openingGate);
    openingGates[setName] = setOpeningGates;
    const historical = await createOwnSquadAgencyHistoricalGuardrailFacts({
      worldSeeds,
      workerCount: input.workerCount,
    });
    historicalFootball[setName] = historical;
    const counterfactual = runTacticalAgencyArchetypeCounterfactual({
      worldSeed: worldSeeds[0] as string,
      clubCount: 6,
      identityKeys: GENERATED_SQUAD_IDENTITY_KEYS,
    });
    const guardrailFailures = [
      ...setOpeningGates.flatMap(({ held, failedGateKeys, worldSeed }) =>
        held ? [] : failedGateKeys.map((key) => `a2:${worldSeed}:${key}`)),
      ...(!noDominantReadersHeld
        ? noDominantInvariants.filter(({ status }) => status !== "pass").map(({ key }) => key)
        : []),
      ...historical.failed.map((key) => `historical:${key}`),
    ];
    sets.push(evaluateOwnSquadAgencySet({
      setName,
      worldSeeds,
      schedules: worlds.flatMap(({ schedules }) => schedules),
      declaredIdentityKeys: GENERATED_SQUAD_IDENTITY_KEYS,
      constantQualityPolicyMoves: counterfactual.clubsWhosePolicyMoved,
      constantQualityClubCount: counterfactual.clubCount,
      guardrails: {
        a2FormationAndRoleHeld: setOpeningGates.every(({ held }) => held),
        noDominantReadersHeld,
        historicalFootballHeld: historical.held,
        renewal: "not_evaluated",
        failed: guardrailFailures,
      },
    }));
  }

  if (versions.size !== 1) {
    throw new Error(`Checkpoint D2 worlds disagree about match-tactics calibration: ${[...versions].join(", ")}`);
  }
  const decision = sets.some(({ decision: setDecision }) => setDecision === "STOP_RETHINK")
    ? "STOP_RETHINK" as const
    : sets.every(({ decision: setDecision }) => setDecision === "GO")
      ? "GO" as const
      : "REFINE" as const;
  return {
    sets,
    openingGates,
    historicalFootball,
    noDominantInvariants,
    decision,
    execution: {
      workerCount: 7,
      worldCountPerSet: 7,
      pairedSeedCount: 8,
      elapsedMilliseconds: performance.now() - startedAt,
    },
    calibrationVersions: { matchTactics: [...versions][0] as string },
    worldSeeds: allWorldSeeds,
  };
}

/**
 * Runs only the paired D2 match population. Historical careers were already
 * decided by Step 12C and cannot help locate a match-translation stage.
 */
export async function createOwnSquadAgencyTranslationAttributionFacts(input: {
  readonly workerCount: number;
}): Promise<OwnSquadAgencyTranslationAttributionFacts> {
  if (input.workerCount !== 7) {
    throw new Error(`Checkpoint D2 attribution requires exactly 7 workers, received ${input.workerCount}`);
  }
  const startedAt = performance.now();
  const focusedSets = await runOwnSquadAgencyFocusedSets(input.workerCount);
  const versions = new Set<string>();
  const worldSeeds: string[] = [];
  const sets = focusedSets.map(({ setName, worldSeeds: setWorldSeeds, worlds }) => {
    worldSeeds.push(...setWorldSeeds);
    for (const world of worlds) versions.add(world.matchTacticsCalibrationVersion);
    return evaluateOwnSquadAgencyTranslationSet({
      setName,
      schedules: worlds.flatMap(({ schedules }) => schedules),
    });
  });
  if (versions.size !== 1) {
    throw new Error(
      `Checkpoint D2 attribution worlds disagree about match-tactics calibration: ${[...versions].join(", ")}`,
    );
  }
  return {
    sets,
    attribution: attributeOwnSquadAgencyTranslation(sets),
    execution: {
      workerCount: 7,
      worldCountPerSet: 7,
      pairedSeedCount: 8,
      elapsedMilliseconds: performance.now() - startedAt,
    },
    calibrationVersions: { matchTactics: [...versions][0] as string },
    worldSeeds,
  };
}

/** Shares the exact focused population between D2 and its attribution retry. */
async function runOwnSquadAgencyFocusedSets(workerCount: number): Promise<readonly OwnSquadAgencyFocusedSet[]> {
  if (workerCount !== 7) {
    throw new Error(`Checkpoint D2 focused population requires exactly 7 workers, received ${workerCount}`);
  }
  const sets: OwnSquadAgencyFocusedSet[] = [];
  for (const seedSet of OWN_SQUAD_AGENCY_SEED_SETS) {
    const worldSeeds = worldSeedsFor(seedSet.seedPrefix);
    const worlds = await Promise.all(worldSeeds.map((worldSeed) => runOwnSquadAgencyWorldInWorker({
      worldSeed,
      matchSeedPrefix: `${seedSet.seedPrefix}-paired-v1`,
    })));
    sets.push({ setName: seedSet.setName, worldSeeds, worlds });
  }
  return sets;
}

/** Builds one world and evaluates exactly one club per declared identity. */
export function runOwnSquadAgencyWorld(input: OwnSquadAgencyWorldInput): OwnSquadAgencyWorldResult {
  const world = createFakeDomesticWorld({ worldSeed: input.worldSeed });
  const careerState = careerStateFromNewWorld(careerSaveIdFor(input.worldSeed), world, input.worldSeed);
  const competitionId = observedCompetitionId(world);
  const clubIds = world.domesticCompetitionWorld.competitions[competitionId]?.clubIds ?? [];
  const calendar = generateRoundRobinCalendar({
    seed: input.worldSeed,
    seasonId: world.seasonId,
    competitionId,
    clubIds,
    seasonStartDate: world.seasonStartDate,
  });
  const identityByClubId = squadIdentityKeyByClubId(
    world,
    input.worldSeed,
    competitionId,
    clubIds,
  );
  const selectedClubIds = firstClubByIdentity(identityByClubId, GENERATED_SQUAD_IDENTITY_KEYS);
  const valuationConfig = selectPlayerValuationConfig(careerState.gameState.meta.calibrationVersions);
  const observedByFixtureAndClub = new Map<
    string,
    ReturnType<typeof observeTacticalAgencyTeamSelection>
  >();
  const observe = (fixture: typeof calendar.fixtures[number], clubId: ClubId) => {
    const key = `${fixture.id}|${clubId}`;
    const existing = observedByFixtureAndClub.get(key);
    if (existing !== undefined) return existing;
    const squadIdentityKey = identityByClubId.get(clubId);
    if (squadIdentityKey === undefined) throw new Error(`Checkpoint D2 identity join omitted ${clubId}`);
    const produced = observeTacticalAgencyTeamSelection({
      careerState,
      policy: {
        roleWeights: world.roleWeights,
        stateMultiplierCurves: world.stateMultiplierCurves,
        benchSize: TACTICAL_AGENCY_BENCH_SIZE,
      },
      matchTacticsCalibration: world.matchTacticsCalibration,
      valuationConfig,
    }, { clubId, fixture, squadIdentityKey });
    observedByFixtureAndClub.set(key, produced);
    return produced;
  };

  const openingByClub = new Map<ClubId, ReturnType<typeof observeTacticalAgencyTeamSelection>>();
  for (const clubId of clubIds) {
    const firstFixture = calendar.fixtures.find((fixture) =>
      fixture.homeClubId === clubId || fixture.awayClubId === clubId);
    if (firstFixture === undefined) throw new Error(`Checkpoint D2 club ${clubId} has no fixture`);
    openingByClub.set(clubId, observe(firstFixture, clubId));
  }
  const openingRow = conditionedPopulationRow({
    careerState,
    worldSeed: input.worldSeed,
    competitionId,
    clubIds,
    identityKeyByClubId: identityByClubId,
    observedByClub: openingByClub,
  });
  const schedules = selectedClubIds.map((clubId) => {
    const squadIdentityKey = identityByClubId.get(clubId);
    if (squadIdentityKey === undefined) throw new Error(`Checkpoint D2 sampled club has no identity: ${clubId}`);
    const fixtures = calendar.fixtures.filter((fixture) =>
      fixture.homeClubId === clubId || fixture.awayClubId === clubId);
    return runOwnSquadAgencySchedule({
      scheduleId: `${input.worldSeed}|${clubId}`,
      worldSeed: input.worldSeed,
      clubId,
      squadIdentityKey,
      fixtures: fixtures.map((fixture) => {
        const controlledSide = fixture.homeClubId === clubId ? "home" as const : "away" as const;
        const opponentId = controlledSide === "home" ? fixture.awayClubId : fixture.homeClubId;
        const controlled = observe(fixture, clubId);
        const opponent = observe(fixture, opponentId);
        return {
          fixtureId: fixture.id,
          formationKey: controlled.row.formationKey,
          controlledSide,
          controlled: controlled.teamContext,
          opponent: opponent.teamContext,
          opponentLateralFocus: opponent.tacticalPolicy.ownFit.lateralFocus,
          evaluation: controlled.tacticalPolicy,
        };
      }),
      engineConfig: world.matchEngineConfig,
      matchTacticsCalibration: world.matchTacticsCalibration,
      matchSeedPrefix: input.matchSeedPrefix,
      pairedSeedCount: OWN_SQUAD_AGENCY_PAIRED_SEED_COUNT,
    });
  });

  return {
    worldSeed: input.worldSeed,
    schedules,
    openingGate: evaluateLeagueDiversityOpeningGate(openingRow),
    matchTacticsCalibrationVersion: world.matchTacticsCalibration.version,
  };
}

/** Selects the first stable club ID for every identity and refuses gaps. */
export function firstClubByIdentity(
  identityByClubId: ReadonlyMap<ClubId, string>,
  declaredIdentityKeys: readonly string[],
): readonly ClubId[] {
  const clubIds = [...identityByClubId.keys()].toSorted((left, right) => String(left).localeCompare(String(right)));
  return declaredIdentityKeys.map((identity) => {
    const clubId = clubIds.find((candidate) => identityByClubId.get(candidate) === identity);
    if (clubId === undefined) throw new Error(`Checkpoint D2 did not observe squad identity ${identity}`);
    return clubId;
  });
}

function worldSeedsFor(seedPrefix: string): readonly string[] {
  return Array.from(
    { length: OWN_SQUAD_AGENCY_WORLD_COUNT },
    (_unused, index) => `${seedPrefix}-${String(index + 1).padStart(3, "0")}`,
  );
}

function runOwnSquadAgencyWorldInWorker(
  input: OwnSquadAgencyWorldInput,
): Promise<OwnSquadAgencyWorldResult> {
  return new Promise((resolve, reject) => {
    const worker = new Worker(new URL("./own-squad-agency-section.ts", import.meta.url), {
      workerData: { workerKind: "own_squad_agency_world", input } satisfies OwnSquadAgencyWorkerEnvelope,
    });
    worker.once("message", (message: OwnSquadAgencyWorkerMessage) => {
      if (message.ok) resolve(message.result);
      else reject(new Error(message.message));
    });
    worker.once("error", reject);
    worker.once("exit", (code) => {
      if (code !== 0) reject(new Error(`Own-squad agency worker exited with code ${code}`));
    });
  });
}

function isOwnSquadAgencyWorkerEnvelope(value: unknown): value is OwnSquadAgencyWorkerEnvelope {
  if (typeof value !== "object" || value === null) return false;
  const candidate = value as Partial<OwnSquadAgencyWorkerEnvelope>;
  const input = candidate.input;
  return candidate.workerKind === "own_squad_agency_world"
    && typeof input === "object"
    && input !== null
    && typeof input.worldSeed === "string"
    && typeof input.matchSeedPrefix === "string";
}

if (!isMainThread && ownSquadWorkerKind(workerData) === "own_squad_agency_world") {
  try {
    if (!isOwnSquadAgencyWorkerEnvelope(workerData)) {
      throw new Error("Own-squad agency worker received an unusable payload");
    }
    parentPort?.postMessage({ ok: true, result: runOwnSquadAgencyWorld(workerData.input) });
  } catch (error) {
    parentPort?.postMessage({
      ok: false,
      message: error instanceof Error ? error.message : String(error),
    });
  }
}

function ownSquadWorkerKind(value: unknown): unknown {
  return typeof value === "object" && value !== null && "workerKind" in value
    ? value.workerKind
    : undefined;
}
