import { createFakeDomesticWorld, type FakeDomesticWorld } from "@game/content";
import { buildTacticTeamContext, FORMATION_CATALOG, type TeamStrength } from "@game/engine";
import {
  runTacticalShapeAudit,
  type TacticalShapeAuditReport,
  type TacticalShapeQualityBand,
  type TacticalShapeQualityBands,
} from "@game/simulation-tools";

/** Default world seed used to measure the quality bands. */
export const DEFAULT_TACTICAL_SHAPE_WORLD_SEED = "phase81-tactical-shape-baseline";

/** Default seed prefix for every audit series. */
export const DEFAULT_TACTICAL_SHAPE_SEED_PREFIX = "phase81-tactical-shape";

/** Default seed pairs per dominance-matrix cell. */
export const DEFAULT_TACTICAL_SHAPE_PAIRED_SEEDS = 8;

/** Default seed pairs per named scenario and versus-reference row. */
export const DEFAULT_TACTICAL_SHAPE_SCENARIO_PAIRED_SEEDS = 400;

/** Input accepted by the content-aware tactical-shape report bridge. */
export interface CreateTacticalShapeReportInput {
  /** World seed whose generated squads supply the measured quality bands. */
  readonly worldSeed?: string;
  /** Seed prefix for every audit series. */
  readonly seedPrefix?: string;
  /** Seed pairs per dominance-matrix cell. */
  readonly pairedSeedCount?: number;
  /** Seed pairs per named scenario and versus-reference row. */
  readonly scenarioPairedSeedCount?: number;
}

/** A measured band together with the generated club it was taken from. */
export interface TacticalShapeMeasuredBand {
  /** The band handed to the audit. */
  readonly band: TacticalShapeQualityBand;
  /** Generated club the band was measured from, for traceability. */
  readonly clubId: string;
  /** That club's rank inside its division, best first, one-based. */
  readonly divisionRank: number;
  /** Clubs in that division. */
  readonly divisionSize: number;
}

/** The full set of measured bands plus the world they came from. */
export interface TacticalShapeMeasuredBands {
  /** World seed the measurement used. */
  readonly worldSeed: string;
  /** Bands in the shape the audit consumes. */
  readonly bands: TacticalShapeQualityBands;
  /** Provenance for every measured band, keyed by band key. */
  readonly provenance: Readonly<Record<string, TacticalShapeMeasuredBand>>;
}

/** Complete report plus the measurement provenance behind its bands. */
export interface TacticalShapeReportBundle {
  /** The deterministic audit report. */
  readonly report: TacticalShapeAuditReport;
  /** How the quality bands were measured. */
  readonly measurement: TacticalShapeMeasuredBands;
}

/**
 * Runs the tactical-shape baseline against measured generated squads.
 *
 * `simulation-tools` owns the content-free audit while this adapter owns the
 * deliberate dependency on generated content. The quality bands are measured
 * from the current generator rather than assumed, which is what makes the
 * frozen quality-versus-structure numbers meaningful.
 */
export function createTacticalShapeReport(
  input: CreateTacticalShapeReportInput = {},
): TacticalShapeReportBundle {
  const worldSeed = input.worldSeed ?? DEFAULT_TACTICAL_SHAPE_WORLD_SEED;
  const world = createFakeDomesticWorld({ worldSeed });
  const measurement = measureQualityBandsFrom(world, worldSeed);

  return {
    measurement,
    report: runTacticalShapeAudit({
      engineConfig: world.matchEngineConfig,
      bands: measurement.bands,
      seedPrefix: input.seedPrefix ?? DEFAULT_TACTICAL_SHAPE_SEED_PREFIX,
      pairedSeedCount: input.pairedSeedCount ?? DEFAULT_TACTICAL_SHAPE_PAIRED_SEEDS,
      scenarioPairedSeedCount:
        input.scenarioPairedSeedCount ?? DEFAULT_TACTICAL_SHAPE_SCENARIO_PAIRED_SEEDS,
    }),
  };
}

/**
 * Measures per-department squad quality for the divisions the audit needs.
 *
 * Every club's generated first-choice eleven is put through the production
 * `buildTacticTeamContext`, so the recorded department scores are the ones the
 * match engine would actually see. Dynamic state is deliberately excluded: the
 * bands describe squad quality, not matchday fitness.
 */
export function measureTacticalShapeQualityBands(worldSeed: string): TacticalShapeMeasuredBands {
  return measureQualityBandsFrom(createFakeDomesticWorld({ worldSeed }), worldSeed);
}

function measureQualityBandsFrom(world: FakeDomesticWorld, worldSeed: string): TacticalShapeMeasuredBands {
  const firstDivision = rankDivision(world, "first_division");
  const secondDivision = rankDivision(world, "second_division");
  const thirdDivision = rankDivision(world, "third_division");

  const firstDivisionContender = pick(firstDivision, 0, "first_division_contender");
  const firstDivisionAdjacent = pick(firstDivision, 1, "first_division_adjacent");
  const firstDivisionModest = pick(firstDivision, medianIndex(firstDivision), "first_division_modest");
  const secondDivisionMidTable = pick(secondDivision, medianIndex(secondDivision), "second_division_mid_table");
  const thirdDivisionMidTable = pick(thirdDivision, medianIndex(thirdDivision), "third_division_mid_table");
  const reference = flattenToUniformBand(firstDivisionModest, "reference");

  const measured = [
    reference,
    firstDivisionContender,
    firstDivisionAdjacent,
    firstDivisionModest,
    secondDivisionMidTable,
    thirdDivisionMidTable,
  ];

  return {
    worldSeed,
    bands: {
      reference: reference.band,
      firstDivisionContender: firstDivisionContender.band,
      firstDivisionAdjacent: firstDivisionAdjacent.band,
      firstDivisionModest: firstDivisionModest.band,
      secondDivisionMidTable: secondDivisionMidTable.band,
      thirdDivisionMidTable: thirdDivisionMidTable.band,
    },
    provenance: Object.fromEntries(measured.map((entry) => [entry.band.bandKey, entry])),
  };
}

type DivisionCategory = "first_division" | "second_division" | "third_division";
type DomesticClubId = FakeDomesticWorld["clubIds"][number];

interface RankedClub {
  readonly clubId: DomesticClubId;
  readonly strength: TeamStrength;
  readonly divisionSize: number;
}

/**
 * Orders one division by the real team strength of its generated eleven.
 *
 * Ranking by measurement rather than by generated order is what lets the report
 * claim it compared a title contender with a mid-table side.
 */
function rankDivision(world: FakeDomesticWorld, category: DivisionCategory): readonly RankedClub[] {
  const clubIds = world.divisionClubIds[category];
  const ranked = clubIds
    .map((clubId) => ({
      clubId,
      strength: measureClubStrength(world, clubId),
      divisionSize: clubIds.length,
    }))
    .sort((left, right) => right.strength.overall - left.strength.overall);

  if (ranked.length < 2) {
    throw new Error(`Division ${category} generated ${ranked.length} clubs; the audit needs at least two`);
  }

  return ranked;
}

function measureClubStrength(world: FakeDomesticWorld, clubId: DomesticClubId): TeamStrength {
  const formation = FORMATION_CATALOG["4-4-2"];
  const generatedLineup = world.lineupsByClubId[clubId];

  if (generatedLineup === undefined || generatedLineup.length !== formation.slots.length) {
    throw new Error(`Generated club cannot supply a complete eleven: ${String(clubId)}`);
  }

  return buildTacticTeamContext({
    lineup: {
      clubId,
      slots: formation.slots.map((slot, index) => {
        const generatedSlot = generatedLineup[index];
        if (generatedSlot === undefined) {
          throw new Error(`Generated lineup is missing slot ${index + 1}: ${String(clubId)}`);
        }
        return { slotKey: slot.slotKey, playerId: generatedSlot.playerId, canonicalRole: slot.playerRole };
      }),
    },
    tactic: { mentality: "balanced", pressing: 0.5, directness: 0.5, width: 0.5, risk: 0.5 },
    requiredLineupSize: formation.slots.length,
    players: world.players,
    roleWeights: world.roleWeights,
  }).strength;
}

function pick(division: readonly RankedClub[], index: number, bandKey: string): TacticalShapeMeasuredBand {
  const club = division[index];
  if (club === undefined) {
    throw new Error(`Division has no club at rank ${index + 1} for band ${bandKey}`);
  }

  return {
    band: {
      bandKey,
      goalkeeper: round(club.strength.goalkeeper),
      defense: round(club.strength.defense),
      midfield: round(club.strength.midfield),
      attack: round(club.strength.attack),
    },
    clubId: String(club.clubId),
    divisionRank: index + 1,
    divisionSize: club.divisionSize,
  };
}

/**
 * Collapses one measured band into a single value used in every department.
 *
 * The structural comparisons put the same band on both sides, so any band would
 * do. A uniform one is used anyway, because it makes "equal quality" mean one
 * number rather than four and removes any argument about which department a
 * structural effect came from.
 */
function flattenToUniformBand(
  source: TacticalShapeMeasuredBand,
  bandKey: string,
): TacticalShapeMeasuredBand {
  const uniform = round(
    (source.band.goalkeeper + source.band.defense + source.band.midfield + source.band.attack) / 4,
  );

  return {
    ...source,
    band: { bandKey, goalkeeper: uniform, defense: uniform, midfield: uniform, attack: uniform },
  };
}

function medianIndex(division: readonly RankedClub[]): number {
  return Math.floor(division.length / 2);
}

function round(value: number): number {
  return Math.round(value * 10_000) / 10_000;
}
